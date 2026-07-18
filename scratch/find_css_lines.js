const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'css', 'style.css');
if (fs.existsSync(cssPath)) {
  const css = fs.readFileSync(cssPath, 'utf8');
  const lines = css.split('\n');
  lines.forEach((line, index) => {
    if (line.includes('cert-card') && line.includes('rotateY')) {
      console.log(`Line ${index + 1}: ${line}`);
    }
  });
}
