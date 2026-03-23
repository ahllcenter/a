const express = require('express');
const { supabase } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// POST /api/messages — Admin sends a message
router.post('/', async (req, res) => {
  try {
    const { target_type, target_user_id, target_city, title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'العنوان والمحتوى مطلوبان' });
    }

    const { error } = await supabase.from('messages').insert({
      sender_type: 'admin',
      target_type: target_type || 'all',
      target_user_id: target_user_id || null,
      target_city: target_city || null,
      title: title.trim(),
      content: content.trim()
    });

    if (error) throw error;
    res.json({ message: 'تم إرسال الرسالة' });
  } catch (err) {
    console.error('Message error:', err);
    res.status(500).json({ error: 'حدث خطأ في إرسال الرسالة' });
  }
});

// GET /api/messages — User gets messages directed to them
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('city')
      .eq('id', req.userId)
      .maybeSingle();

    const { data: allMessages } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });

    const filtered = (allMessages || []).filter(msg => {
      if (msg.target_type === 'all') return true;
      if (msg.target_type === 'user' && msg.target_user_id === req.userId) return true;
      if (msg.target_type === 'city' && msg.target_city === user?.city) return true;
      return false;
    });

    res.json({ messages: filtered });
  } catch (err) {
    res.status(500).json({ error: 'حدث خطأ' });
  }
});

// GET /api/messages/all — Admin: get all sent messages
router.get('/all', async (req, res) => {
  try {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });
    res.json({ messages: data || [] });
  } catch (err) {
    res.status(500).json({ error: 'حدث خطأ' });
  }
});

module.exports = router;
