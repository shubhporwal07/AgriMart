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
  console.log('🚀 Testing Standard Delivery Order flow...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--window-size=1280,850'],
    defaultViewport: { width: 1280, height: 850 },
  });

  const page = await browser.newPage();

  try {
    // 1. Visit Cart
    await page.goto('http://localhost:3002/dashboard', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1000));

    // Add item
    await page.evaluate(() => {
      const addBtns = Array.from(document.querySelectorAll('button')).filter(
        (b) => b.innerText.trim() === 'ADD' || b.innerText.includes('ADD TO')
      );
      if (addBtns.length > 0) addBtns[0].click();
    });
    await new Promise((r) => setTimeout(r, 800));

    await page.goto('http://localhost:3002/cart', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1200));

    // Select Standard Delivery
    await page.waitForSelector('#delivery-type-standard-btn', { timeout: 5000 });
    await page.click('#delivery-type-standard-btn');
    await new Promise((r) => setTimeout(r, 600));

    // Proceed to Delivery & Payment
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const proceed = buttons.find((b) => b.innerText.includes('Proceed to Delivery'));
      if (proceed) proceed.click();
    });
    await new Promise((r) => setTimeout(r, 800));

    // Fill customer address
    const nameInput = await page.$('input[placeholder*="full name"]');
    if (nameInput) await nameInput.type('Harpreet Kaur');

    const phoneInput = await page.$('input[placeholder*="mobile"]');
    if (phoneInput) await phoneInput.type('9888123456');

    const streetInput = await page.$('input[placeholder*="Street"], input[placeholder*="Model Town"]');
    if (streetInput) {
      await streetInput.click({ clickCount: 3 });
      await streetInput.type('Chahal Nagar, Phagwara');
    }

    const pinInput = await page.$('input[placeholder*="PIN"]');
    if (pinInput) {
      await pinInput.click({ clickCount: 3 });
      await pinInput.type('144402');
    }
    await new Promise((r) => setTimeout(r, 500));

    // Place COD Order
    await page.click('#pay-submit-btn');

    await page.waitForSelector('text/Order Confirmed', { timeout: 12000 });
    await new Promise((r) => setTimeout(r, 1000));

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '26-order-confirmed-standard-delivery.png') });
    copyToArtifacts('26-order-confirmed-standard-delivery.png');
    console.log('📸 Captured 26-order-confirmed-standard-delivery.png');

    console.log('✅ STANDARD DELIVERY ORDER TEST COMPLETED!');
  } catch (err) {
    console.error('❌ Error during standard delivery test:', err);
  } finally {
    await browser.close();
  }
})();
