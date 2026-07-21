const fs = require('fs');
const file = 'treatments.html';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/href="index"/g, 'href="./"');
fs.writeFileSync(file, content, 'utf8');
console.log('Fixed treatments.html');
