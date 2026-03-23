const express = require('express');
const jwt = require('jsonwebtoken');
const { supabase } = require('../db');

const router = express.Router();

// POST /api/auth/register — Instant registration, no OTP (zero-friction emergency onboarding)
router.post('/register', async (req, res) => {
  try {
    const { name, phone, city } = req.body;

    if (!name || !phone || !city) {
      return res.status(400).json({ error: 'الاسم ورقم الهاتف والمدينة مطلوبة' });
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (!/^964\d{10}$/.test(cleanPhone)) {
      return res.status(400).json({ error: 'رقم الهاتف يجب أن يبدأ بـ 964 ويتكون من 13 رقم' });
    }

    // Check if user already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('phone', cleanPhone)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ error: 'هذا الرقم مسجل بالفعل. استخدم تسجيل الدخول' });
    }

    // Create user — verified immediately, no OTP
    const { data: user, error: insertErr } = await supabase
      .from('users')
      .insert({ name, phone: cleanPhone, city, is_verified: true, last_seen: new Date().toISOString() })
      .select('id, name, phone, city, lat, lng, is_admin')
      .single();

    if (insertErr) throw insertErr;

    const token = jwt.sign(
      { id: user.id, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: '365d' }
    );

    res.json({ token, user });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'حدث خطأ في التسجيل' });
  }
});

// POST /api/auth/login — Instant login for existing users, no OTP
router.post('/login', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'رقم الهاتف مطلوب' });
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (!/^964\d{10}$/.test(cleanPhone)) {
      return res.status(400).json({ error: 'رقم الهاتف يجب أن يبدأ بـ 964 ويتكون من 13 رقم' });
    }

    const { data: user } = await supabase
      .from('users')
      .select('id, name, phone, city, lat, lng, is_admin')
      .eq('phone', cleanPhone)
      .maybeSingle();

    if (!user) {
      return res.status(404).json({ error: 'رقم الهاتف غير مسجل. يرجى إنشاء حساب أولاً' });
    }

    // Update last_seen
    await supabase
      .from('users')
      .update({ last_seen: new Date().toISOString() })
      .eq('phone', cleanPhone);

    const token = jwt.sign(
      { id: user.id, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: '365d' }
    );

    res.json({ token, user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'حدث خطأ في تسجيل الدخول' });
  }
});

// GET /api/auth/me — Get current user info
router.get('/me', require('../middleware/auth'), async (req, res) => {
  const { data: user } = await supabase
    .from('users')
    .select('id, name, phone, city, lat, lng, is_admin, created_at, last_seen')
    .eq('id', req.userId)
    .maybeSingle();

  if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });
  res.json({ user });
});

module.exports = router;
