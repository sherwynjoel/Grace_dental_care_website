const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, '..', 'dist', 'js', 'main.js');
if (fs.existsSync(jsPath)) {
  const content = fs.readFileSync(jsPath, 'utf8');
  // Let's find occurrences of "insertBefore"
  let pos = 0;
  while ((pos = content.indexOf('insertBefore', pos)) !== -1) {
    console.log(`Match at ${pos}: "${content.substring(pos - 60, pos + 100)}"`);
    pos += 12;
  }
}
