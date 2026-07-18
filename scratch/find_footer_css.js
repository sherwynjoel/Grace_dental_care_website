const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'css', 'style.css');
if (fs.existsSync(cssPath)) {
  const css = fs.readFileSync(cssPath, 'utf8');
  let pos = 0;
  while ((pos = css.indexOf('footer__logo', pos)) !== -1) {
    console.log(`CSS match at index ${pos}: "${css.substring(pos, pos + 300)}"`);
    pos += 12;
  }
}
