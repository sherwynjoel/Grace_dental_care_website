const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, '..', 'dist', 'js', 'main.js');
if (fs.existsSync(jsPath)) {
  const content = fs.readFileSync(jsPath, 'utf8');
  const lines = content.split('\n');
  console.log('Total lines in dist/js/main.js:', lines.length);
  if (lines.length >= 820) {
    console.log('Line 820:', lines[819]);
  } else {
    console.log('Fewer than 820 lines.');
  }
} else {
  console.log('dist/js/main.js does not exist.');
}
