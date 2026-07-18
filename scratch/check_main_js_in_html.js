const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'index.html');
if (fs.existsSync(htmlPath)) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  let pos = 0;
  while ((pos = html.indexOf('main.js', pos)) !== -1) {
    console.log(html.substring(pos - 50, pos + 100));
    pos += 7;
  }
}
