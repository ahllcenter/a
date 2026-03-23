/**
 * Seed the new admin account: drm@anbar.com / anbar2026
 * Run once: node server/seed-admin.js
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { supabase } = require('./db');

async function seedAdmin() {
  const email = 'drm@anbar.com';
  const password = 'anbar2026';
  const name = 'مدير النظام';

  console.log('Seeding admin account...');

  const passwordHash = await bcrypt.hash(password, 10);

  // Check if admin already exists (by email or a known phone placeholder)
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('phone', email)
    .maybeSingle();

  if (existing) {
    // Update existing
    await supabase
      .from('users')
      .update({ name, password_hash: passwordHash, is_admin: true, is_verified: true })
      .eq('phone', email);
    console.log('Admin account updated:', email);
  } else {
    // Insert new
    await supabase
      .from('users')
      .insert({
        name,
        phone: email,
        city: 'الرمادي',
        password_hash: passwordHash,
        is_admin: true,
        is_verified: true,
        last_seen: new Date().toISOString()
      });
    console.log('Admin account created:', email);
  }

  console.log('Done.');
  process.exit(0);
}

seedAdmin().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
