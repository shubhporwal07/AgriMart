const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:/Users/prana/.gemini/antigravity/brain/ca9c2629-ab51-46e1-b2ec-9750707c2a79';
const SCREENSHOT_DIR = path.join(__dirname, '../../screenshots');

function saveScreenshot(sourcePath, filename) {
  const destPath = path.join(ARTIFACTS_DIR, filename);
  try {
    fs.copyFileSync(sourcePath, destPath);
  } catch (err) {}
}

async function run() {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  try {
    await page.goto('http://localhost:3002/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1200));

    // Close location modal by setting localStorage or clicking close button
    await page.evaluate(() => {
      localStorage.setItem('agrimart_user_location', JSON.stringify({
        address: 'LPU Campus / Law Gate (Hub Location)',
        distanceKm: 0.1,
        isServiceable: true,
      }));
      sessionStorage.setItem('agrimart_location_modal_dismissed', 'true');
    });

    // Close location modal if open
    await page.evaluate(() => {
      const closeButtons = Array.from(document.querySelectorAll('button'));
      const xBtn = closeButtons.find(b => b.innerText.includes('×') || b.getAttribute('aria-label')?.includes('Close'));
      if (xBtn) xBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // Click on the first Hero Deal card
    await page.evaluate(() => {
      const heroCards = Array.from(document.querySelectorAll('.lg\\:col-span-4 > div'));
      if (heroCards[0]) heroCards[0].click();
    });
    await new Promise(r => setTimeout(r, 1200));

    const s68 = path.join(SCREENSHOT_DIR, '68-hero-deal-product-details-modal-open.png');
    await page.screenshot({ path: s68 });
    saveScreenshot(s68, '68-hero-deal-product-details-modal-open.png');
    console.log('✅ Captured clean product details modal open');
  } finally {
    await browser.close();
  }
}

run();
