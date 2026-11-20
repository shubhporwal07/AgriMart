const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const SCREENSHOT_DIR = path.join(__dirname, '../../screenshots');
const ARTIFACT_DIR = 'C:\\Users\\prana\\.gemini\\antigravity\\brain\\ca9c2629-ab51-46e1-b2ec-9750707c2a79';

function copyToArtifacts(filename) {
  const src = path.join(SCREENSHOT_DIR, filename);
  const dest = path.join(ARTIFACT_DIR, filename);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
}

(async () => {
  console.log('🚀 Capturing clean catalog, product modal, and admin modal in Chrome...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--window-size=1280,850'],
    defaultViewport: { width: 1280, height: 850 },
  });

  const page = await browser.newPage();

  try {
    // 1. Visit Dashboard and ensure location modal is dismissed
    console.log('Navigating to Dashboard...');
    await page.goto('http://localhost:3002/dashboard', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1000));

    // Dismiss location modal if open
    await page.evaluate(() => {
      const closeButtons = Array.from(document.querySelectorAll('button'));
      const closeX = closeButtons.find(b => b.getAttribute('aria-label') === 'Close modal' || b.innerText.trim() === 'close' || b.innerText.includes('✕'));
      if (closeX) closeX.click();
    });
    await new Promise((r) => setTimeout(r, 1000));

    // Screenshot catalog with products and weight badges
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '27-catalog-with-photos-and-weights.png') });
    copyToArtifacts('27-catalog-with-photos-and-weights.png');
    console.log('📸 Captured 27-catalog-with-photos-and-weights.png');

    // 2. Open Product Details Modal
    console.log('Opening Product Details Modal...');
    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('h3'));
      // Find second product or first product
      if (cards.length > 1) cards[1].click();
      else if (cards.length > 0) cards[0].click();
    });
    await new Promise((r) => setTimeout(r, 1000));

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '28-product-details-measurement-modal.png') });
    copyToArtifacts('28-product-details-measurement-modal.png');
    console.log('📸 Captured 28-product-details-measurement-modal.png');

    // 3. Log in to Admin Console and open Add Product Modal
    console.log('Logging in to Admin Console...');
    await page.goto('http://localhost:3002/admin', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 800));

    const userInput = await page.$('input[placeholder*="admin"]');
    if (userInput) await userInput.type('admin');

    const passInput = await page.$('input[type="password"]');
    if (passInput) await passInput.type('admin9876');

    // Click submit
    await page.evaluate(() => {
      const submitBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Enter AgriMart Console'));
      if (submitBtn) submitBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1500));

    // In Admin Panel, click Add Product
    console.log('Opening Add Product modal in Admin Panel...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const addBtn = btns.find(b => b.innerText.includes('Add New Product') || b.innerText.includes('Add Product'));
      if (addBtn) addBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1000));

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '29-admin-add-product-kg-litre-options.png') });
    copyToArtifacts('29-admin-add-product-kg-litre-options.png');
    console.log('📸 Captured 29-admin-add-product-kg-litre-options.png');

    console.log('✅ ALL SCREENSHOTS RE-CAPTURED CLEANLY!');
  } catch (err) {
    console.error('❌ Error during capture:', err);
  } finally {
    await browser.close();
  }
})();
