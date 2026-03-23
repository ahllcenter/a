/**
 * Create the isolated 'admins' table and seed initial admin accounts.
 * Run once: node server/create-admins-table.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');
const { supabase } = require('./db');

async function createAdminsTable() {
  console.log('Creating admins table via RPC...');

  // Create the admins table using raw SQL via Supabase
  const { error: createErr } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        last_login TIMESTAMPTZ
      );
    `
  });

  if (createErr) {
    // If RPC doesn't exist, try direct SQL via REST
    console.log('RPC not available, trying direct table creation via insert...');
    // We'll create table by inserting directly — Supabase may need table created via dashboard
    console.log('');
    console.log('⚠️  Please create the admins table manually in Supabase SQL Editor:');
    console.log('');
    console.log(`CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);`);
    console.log('');
    console.log('Then re-run this script to seed the admin accounts.');
  }

  // Seed admin accounts
  console.log('Seeding admin accounts...');

  const admins = [
    { email: 'admin@iraq.com', password: 'Ahmed2026', name: 'مدير النظام الرئيسي', role: 'super_admin' },
    { email: 'drm@anbar.com', password: 'anbar2026', name: 'مدير النظام', role: 'super_admin' },
  ];

  for (const admin of admins) {
    const passwordHash = await bcrypt.hash(admin.password, 10);

    const { data: existing } = await supabase
      .from('admins')
      .select('id')
      .eq('email', admin.email)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('admins')
        .update({ password_hash: passwordHash, name: admin.name, role: admin.role })
        .eq('email', admin.email);
      console.log(`  Updated: ${admin.email} (${admin.role})`);
    } else {
      const { error: insertErr } = await supabase
        .from('admins')
        .insert({ email: admin.email, password_hash: passwordHash, name: admin.name, role: admin.role });
      if (insertErr) {
        console.error(`  Failed to insert ${admin.email}:`, insertErr.message);
        if (insertErr.message.includes('relation') || insertErr.message.includes('does not exist')) {
          console.log('  → Table does not exist yet. Create it in Supabase SQL Editor first.');
          process.exit(1);
        }
      } else {
        console.log(`  Created: ${admin.email} (${admin.role})`);
      }
    }
  }

  console.log('Done.');
  process.exit(0);
}

createAdminsTable().catch(err => {
  console.error('Setup failed:', err);
  process.exit(1);
});
