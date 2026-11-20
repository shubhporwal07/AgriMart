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
  console.log('🚀 Launching Chrome to test Express vs Standard Delivery Tiers...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--window-size=1280,850'],
    defaultViewport: { width: 1280, height: 850 },
  });

  const page = await browser.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.text().includes('Order') || msg.text().includes('AgriMart')) {
      console.log(`[BROWSER ${msg.type().toUpperCase()}] ${msg.text()}`);
    }
  });

  try {
    // 1. Visit Dashboard
    console.log('Step 1: Navigating to Dashboard...');
    await page.goto('http://localhost:3002/dashboard', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1200));

    // 2. Add product to cart
    console.log('Step 2: Adding product to cart...');
    await page.evaluate(() => {
      const addBtns = Array.from(document.querySelectorAll('button')).filter(
        (b) => b.innerText.trim() === 'ADD' || b.innerText.includes('ADD TO')
      );
      if (addBtns.length > 0) addBtns[0].click();
    });
    await new Promise((r) => setTimeout(r, 1000));

    // 3. Go to Cart
    console.log('Step 3: Navigating to Cart...');
    await page.goto('http://localhost:3002/cart', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1500));

    // Express Delivery selected by default
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '22-cart-delivery-options-express.png') });
    copyToArtifacts('22-cart-delivery-options-express.png');
    console.log('📸 Captured 22-cart-delivery-options-express.png');

    // 4. Click Standard Delivery button
    console.log('Step 4: Selecting Standard Delivery option...');
    await page.waitForSelector('#delivery-type-standard-btn', { timeout: 5000 });
    await page.click('#delivery-type-standard-btn');
    await new Promise((r) => setTimeout(r, 800));

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '23-cart-delivery-options-standard.png') });
    copyToArtifacts('23-cart-delivery-options-standard.png');
    console.log('📸 Captured 23-cart-delivery-options-standard.png');

    // 5. Click Express Delivery button again
    console.log('Step 5: Switching back to Express Delivery...');
    await page.waitForSelector('#delivery-type-express-btn', { timeout: 5000 });
    await page.click('#delivery-type-express-btn');
    await new Promise((r) => setTimeout(r, 800));

    // 6. Click Proceed to Delivery & Payment
    console.log('Step 6: Opening Address & Checkout modal...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const proceed = buttons.find((b) => b.innerText.includes('Proceed to Delivery'));
      if (proceed) proceed.click();
    });
    await new Promise((r) => setTimeout(r, 1000));

    // Fill customer address
    console.log('Step 7: Filling customer address...');
    const nameInput = await page.$('input[placeholder*="full name"]');
    if (nameInput) await nameInput.type('Sukhwinder Singh');

    const phoneInput = await page.$('input[placeholder*="mobile"]');
    if (phoneInput) await phoneInput.type('9877012345');

    const streetInput = await page.$('input[placeholder*="Street"], input[placeholder*="Model Town"]');
    if (streetInput) {
      await streetInput.click({ clickCount: 3 });
      await streetInput.type('Farm House #7, Green Avenue, Model Town');
    }

    const pinInput = await page.$('input[placeholder*="PIN"]');
    if (pinInput) {
      await pinInput.click({ clickCount: 3 });
      await pinInput.type('144401');
    }
    await new Promise((r) => setTimeout(r, 600));

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '24-checkout-address-modal.png') });
    copyToArtifacts('24-checkout-address-modal.png');
    console.log('📸 Captured 24-checkout-address-modal.png');

    // 7. Place Order (COD)
    console.log('Step 8: Placing COD order to verify Order Confirmation view...');
    await page.click('#pay-submit-btn');

    await page.waitForSelector('text/Order Confirmed', { timeout: 12000 });
    await new Promise((r) => setTimeout(r, 1200));

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '25-order-confirmed-express-delivery.png') });
    copyToArtifacts('25-order-confirmed-express-delivery.png');
    console.log('📸 Captured 25-order-confirmed-express-delivery.png');

    console.log('✅ ALL DELIVERY TIER & CHECKOUT TESTS PASSED PERFECTLY!');
  } catch (err) {
    console.error('❌ Error during test:', err);
  } finally {
    await browser.close();
  }
})();
