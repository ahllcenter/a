const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const { supabase } = require('../db');

const router = express.Router();

// POST /api/auth/register — Register + send OTP via OTPiq (WhatsApp)
router.post('/register', async (req, res) => {
  try {
    const { name, phone, city, password, lat, lng } = req.body;

    if (!name || !phone || !city || !password) {
      return res.status(400).json({ error: 'الاسم ورقم الهاتف والمدينة وكلمة المرور مطلوبة' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (!/^964\d{10}$/.test(cleanPhone)) {
      return res.status(400).json({ error: 'رقم الهاتف يجب أن يبدأ بـ 964 ويتكون من 13 رقم' });
    }

    // Check if user already exists and is verified
    const { data: existing } = await supabase
      .from('users')
      .select('id, is_verified')
      .eq('phone', cleanPhone)
      .maybeSingle();

    if (existing && existing.is_verified) {
      return res.status(400).json({ error: 'هذا الرقم مسجل بالفعل. استخدم تسجيل الدخول' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 5 * 60 * 1000;
    const passwordHash = await bcrypt.hash(password, 10);

    // Check if this is the first user — make them admin
    const { count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    const isFirstUser = (count === 0);

    if (existing) {
      // Update unverified user
      await supabase
        .from('users')
        .update({ name, city, lat: lat || null, lng: lng || null, password_hash: passwordHash, otp_code: otp, otp_expires: otpExpires, is_admin: isFirstUser || undefined })
        .eq('phone', cleanPhone);
    } else {
      // Create new user
      await supabase
        .from('users')
        .insert({ name, phone: cleanPhone, city, lat: lat || null, lng: lng || null, password_hash: passwordHash, otp_code: otp, otp_expires: otpExpires, is_admin: isFirstUser });
    }

    try {
      await axios.post('https://api.otpiq.com/api/sms', {
        phoneNumber: cleanPhone, smsType: 'verification',
        provider: 'whatsapp-sms', verificationCode: otp
      }, { headers: { 'Authorization': `Bearer ${process.env.OTPIQ_API_KEY}`, 'Content-Type': 'application/json' } });
    } catch (smsErr) { console.error('OTPiq error:', smsErr.message); }

    res.json({ message: 'تم إرسال رمز التحقق عبر واتساب' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'حدث خطأ في التسجيل' });
  }
});

// POST /api/auth/verify-otp — Verify OTP, set password, issue JWT
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, code } = req.body;
    if (!phone || !code) {
      return res.status(400).json({ error: 'رقم الهاتف ورمز التحقق مطلوبان' });
    }

    const cleanPhone = phone.replace(/\D/g, '');
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('phone', cleanPhone)
      .maybeSingle();

    if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });
    if (user.otp_code !== code) return res.status(400).json({ error: 'رمز التحقق غير صحيح' });
    if (Date.now() > user.otp_expires) return res.status(400).json({ error: 'رمز التحقق منتهي الصلاحية' });

    // Mark as verified, clear OTP
    await supabase
      .from('users')
      .update({ is_verified: true, otp_code: null, otp_expires: null, last_seen: new Date().toISOString() })
      .eq('phone', cleanPhone);

    const token = jwt.sign(
      { id: user.id, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id: user.id, name: user.name, phone: user.phone,
        city: user.city, lat: user.lat, lng: user.lng,
        is_admin: user.is_admin
      }
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ error: 'حدث خطأ في التحقق' });
  }
});

// POST /api/auth/login — Login with phone + password (no OTP)
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ error: 'رقم الهاتف وكلمة المرور مطلوبان' });
    }

    const cleanPhone = phone.replace(/\D/g, '');
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('phone', cleanPhone)
      .maybeSingle();

    if (!user || !user.is_verified) {
      return res.status(401).json({ error: 'رقم الهاتف غير مسجل أو غير مفعّل' });
    }

    if (!user.password_hash) {
      return res.status(401).json({ error: 'لم يتم تعيين كلمة مرور. يرجى إعادة التسجيل' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'كلمة المرور غير صحيحة' });
    }

    // Update last_seen
    await supabase
      .from('users')
      .update({ last_seen: new Date().toISOString() })
      .eq('phone', cleanPhone);

    const token = jwt.sign(
      { id: user.id, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id: user.id, name: user.name, phone: user.phone,
        city: user.city, lat: user.lat, lng: user.lng,
        is_admin: user.is_admin
      }
    });
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
