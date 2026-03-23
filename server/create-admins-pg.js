/**
 * Create admins table using direct Postgres connection.
 * Run: node server/create-admins-pg.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

// Supabase direct connection (without pooler)
const ref = new URL(process.env.SUPABASE_URL).hostname.split('.')[0];
// Direct connection to the Supabase Postgres instance
const connectionString = `postgresql://postgres:${process.env.SUPABASE_SERVICE_KEY}@db.${ref}.supabase.co:5432/postgres`;

async function run() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  
  try {
    console.log('Connecting to Supabase Postgres...');
    await client.connect();
    console.log('Connected!');

    // Create admins table
    console.log('Creating admins table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'admin',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        last_login TIMESTAMPTZ
      );
    `);
    console.log('Table created!');

    // Grant access
    await client.query(`
      GRANT ALL ON admins TO service_role;
      GRANT ALL ON admins TO authenticated;
      GRANT ALL ON admins TO anon;
      GRANT USAGE, SELECT ON SEQUENCE admins_id_seq TO service_role;
      GRANT USAGE, SELECT ON SEQUENCE admins_id_seq TO authenticated;
      GRANT USAGE, SELECT ON SEQUENCE admins_id_seq TO anon;
    `);
    console.log('Permissions granted!');

    // Seed admin accounts
    const admins = [
      { email: 'admin@iraq.com', password: 'Ahmed2026', name: 'مدير النظام الرئيسي', role: 'super_admin' },
      { email: 'drm@anbar.com', password: 'anbar2026', name: 'مدير النظام', role: 'super_admin' },
    ];

    for (const admin of admins) {
      const passwordHash = await bcrypt.hash(admin.password, 10);
      
      const { rows } = await client.query('SELECT id FROM admins WHERE email = $1', [admin.email]);
      
      if (rows.length > 0) {
        await client.query(
          'UPDATE admins SET password_hash = $1, name = $2, role = $3 WHERE email = $4',
          [passwordHash, admin.name, admin.role, admin.email]
        );
        console.log('  Updated:', admin.email, '(' + admin.role + ')');
      } else {
        await client.query(
          'INSERT INTO admins (email, password_hash, name, role) VALUES ($1, $2, $3, $4)',
          [admin.email, passwordHash, admin.name, admin.role]
        );
        console.log('  Created:', admin.email, '(' + admin.role + ')');
      }
    }

    console.log('Done!');
  } catch (err) {
    console.error('Error:', err.message);
    
    // If connection failed, try different pooler regions
    if (err.message.includes('connect') || err.message.includes('ENOTFOUND')) {
      console.log('');
      console.log('Connection failed. The pooler region might be different. Try:');
      console.log('  aws-0-us-east-1, aws-0-us-west-1, aws-0-ap-southeast-1');
    }
  } finally {
    await client.end();
    process.exit(0);
  }
}

run();
