const fs = require('fs');

async function test() {
  try {
    const fileBuf = fs.readFileSync('test_resume.pdf');
    const blob = new Blob([fileBuf], { type: 'application/pdf' });
    const fd = new FormData();
    fd.append('file', blob, 'test.pdf');
    
    // Use node 18+ native fetch
    const res = await fetch('http://127.0.0.1:5005/api/extract', {
      method: 'POST',
      body: fd
    });
    
    console.log('STATUS:', res.status, res.statusText);
    const txt = await res.text();
    console.log('BODY:', txt.substring(0, 500));
  } catch(e) {
    console.error('ERROR:', e.message);
  }
}

test();
