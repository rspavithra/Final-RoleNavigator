const http = require('http');
const req = http.request({ hostname: 'localhost', port: 5000, path: '/debug-status', method: 'GET' }, res => {
  console.log('status', res.statusCode);
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('body', body);
    process.exit(0);
  });
});
req.on('error', err => { console.error('request error', err); process.exit(1); });
req.end();
