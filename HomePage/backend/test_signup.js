const http = require('http');
const data = JSON.stringify({ name: 'Test User', email: 'test123@example.com', password: 'abc123' });
const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/signup',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}, (res) => {
  console.log('status', res.statusCode);
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('body', body);
    process.exit(0);
  });
});
req.on('error', (err) => { console.error('request error', err); process.exit(1); });
req.write(data);
req.end();
