const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'css', 'style.css');
if (fs.existsSync(cssPath)) {
  const css = fs.readFileSync(cssPath, 'utf8');
  const index = css.indexOf('cert-grid { display: grid;');
  if (index !== -1) {
    console.log(css.substring(index - 50, index + 1500));
  } else {
    console.log('cert-grid not found');
  }
}
