require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const { getDb } = require('./db');

const authRoutes = require('./routes/auth');
const alertRoutes = require('./routes/alerts');
const locationRoutes = require('./routes/location');
const adminRoutes = require('./routes/admin');
const inquiryRoutes = require('./routes/inquiries');
const reportRoutes = require('./routes/reports');
const messageRoutes = require('./routes/messages');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/messages', messageRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Export app for serverless usage
module.exports = app;

// Start server only when run directly (not imported)
if (require.main === module) {
  getDb().then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Anbar Beacon Server running on http://localhost:${PORT}`);
    });
  }).catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
}
