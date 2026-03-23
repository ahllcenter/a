const express = require('express');
const jwt = require('jsonwebtoken');
const { supabase } = require('../db');

const router = express.Router();

// POST /api/admin/login — Admin login with username/password
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'اسم المستخدم وكلمة المرور مطلوبان' });
    }
    if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }
    const token = jwt.sign(
      { admin: true, username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token, admin: { username } });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'حدث خطأ' });
  }
});

// GET /api/admin/verify — Verify admin token
router.get('/verify', (req, res) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'غير مصرح' });
  }
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    if (!payload.admin) return res.status(403).json({ error: 'ليس مدير' });
    res.json({ admin: { username: payload.username } });
  } catch {
    return res.status(401).json({ error: 'رمز غير صالح' });
  }
});

// Middleware: require admin token for all routes below
function requireAdmin(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'غير مصرح' });
  }
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    if (!payload.admin) return res.status(403).json({ error: 'ليس مدير' });
    req.adminUser = payload.username;
    next();
  } catch {
    return res.status(401).json({ error: 'رمز غير صالح' });
  }
}

// GET /api/admin/stats
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const { count: totalUsers } = await supabase
      .from('users').select('*', { count: 'exact', head: true }).eq('is_verified', true);
    const { count: totalAlerts } = await supabase
      .from('alerts').select('*', { count: 'exact', head: true });
    const { count: activeAlerts } = await supabase
      .from('alerts').select('*', { count: 'exact', head: true }).eq('is_active', true);

    // Users per city
    const { data: usersData } = await supabase
      .from('users').select('city').eq('is_verified', true);
    const cityMap = {};
    (usersData || []).forEach(u => { cityMap[u.city] = (cityMap[u.city] || 0) + 1; });
    const cityCounts = Object.entries(cityMap)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count);

    res.json({
      stats: {
        totalUsers: totalUsers || 0,
        totalAlerts: totalAlerts || 0,
        activeAlerts: activeAlerts || 0,
        cityCounts
      }
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'حدث خطأ' });
  }
});

// GET /api/admin/users
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const { data: users } = await supabase
      .from('users')
      .select('id, name, phone, city, lat, lng, is_verified, created_at, last_seen')
      .order('created_at', { ascending: false });
    res.json({ users: users || [] });
  } catch (err) {
    res.status(500).json({ error: 'حدث خطأ' });
  }
});

module.exports = router;
