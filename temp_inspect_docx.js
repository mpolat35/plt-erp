const fs = require('fs');
const files = ['Analiz - bildirim.docx', 'Analiz - Chatgpt.docx'];
files.forEach(fn => {
  try {
    const buf = fs.readFileSync(fn);
    console.log(fn, buf.slice(0, 8).toString('hex'), buf.length);
  } catch (err) {
    console.error('ERROR', fn, err.message);
  }
});
