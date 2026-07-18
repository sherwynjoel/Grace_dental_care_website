/**
 * Build script for Grace Dental Care static site.
 * - Cleans dist/
 * - Copies and minifies HTML, CSS, JS
 * - Copies assets as-is
 * - Creates dist.zip
 */

const fs   = require('fs');
const path = require('path');

const CleanCSS          = require('clean-css');
const { minify: minifyJS }   = require('terser');
const { minify: minifyHTML } = require('html-minifier-terser');
const archiver = require('archiver');

const SRC  = __dirname;
const DIST = path.join(__dirname, 'dist');
const ZIP  = path.join(__dirname, 'dist.zip');

const HTML_FILES = fs.readdirSync(SRC).filter(f => f.endsWith('.html'));
const COPY_DIRS  = ['assets', 'admin'];
const COPY_FILES = ['robots.txt', 'sitemap.xml', 'manifest.json', '.htaccess', 'blog.php', 'blog-post.php', 'blogs.json'];

// ── Helpers ────────────────────────────────────────────────
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyDir(src, dest) {
  ensureDir(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    entry.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
}

function formatBytes(b) {
  return b > 1024 * 1024
    ? (b / 1024 / 1024).toFixed(1) + ' MB'
    : (b / 1024).toFixed(1) + ' KB';
}

function stat(file) {
  try { return fs.statSync(file).size; } catch { return 0; }
}

// ── Clean dist ─────────────────────────────────────────────
console.log('\n🔨 Grace Dental Care — Build\n');
if (fs.existsSync(DIST)) fs.rmSync(DIST, { recursive: true, force: true });
ensureDir(DIST);
console.log('✓  dist/ cleaned');

// ── CSS ────────────────────────────────────────────────────
ensureDir(path.join(DIST, 'css'));
const cssIn  = path.join(SRC, 'css', 'style.css');
const cssOut = path.join(DIST, 'css', 'style.css');
const cssRaw = fs.readFileSync(cssIn, 'utf8');
const cssMin = new CleanCSS({ level: 2 }).minify(cssRaw).styles;
fs.writeFileSync(cssOut, cssMin);
const cssSaving = Math.round((1 - cssMin.length / cssRaw.length) * 100);
console.log(`✓  css/style.css   ${formatBytes(cssRaw.length)} → ${formatBytes(cssMin.length)}  (${cssSaving}% smaller)`);

const cssIn2  = path.join(SRC, 'css', 'treatment-page.css');
const cssOut2 = path.join(DIST, 'css', 'treatment-page.css');
if (fs.existsSync(cssIn2)) {
  const cssRaw2 = fs.readFileSync(cssIn2, 'utf8');
  const cssMin2 = new CleanCSS({ level: 2 }).minify(cssRaw2).styles;
  fs.writeFileSync(cssOut2, cssMin2);
  const cssSaving2 = Math.round((1 - cssMin2.length / cssRaw2.length) * 100);
  console.log(`✓  css/treatment-page.css   ${formatBytes(cssRaw2.length)} → ${formatBytes(cssMin2.length)}  (${cssSaving2}% smaller)`);
}

// ── JS ─────────────────────────────────────────────────────
ensureDir(path.join(DIST, 'js'));
(async () => {
  const jsIn  = path.join(SRC, 'js', 'main.js');
  const jsOut = path.join(DIST, 'js', 'main.js');
  const jsRaw = fs.readFileSync(jsIn, 'utf8');
  const jsResult = await minifyJS(jsRaw, {
    compress: { drop_console: false, passes: 2 },
    mangle: true,
    format: { comments: false }
  });
  const jsMin = jsResult.code;
  fs.writeFileSync(jsOut, jsMin);
  const jsSaving = Math.round((1 - jsMin.length / jsRaw.length) * 100);
  console.log(`✓  js/main.js      ${formatBytes(jsRaw.length)} → ${formatBytes(jsMin.length)}  (${jsSaving}% smaller)`);

  // ── HTML ──────────────────────────────────────────────────
  const htmlOptions = {
    collapseWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    useShortDoctype: true,
    minifyCSS: true,
    minifyJS: true
  };

  let totalHtmlRaw = 0, totalHtmlMin = 0;
  let totalHtmlFilesCount = 0;
  for (const file of HTML_FILES) {
    const raw = fs.readFileSync(path.join(SRC, file), 'utf8');
    const min = await minifyHTML(raw, htmlOptions);
    fs.writeFileSync(path.join(DIST, file), min);
    totalHtmlRaw += raw.length;
    totalHtmlMin += min.length;
    totalHtmlFilesCount++;
  }

  // Handle treatments subdirectory
  const treatmentsSrc = path.join(SRC, 'treatments');
  const treatmentsDest = path.join(DIST, 'treatments');
  if (fs.existsSync(treatmentsSrc)) {
    ensureDir(treatmentsDest);
    const treatmentFiles = fs.readdirSync(treatmentsSrc).filter(f => f.endsWith('.html'));
    for (const file of treatmentFiles) {
      const raw = fs.readFileSync(path.join(treatmentsSrc, file), 'utf8');
      const min = await minifyHTML(raw, htmlOptions);
      fs.writeFileSync(path.join(treatmentsDest, file), min);
      totalHtmlRaw += raw.length;
      totalHtmlMin += min.length;
      totalHtmlFilesCount++;
    }
  }

  const htmlSaving = Math.round((1 - totalHtmlMin / totalHtmlRaw) * 100);
  console.log(`✓  ${totalHtmlFilesCount} HTML files     ${formatBytes(totalHtmlRaw)} → ${formatBytes(totalHtmlMin)}  (${htmlSaving}% smaller)`);

  // ── Static dirs ───────────────────────────────────────────
  for (const dir of COPY_DIRS) {
    const s = path.join(SRC, dir);
    const d = path.join(DIST, dir);
    if (fs.existsSync(s)) { copyDir(s, d); console.log(`✓  ${dir}/  copied`); }
  }

  // ── Static files ──────────────────────────────────────────
  for (const file of COPY_FILES) {
    const s = path.join(SRC, file);
    if (fs.existsSync(s)) { fs.copyFileSync(s, path.join(DIST, file)); }
  }
  console.log(`✓  static files    copied`);

  // ── Zip ───────────────────────────────────────────────────
  if (fs.existsSync(ZIP)) fs.unlinkSync(ZIP);
  await new Promise((resolve, reject) => {
    const output = fs.createWriteStream(ZIP);
    const archive = archiver('zip', { zlib: { level: 9 } });
    output.on('close', resolve);
    archive.on('error', reject);
    archive.pipe(output);
    archive.directory(DIST, false);
    archive.finalize();
  });
  const zipSize = formatBytes(stat(ZIP));
  console.log(`✓  dist.zip        ${zipSize}`);

  // ── Summary ───────────────────────────────────────────────
  console.log('\n✅  Build complete → dist/\n');
})();
