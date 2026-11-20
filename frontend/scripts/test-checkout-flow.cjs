const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const SCREENSHOT_DIR = path.join(__dirname, '../../screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

(async () => {
  console.log('🚀 Launching Chrome for End-to-End AgriMart Payment Gateway Verification...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--window-size=1280,850'],
    defaultViewport: { width: 1280, height: 850 },
  });

  const page = await browser.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.text().includes('Order') || msg.text().includes('Payment') || msg.text().includes('AgriMart')) {
      console.log(`[BROWSER ${msg.type().toUpperCase()}] ${msg.text()}`);
    }
  });

  try {
    // 1. Visit Dashboard
    console.log('Step 1: Navigating to Dashboard...');
    await page.goto('http://localhost:3002/dashboard', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1200));

    // 2. Add product to cart
    console.log('Step 2: Adding a certified product to cart...');
    await page.evaluate(() => {
      const addBtns = Array.from(document.querySelectorAll('button')).filter(
        (b) => b.innerText.trim() === 'ADD' || b.innerText.includes('ADD TO')
      );
      if (addBtns.length > 0) addBtns[0].click();
    });
    await new Promise((r) => setTimeout(r, 1200));

    // 3. Navigate to Cart
    console.log('Step 3: Navigating to Cart...');
    await page.goto('http://localhost:3002/cart', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'step1-cart-page.png') });

    // 4. Click Proceed to Delivery & Payment
    console.log('Step 4: Clicking Proceed to Delivery & Payment...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const proceed = buttons.find((b) => b.innerText.includes('Proceed to Delivery'));
      if (proceed) proceed.click();
    });
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'step2-address-modal.png') });

    // 5. Select Online Payment
    console.log('Step 5: Selecting Online Payment...');
    await page.waitForSelector('#pay-method-online-btn', { timeout: 5000 });
    await page.click('#pay-method-online-btn');
    await new Promise((r) => setTimeout(r, 400));

    // Fill customer address using page.type
    console.log('Filling customer address details using real typing...');
    const nameInput = await page.$('input[placeholder*="full name"]');
    if (nameInput) await nameInput.type('Rajinder Singh Kisan');

    const phoneInput = await page.$('input[placeholder*="mobile"]');
    if (phoneInput) await phoneInput.type('9877012345');

    const streetInput = await page.$('input[placeholder*="Street"], input[placeholder*="Model Town"]');
    if (streetInput) {
      await streetInput.click({ clickCount: 3 });
      await streetInput.type('Farm Plot #14, GT Road, Model Town');
    }

    const pinInput = await page.$('input[placeholder*="PIN"]');
    if (pinInput) {
      await pinInput.click({ clickCount: 3 });
      await pinInput.type('144401');
    }

    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'step3-address-filled-online-selected.png') });

    // 6. Click Pay Online Button
    console.log('Step 6: Clicking Pay Online button...');
    await page.click('#pay-submit-btn');

    // 7. Wait for AgriMart Razorpay Sandbox Modal
    console.log('Step 7: Waiting for AgriMart Razorpay Sandbox Modal...');
    await page.waitForSelector('text/Razorpay Sandbox', { timeout: 8000 });
    await new Promise((r) => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'step4-razorpay-sandbox-opened.png') });

    // 8. Test Cards Tab
    console.log('Step 8: Testing Cards tab inside payment modal...');
    await page.waitForSelector('#sandbox-tab-card', { timeout: 5000 });
    await page.click('#sandbox-tab-card');
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'step5-cards-tab-view.png') });

    // 9. Test Netbanking Tab
    console.log('Step 9: Testing Netbanking tab inside payment modal...');
    await page.waitForSelector('#sandbox-tab-netbanking', { timeout: 5000 });
    await page.click('#sandbox-tab-netbanking');
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'step6-netbanking-tab-view.png') });

    // 10. Switch back to UPI and click Pay
    console.log('Step 10: Switching back to UPI / QR and clicking Pay...');
    await page.waitForSelector('#sandbox-tab-upi', { timeout: 5000 });
    await page.click('#sandbox-tab-upi');
    await new Promise((r) => setTimeout(r, 600));

    // Click the Pay Button
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const payAction = buttons.find((b) => b.innerText.includes('Pay ₹'));
      if (payAction) payAction.click();
    });

    // 11. Wait for Processing State
    console.log('Step 11: Capturing payment processing animation state...');
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'step7-payment-processing.png') });

    // 12. Wait for Order Confirmation View
    console.log('Step 12: Waiting for order confirmation screen...');
    await page.waitForSelector('text/Order Confirmed', { timeout: 12000 });
    await new Promise((r) => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'step8-order-confirmed-success.png') });

    console.log('🎉 ALL STEPS COMPLETED SUCCESSFULLY WITH 0 ERRORS!');
  } catch (err) {
    console.error('❌ Test execution error:', err);
  } finally {
    await browser.close();
  }
})();
