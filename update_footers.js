const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const treatments = [
  { name: 'Dental Implants', file: 'dental-implants' },
  { name: 'Smile Makeover', file: 'smile-makeover' },
  { name: 'Root Canal', file: 'root-canal' },
  { name: 'Braces & Aligners', file: 'braces-aligners' },
  { name: 'Laser Gum Therapy', file: 'laser-gum-therapy' },
  { name: 'Teeth Whitening', file: 'teeth-whitening' },
  { name: 'Pediatric Dentistry', file: 'pediatric-dentistry' },
  { name: 'Wisdom Tooth Removal', file: 'wisdom-tooth-removal' }
];

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
  const isInTreatmentsSubdir = relativePath.startsWith(`treatments${path.sep}`) || relativePath.startsWith('treatments/');

  const $ = cheerio.load(fileContent, { decodeEntities: false });

  // Find the column under treatments in the footer
  const treatmentsColTitle = $('p.footer__col-title').filter((i, el) => {
    return $(el).text().trim() === 'Treatments';
  });

  if (treatmentsColTitle.length > 0) {
    const ul = treatmentsColTitle.next('ul.footer__links');
    if (ul.length > 0) {
      // Clear current links
      ul.empty();

      // Add all 18 treatments
      treatments.forEach(t => {
        const href = isInTreatmentsSubdir ? t.file : `treatments/${t.file}`;
        ul.append(`<li><a href="${href}" class="footer__link">${t.name}</a></li>`);
      });

      fs.writeFileSync(filePath, $.html(), 'utf8');
      console.log(`✓ Updated footer in ${relativePath}`);
    } else {
      console.log(`✗ No ul.footer__links found next to "Treatments" col title in ${relativePath}`);
    }
  } else {
    console.log(`✗ "Treatments" column title not found in ${relativePath}`);
  }
}

console.log('Finished updating footers!');
