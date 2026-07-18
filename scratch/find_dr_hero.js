const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'dr-indu.html');
if (fs.existsSync(filePath)) {
  const html = fs.readFileSync(filePath, 'utf8');
  const index = html.indexOf('class="hero');
  if (index !== -1) {
    console.log(html.substring(index - 100, index + 800));
  } else {
    console.log('Hero section not found');
  }
}
