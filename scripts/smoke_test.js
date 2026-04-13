const https = require('https');
const url = 'https://kaza-web-1.vercel.app/api/healthz';

https.get(url, (res) => {
  if (res.statusCode !== 200) {
    console.error(`Smoke test failed! Status: ${res.statusCode}`);
    process.exit(1);
  }
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.status === 'ok') {
        console.log('Smoke test passed successfully! /healthz is ok.');
        process.exit(0);
      } else {
        console.error('Smoke test failed! Invalid payload:', data);
        process.exit(1);
      }
    } catch (e) {
      console.error('Smoke test failed! Could not parse JSON:', data);
      process.exit(1);
    }
  });
}).on('error', (e) => {
  console.error('Smoke test request failed:', e);
  process.exit(1);
});
