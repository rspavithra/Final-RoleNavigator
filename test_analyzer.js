const fs = require('fs');

async function testAnalyzer() {
  try {
    const fileBuf = fs.readFileSync('test_resume.pdf');
    const blob = new Blob([fileBuf], { type: 'application/pdf' });
    const fd = new FormData();
    fd.append('resume', blob, 'test.pdf');
    fd.append('jobDescription', 'flutter developer with experience in dart and state management');
    
    console.log("Sending request to 5001 analyzer...");
    const res = await fetch('http://localhost:5001/api/analyze-resume', {
      method: 'POST',
      body: fd
    });
    
    console.log('STATUS:', res.status);
    const text = await res.text();
    console.log('BODY HEAD:', text.substring(0, 500));
  } catch(e) {
    console.error('Test ERROR:', e);
  }
}

testAnalyzer();
