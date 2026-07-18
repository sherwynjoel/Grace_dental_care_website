const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const distDir = path.join(__dirname, '..', 'dist');
const files = fs.readdirSync(distDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const filePath = path.join(distDir, file);
  const html = fs.readFileSync(filePath, 'utf8');

  // Load the page in JSDOM with scripts enabled
  const dom = new JSDOM(html, {
    url: `http://localhost/${file}`,
    runScripts: 'dangerously',
    resources: 'usable',
    beforeParse(window) {
      // Mock APIs that are missing in JSDOM
      window.IntersectionObserver = class IntersectionObserver {
        constructor() {}
        observe() {}
        unobserve() {}
        disconnect() {}
      };
      window.MutationObserver = class MutationObserver {
        constructor(cb) { this.cb = cb; }
        observe() {}
        disconnect() {}
      };
      window.scrollTo = () => {};
      window.requestAnimationFrame = (cb) => setTimeout(cb, 16);
      
      // Catch unhandled errors
      window.addEventListener('error', (event) => {
        console.error(`ERROR in ${file}:`, event.error ? event.error.stack : event.message);
      });
    }
  });

  // Since JSDOM load script tags asynchronously, we wait for a bit
  setTimeout(() => {
    dom.window.close();
  }, 100);
});

console.log('Script validation started. Errors will print below if any occur.');
