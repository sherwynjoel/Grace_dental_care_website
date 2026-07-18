const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, '..', 'js', 'main.js');
if (fs.existsSync(jsPath)) {
  const content = fs.readFileSync(jsPath, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    if (line.includes('injectToggle')) {
      console.log(`Line ${index + 1}: ${line.trim()}`);
    }
  });
}
