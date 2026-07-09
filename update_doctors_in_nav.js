const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const ROOT_DIR = __dirname;

function getAllHtmlFiles(dir, filesList = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const res = path.resolve(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== '.git') {
        getAllHtmlFiles(res, filesList);
      }
    } else if (entry.name.endsWith('.html')) {
      filesList.push(res);
    }
  }
  return filesList;
}

const htmlFiles = getAllHtmlFiles(ROOT_DIR);
console.log(`Found ${htmlFiles.length} HTML files to update.`);

for (const filePath of htmlFiles) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(ROOT_DIR, filePath);
  const isInSubdir = relativePath.startsWith(`treatments${path.sep}`) || relativePath.startsWith('treatments/');

  const $ = cheerio.load(fileContent, { decodeEntities: false });

  // Update desktop dropdown
  const desktopMenu = $('.navbar__dropdown-menu').filter((i, el) => {
    return $(el).find('a[href*="dr-sherin"]').length > 0;
  });

  if (desktopMenu.length > 0) {
    const sherinHref = isInSubdir ? '../dr-sherin' : 'dr-sherin';
    const induHref = isInSubdir ? '../dr-indu' : 'dr-indu';
    const nandanaHref = isInSubdir ? '../dr-nandana' : 'dr-nandana';

    desktopMenu.html(`
        <a href="${sherinHref}">Dr. Sherin Grace Babu</a>
        <a href="${induHref}">Dr. Indu S.</a>
        <a href="${nandanaHref}">Dr. Nandana Jayachandran</a>
    `);
  }

  // Update mobile dropdown
  const mobileMenu = $('.navbar__mobile-dropdown-menu').filter((i, el) => {
    return $(el).find('a[href*="dr-sherin"]').length > 0;
  });

  if (mobileMenu.length > 0) {
    const sherinHref = isInSubdir ? '../dr-sherin' : 'dr-sherin';
    const induHref = isInSubdir ? '../dr-indu' : 'dr-indu';
    const nandanaHref = isInSubdir ? '../dr-nandana' : 'dr-nandana';

    mobileMenu.html(`
        <a href="${sherinHref}" class="navbar__mobile-dropdown-link">Dr. Sherin Grace Babu</a>
        <a href="${induHref}" class="navbar__mobile-dropdown-link">Dr. Indu S.</a>
        <a href="${nandanaHref}" class="navbar__mobile-dropdown-link">Dr. Nandana Jayachandran</a>
    `);
  }

  if (desktopMenu.length > 0 || mobileMenu.length > 0) {
    fs.writeFileSync(filePath, $.html(), 'utf8');
    console.log(`✓ Updated nav in ${relativePath}`);
  }
}

console.log('Finished updating doctor dropdowns!');
