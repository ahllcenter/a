/**
 * Create admins table in Supabase using the database connection.
 * Run: node server/setup-admins.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function setup() {
  // Step 1: Try inserting into admins — if table doesn't exist, create it via workaround
  console.log('Checking if admins table exists...');
  
  const { error: checkErr } = await supabase.from('admins').select('id').limit(1);
  
  if (checkErr && checkErr.message.includes('does not exist')) {
    console.log('Table does not exist. Please run this SQL in Supabase Dashboard > SQL Editor:');
    console.log('');
    console.log('='.repeat(70));
    console.log(`
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- Grant access to the service role
GRANT ALL ON admins TO service_role;
GRANT USAGE, SELECT ON SEQUENCE admins_id_seq TO service_role;
`);
    console.log('='.repeat(70));
    console.log('');
    console.log('After creating the table, run this script again to seed admin accounts.');
    process.exit(1);
  }

  console.log('Table exists! Seeding admin accounts...');

  // Step 2: Seed admin accounts
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
      console.log('  Updated:', admin.email, '(' + admin.role + ')');
    } else {
      const { error: insertErr } = await supabase
        .from('admins')
        .insert({ email: admin.email, password_hash: passwordHash, name: admin.name, role: admin.role });
      if (insertErr) {
        console.error('  Failed:', admin.email, insertErr.message);
      } else {
        console.log('  Created:', admin.email, '(' + admin.role + ')');
      }
    }
  }

  console.log('Done!');
  process.exit(0);
}

setup().catch(err => { console.error(err); process.exit(1); });
