const fs = require('fs');
const path = require('path');

const distHtmlPath = path.join(__dirname, '..', 'dist', 'index.html');
if (fs.existsSync(distHtmlPath)) {
  const html = fs.readFileSync(distHtmlPath, 'utf8');
  const index = html.indexOf('dhs__ring');
  if (index !== -1) {
    console.log('FOUND IN DIST/INDEX.HTML:');
    console.log(html.substring(index - 100, index + 300));
  } else {
    console.log('NOT FOUND IN DIST/INDEX.HTML');
  }
} else {
  console.log('DIST/INDEX.HTML DOES NOT EXIST');
}
