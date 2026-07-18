const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'index.html');
if (fs.existsSync(htmlPath)) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const lines = html.split('\n');
  lines.forEach((line, index) => {
    if (line.toLowerCase().includes('footer') && line.includes('<')) {
      console.log(`Line ${index + 1}: ${line.trim()}`);
    }
  });
}
