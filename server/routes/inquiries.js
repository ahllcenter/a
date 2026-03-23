const express = require('express');
const { supabase } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// POST /api/inquiries — User submits an inquiry
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { subject, message } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ error: 'الموضوع والرسالة مطلوبان' });
    }

    const { data: user } = await supabase
      .from('users')
      .select('name, phone, city')
      .eq('id', req.userId)
      .maybeSingle();

    const { error } = await supabase.from('inquiries').insert({
      user_id: req.userId,
      user_name: user?.name,
      user_phone: user?.phone,
      user_city: user?.city,
      subject: subject.trim(),
      message: message.trim()
    });

    if (error) throw error;
    res.json({ message: 'تم إرسال استفسارك بنجاح' });
  } catch (err) {
    console.error('Inquiry error:', err);
    res.status(500).json({ error: 'حدث خطأ في إرسال الاستفسار' });
  }
});

// GET /api/inquiries — Get user's inquiries
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { data } = await supabase
      .from('inquiries')
      .select('*')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false });
    res.json({ inquiries: data || [] });
  } catch (err) {
    res.status(500).json({ error: 'حدث خطأ' });
  }
});

// GET /api/inquiries/all — Admin: get all inquiries
router.get('/all', async (req, res) => {
  try {
    const { data } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });
    res.json({ inquiries: data || [] });
  } catch (err) {
    res.status(500).json({ error: 'حدث خطأ' });
  }
});

// PUT /api/inquiries/:id/reply — Admin replies to inquiry
router.put('/:id/reply', async (req, res) => {
  try {
    const { reply } = req.body;
    if (!reply) return res.status(400).json({ error: 'الرد مطلوب' });

    const { error } = await supabase
      .from('inquiries')
      .update({
        admin_reply: reply.trim(),
        status: 'replied',
        replied_at: new Date().toISOString()
      })
      .eq('id', Number(req.params.id));

    if (error) throw error;
    res.json({ message: 'تم إرسال الرد' });
  } catch (err) {
    res.status(500).json({ error: 'حدث خطأ' });
  }
});

module.exports = router;
