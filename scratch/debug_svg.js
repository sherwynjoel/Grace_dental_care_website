const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto('http://localhost:7788/');
    
    // Complete the quiz
    // Let's click the first option for all 5 questions
    for (let i = 0; i < 5; i++) {
      const option = await page.waitForSelector('.dhs__q.active .dhs__opt');
      await option.click();
      await page.waitForTimeout(500); // Wait for transition
    }

    // Wait for the result card to be visible
    await page.waitForSelector('#dhsResult', { state: 'visible' });

    // Let's get the bounding box of the SVG
    const svg = await page.$('.dhs__ring');
    const box = await svg.boundingBox();
    console.log('SVG Bounding Box:', box);

    // Let's get the computed styles
    const computedStyles = await page.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        width: styles.width,
        height: styles.height,
        display: styles.display,
        maxHeight: styles.maxHeight,
        maxWidth: styles.maxWidth,
        boxSizing: styles.boxSizing
      };
    }, svg);
    console.log('SVG Computed Styles:', computedStyles);

    // Let's get the outer HTML of the result container
    const resultHtml = await page.evaluate(el => el.outerHTML, await page.$('#dhsResult'));
    console.log('Result Container HTML:', resultHtml);

  } catch (e) {
    console.error('Error during debugging:', e);
  } finally {
    await browser.close();
  }
})();
