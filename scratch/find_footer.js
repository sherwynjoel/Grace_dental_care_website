const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'index.html');
if (fs.existsSync(htmlPath)) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const index = html.toLowerCase().indexOf('footer');
  if (index !== -1) {
    console.log('FOUND FOOTER IN HTML:');
    console.log(html.substring(index - 100, index + 800));
  } else {
    console.log('NOT FOUND FOOTER IN HTML');
  }
}
