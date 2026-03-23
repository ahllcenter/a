const { createClient } = require('@supabase/supabase-js');
const s = createClient(
  'https://fjgrrbthuhryrswesara.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqZ3JyYnRodWhyeXJzd2VzYXJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDIyMjgzNiwiZXhwIjoyMDg5Nzk4ODM2fQ.xrhCSv1_0xMbiwNXbEX2tNgrut_Xe6d8lQ1RLw0U_h0'
);

async function run() {
  // Use raw SQL via Supabase REST
  const { data, error } = await s.rpc('exec_sql', {
    query: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT'
  });
  if (error) {
    console.error('RPC failed, trying direct approach...');
    // Try adding via a simple update to test if column exists
    const { error: testErr } = await s
      .from('users')
      .select('password_hash')
      .limit(1);
    if (testErr && testErr.message.includes('password_hash')) {
      console.log('Column does not exist. Please add it via Supabase Dashboard SQL Editor:');
      console.log('ALTER TABLE users ADD COLUMN password_hash TEXT;');
    } else {
      console.log('Column password_hash already exists or was added.');
    }
  } else {
    console.log('Column added successfully');
  }
}
run();
