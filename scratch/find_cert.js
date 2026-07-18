const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'css', 'style.css');
const htmlPath = path.join(__dirname, '..', 'index.html');

console.log('--- Checking HTML ---');
if (fs.existsSync(htmlPath)) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  let pos = 0;
  while ((pos = html.indexOf('cert-', pos)) !== -1) {
    console.log(`HTML match at index ${pos}: "${html.substring(pos, pos + 30)}"`);
    pos += 5;
  }
}

console.log('\n--- Checking CSS ---');
if (fs.existsSync(cssPath)) {
  const css = fs.readFileSync(cssPath, 'utf8');
  let pos = 0;
  while ((pos = css.indexOf('cert-', pos)) !== -1) {
    console.log(`CSS match at index ${pos}: "${css.substring(pos, pos + 30)}"`);
    pos += 5;
  }
}
