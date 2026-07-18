const fs = require('fs');
const css = fs.readFileSync('css/style.css', 'utf8');

const regex = /[^{}]*svg[^{}]*\{([^}]*)\}/gi;
let match;
while ((match = regex.exec(css)) !== null) {
  console.log('MATCH:', match[0]);
}

console.log('\n--- Searching for dhs__ring ---\n');
const regexRing = /[^{}]*dhs__ring[^{}]*\{([^}]*)\}/gi;
while ((match = regexRing.exec(css)) !== null) {
  console.log('MATCH:', match[0]);
}
