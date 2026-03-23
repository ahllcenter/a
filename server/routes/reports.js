const express = require('express');
const { supabase } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// POST /api/reports — User submits an incident report
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { report_type, title, description, lat, lng, location_label } = req.body;
    if (!report_type || !title || !description) {
      return res.status(400).json({ error: 'نوع البلاغ والعنوان والوصف مطلوبة' });
    }

    const { data: user } = await supabase
      .from('users')
      .select('name, phone, city')
      .eq('id', req.userId)
      .maybeSingle();

    const { error } = await supabase.from('reports').insert({
      user_id: req.userId,
      user_name: user?.name,
      user_phone: user?.phone,
      user_city: user?.city,
      report_type,
      title: title.trim(),
      description: description.trim(),
      lat: lat || null,
      lng: lng || null,
      location_label: location_label || null
    });

    if (error) throw error;
    res.json({ message: 'تم إرسال البلاغ بنجاح، سيتم مراجعته من قبل الإدارة' });
  } catch (err) {
    console.error('Report error:', err);
    res.status(500).json({ error: 'حدث خطأ في إرسال البلاغ' });
  }
});

// GET /api/reports — Get user's reports
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { data } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false });
    res.json({ reports: data || [] });
  } catch (err) {
    res.status(500).json({ error: 'حدث خطأ' });
  }
});

// GET /api/reports/all — Admin: get all reports
router.get('/all', async (req, res) => {
  try {
    const { data } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });
    res.json({ reports: data || [] });
  } catch (err) {
    res.status(500).json({ error: 'حدث خطأ' });
  }
});

// PUT /api/reports/:id/status — Admin updates report status
router.put('/:id/status', async (req, res) => {
  try {
    const { status, admin_notes } = req.body;
    const update = { status };
    if (admin_notes !== undefined) update.admin_notes = admin_notes;

    const { error } = await supabase
      .from('reports')
      .update(update)
      .eq('id', Number(req.params.id));

    if (error) throw error;
    res.json({ message: 'تم تحديث حالة البلاغ' });
  } catch (err) {
    res.status(500).json({ error: 'حدث خطأ' });
  }
});

module.exports = router;
