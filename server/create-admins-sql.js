/**
 * Create admins table using Supabase HTTP SQL endpoint.
 * Run: node server/create-admins-sql.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

async function run() {
  const sql = `
    CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      last_login TIMESTAMPTZ
    );
  `;

  // Use the Supabase pg-meta SQL endpoint
  const url = SUPABASE_URL + '/rest/v1/';
  
  // Try the postgrest approach: create a function first, then call it
  // Actually, let's just use direct fetch to /sql endpoint
  const sqlUrl = SUPABASE_URL.replace('.supabase.co', '.supabase.co') + '/pg';
  
  console.log('Attempting to create table via different methods...');
  
  // Method: Use the Supabase pgMeta endpoint
  const metaUrl = SUPABASE_URL + '/rest/v1/rpc/';
  
  // Since we can't run raw SQL easily, let's try the /query endpoint
  const resp = await fetch(SUPABASE_URL + '/rest/v1/', {
    method: 'GET',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': 'Bearer ' + SERVICE_KEY,
    }
  });
  console.log('Supabase REST status:', resp.status);

  // Try fetching from admins to see if it was somehow created 
  const resp2 = await fetch(SUPABASE_URL + '/rest/v1/admins?select=id&limit=1', {
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': 'Bearer ' + SERVICE_KEY,
    }
  });
  console.log('Admins table check:', resp2.status, await resp2.text());
}

run().catch(console.error);
