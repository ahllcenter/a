const fs = require('fs');
const os = require('os');
const configPath = os.homedir() + '/.config/netlify/config.json';
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const token = config.users && Object.values(config.users)[0] && Object.values(config.users)[0].auth && Object.values(config.users)[0].auth.token;

if (!token) {
  console.error('Could not find Netlify token');
  process.exit(1);
}

fetch('https://api.netlify.com/api/v1/sites/2867c294-737b-4d6d-a18e-fcd2f6677d68', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({ name: 'anbarsos2' })
}).then(r => {
  console.log('Status:', r.status);
  return r.json();
}).then(d => {
  console.log('New URL:', d.ssl_url || d.url || d.name);
  if (d.errors) console.log('Errors:', d.errors);
});
