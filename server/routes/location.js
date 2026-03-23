const express = require('express');
const { supabase } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// POST /api/location/update — Update user's current GPS location
router.post('/update', authMiddleware, async (req, res) => {
  try {
    const { lat, lng } = req.body;
    if (lat == null || lng == null) {
      return res.status(400).json({ error: 'الموقع الجغرافي مطلوب' });
    }

    await supabase
      .from('users')
      .update({ lat, lng, last_seen: new Date().toISOString() })
      .eq('id', req.userId);

    res.json({ message: 'تم تحديث الموقع' });
  } catch (err) {
    console.error('Location update error:', err);
    res.status(500).json({ error: 'حدث خطأ في تحديث الموقع' });
  }
});

module.exports = router;
