const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'index.html');
if (fs.existsSync(htmlPath)) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const index = html.indexOf('navbar__actions');
  if (index !== -1) {
    console.log(html.substring(index - 100, index + 400));
  } else {
    console.log('navbar__actions not found');
  }
}
