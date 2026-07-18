const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'index.html');
if (fs.existsSync(htmlPath)) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const lines = html.split('\n');
  // Print lines 210 to 310
  for (let i = 210; i < Math.min(310, lines.length); i++) {
    console.log(`${i + 1}: ${lines[i]}`);
  }
}
