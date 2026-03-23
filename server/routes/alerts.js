const express = require('express');
const { supabase } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Haversine distance in km
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// GET /api/alerts — Get alerts matching user's current location/city
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('city, lat, lng')
      .eq('id', req.userId)
      .maybeSingle();

    if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });

    const { data: alerts } = await supabase
      .from('alerts')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    const matched = (alerts || []).filter(alert => {
      if (alert.alert_type === 'broadcast') return true;
      if (alert.alert_type === 'city') {
        try {
          const cities = JSON.parse(alert.target_cities || '[]');
          return cities.includes(user.city);
        } catch { return false; }
      }
      if (alert.alert_type === 'geo') {
        if (user.lat != null && user.lng != null && alert.target_lat != null && alert.target_lng != null) {
          return haversineKm(user.lat, user.lng, alert.target_lat, alert.target_lng) <= (alert.target_radius_km || 10);
        }
        return false;
      }
      return false;
    });

    res.json({ alerts: matched });
  } catch (err) {
    console.error('Get alerts error:', err);
    res.status(500).json({ error: 'حدث خطأ في جلب التنبيهات' });
  }
});

// GET /api/alerts/all — Get all alerts
router.get('/all', async (req, res) => {
  try {
    const { data: alerts } = await supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false });
    res.json({ alerts: alerts || [] });
  } catch (err) {
    res.status(500).json({ error: 'حدث خطأ' });
  }
});

// POST /api/alerts — Create alert
router.post('/', async (req, res) => {
  try {
    const { title, description, category, severity, alert_type, target_lat, target_lng, target_radius_km, target_cities, location_label } = req.body;

    if (!title || !category || !severity || !alert_type) {
      return res.status(400).json({ error: 'العنوان والنوع والخطورة ونوع التنبيه مطلوبة' });
    }

    const { data, error } = await supabase
      .from('alerts')
      .insert({
        title,
        description: description || '',
        category,
        severity,
        alert_type,
        target_lat: target_lat || null,
        target_lng: target_lng || null,
        target_radius_km: target_radius_km || null,
        target_cities: target_cities ? JSON.stringify(target_cities) : null,
        location_label: location_label || ''
      })
      .select('id')
      .single();

    if (error) throw error;
    res.json({ message: 'تم إرسال التنبيه بنجاح', id: data.id });
  } catch (err) {
    console.error('Create alert error:', err);
    res.status(500).json({ error: 'حدث خطأ في إنشاء التنبيه' });
  }
});

// DELETE /api/alerts/:id — Deactivate alert
router.delete('/:id', async (req, res) => {
  try {
    await supabase
      .from('alerts')
      .update({ is_active: false })
      .eq('id', Number(req.params.id));
    res.json({ message: 'تم إلغاء التنبيه' });
  } catch (err) {
    res.status(500).json({ error: 'حدث خطأ' });
  }
});

module.exports = router;
