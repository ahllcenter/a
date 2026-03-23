const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { supabase } = require('../db');

const router = express.Router();

// POST /api/auth/register — Register + send OTP via OTPiq (WhatsApp)
router.post('/register', async (req, res) => {
  try {
    const { name, phone, city, lat, lng } = req.body;

    if (!name || !phone || !city) {
      return res.status(400).json({ error: 'الاسم ورقم الهاتف والمدينة مطلوبة' });
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

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 5 * 60 * 1000;

    if (existing && existing.is_verified) {
      // Resend OTP for login
      await supabase
        .from('users')
        .update({ otp_code: otp, otp_expires: otpExpires })
        .eq('phone', cleanPhone);

      try {
        await axios.post('https://api.otpiq.com/api/sms', {
          phoneNumber: cleanPhone, smsType: 'verification',
          provider: 'whatsapp-sms', verificationCode: otp
        }, { headers: { 'Authorization': `Bearer ${process.env.OTPIQ_API_KEY}`, 'Content-Type': 'application/json' } });
      } catch (smsErr) { console.error('OTPiq error:', smsErr.message); }

      return res.json({ message: 'تم إرسال رمز التحقق', isExisting: true });
    }

    if (existing) {
      // Update unverified user
      await supabase
        .from('users')
        .update({ name, city, lat: lat || null, lng: lng || null, otp_code: otp, otp_expires: otpExpires })
        .eq('phone', cleanPhone);
    } else {
      // Create new user
      await supabase
        .from('users')
        .insert({ name, phone: cleanPhone, city, lat: lat || null, lng: lng || null, otp_code: otp, otp_expires: otpExpires });
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

// POST /api/auth/verify-otp — Verify OTP and issue JWT
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
