const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const srcDir = path.join(__dirname, '..');
const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const filePath = path.join(srcDir, file);
  const html = fs.readFileSync(filePath, 'utf8');
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Let's run the exact same logic:
  const hero = document.querySelector('.hero__content, .hero__ctas, .hero-inner');
  if (hero) {
    const firstBtn = hero.querySelector('.btn');
    if (firstBtn) {
      try {
        const badge = document.createElement('div');
        firstBtn.parentNode.insertBefore(badge, firstBtn);
      } catch (err) {
        console.error(`ERROR in file ${file}:`, err.message);
      }
    }
  }
});
console.log('DOM check completed.');
