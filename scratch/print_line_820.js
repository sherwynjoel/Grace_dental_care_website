const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, '..', 'js', 'main.js');
if (fs.existsSync(jsPath)) {
  const content = fs.readFileSync(jsPath, 'utf8');
  const lines = content.split('\n');
  for (let i = 810; i < Math.min(840, lines.length); i++) {
    console.log(`${i + 1}: ${lines[i]}`);
  }
}
