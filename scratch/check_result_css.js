const fs = require('fs');
const css = fs.readFileSync('css/style.css', 'utf8');

const regex = /[^{}]*dhs__[^{}]*\{([^}]*)\}/gi;
let match;
while ((match = regex.exec(css)) !== null) {
  console.log('MATCH:', match[0]);
}
