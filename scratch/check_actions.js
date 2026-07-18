const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..');
const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const html = fs.readFileSync(path.join(srcDir, file), 'utf8');
  if (html.includes('navbar__actions')) {
    console.log(`Found in: ${file}`);
  }
});
console.log('Done.');
