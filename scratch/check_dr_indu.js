const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'dr-indu.html');
if (fs.existsSync(filePath)) {
  const html = fs.readFileSync(filePath, 'utf8');
  const lines = html.split('\n');
  lines.forEach((line, index) => {
    if (line.includes('hero')) {
      console.log(`Line ${index + 1}: ${line.trim()}`);
    }
  });
}
