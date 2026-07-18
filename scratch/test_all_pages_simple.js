const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..');
const files = [];

// Recursive helper to find html files
function findHtmlFiles(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== '.git') {
        findHtmlFiles(fullPath);
      }
    } else if (entry.name.endsWith('.html')) {
      files.push(fullPath);
    }
  }
}
findHtmlFiles(srcDir);

files.forEach(filePath => {
  const relPath = path.relative(srcDir, filePath);
  const html = fs.readFileSync(filePath, 'utf8');

  // Let's do a simple check:
  // Does it contain hero__content or hero__ctas or hero-inner?
  const hasHero = html.includes('hero__content') || html.includes('hero__ctas') || html.includes('hero-inner');
  if (hasHero) {
    // If it has hero, does it have btn?
    const hasBtn = html.includes('class="btn') || html.includes("class='btn") || html.includes('btn ');
    console.log(`${relPath}: hasHero=${hasHero}, hasBtn=${hasBtn}`);
  }
});
