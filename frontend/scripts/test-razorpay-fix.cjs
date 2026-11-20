const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const SCREENSHOT_DIR = path.join(__dirname, '../../screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

(async () => {
  console.log('🚀 Starting Verification: Razorpay Gateway Fix & Key Info Modal...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--window-size=1280,850'],
    defaultViewport: { width: 1280, height: 850 },
  });

  const page = await browser.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.text().includes('AgriMart') || msg.text().includes('Razorpay') || msg.text().includes('Order')) {
      console.log(`[BROWSER] ${msg.text()}`);
    }
  });

  try {
    // 1. Visit Dashboard
    console.log('Step 1: Navigating to Dashboard...');
    await page.goto('http://localhost:3002/dashboard', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1500));

    // Close any initial modal if open
    await page.evaluate(() => {
      const closeButtons = Array.from(document.querySelectorAll('button[aria-label*="Close"], button')).filter(
        (b) => b.innerText.includes('Confirm') || b.innerText.includes('Deliver Here')
      );
      if (closeButtons.length > 0) closeButtons[0].click();
    });
    await new Promise((r) => setTimeout(r, 800));

    // 2. Add product to cart
    console.log('Step 2: Adding a certified farm product to cart...');
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
    await new Promise((r) => setTimeout(r, 1200));

    // 4. Click Proceed to Delivery & Payment
    console.log('Step 4: Clicking Proceed to Delivery & Payment...');
    await page.evaluate(() => {
      const proceedBtn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.innerText.includes('Proceed to Delivery & Payment')
      );
      if (proceedBtn) proceedBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1200));

    // 5. Fill Address and Select Online Payment
    console.log('Step 5: Selecting Online Payment (UPI / Card / NetBanking)...');
    await page.evaluate(() => {
      const nameInput = document.querySelector('input[placeholder*="Name"], input[value*="Kisan"]');
      if (nameInput && !nameInput.value) nameInput.value = 'Pranav Kumar (LPU Hub Farmer)';

      // Select Online Payment radio
      const onlineRadio = document.querySelector('input[value="online"]');
      if (onlineRadio) onlineRadio.click();
    });
    await new Promise((r) => setTimeout(r, 800));

    // 6. Click Confirm Order & Pay Online
    console.log('Step 6: Clicking Confirm Order & Pay Online...');
    await page.evaluate(() => {
      const payBtn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.innerText.includes('Pay Online')
      );
      if (payBtn) payBtn.click();
    });
    await new Promise((r) => setTimeout(r, 2000));

    // 7. Capture Sandbox Modal Open
    console.log('Step 7: Capturing AgriMart Razorpay Sandbox Modal...');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '33-razorpay-sandbox-modal-fixed.png') });

    // 8. Click Official Razorpay & Key Info
    console.log('Step 8: Opening Official Razorpay & Key Info view...');
    await page.evaluate(() => {
      const infoBtn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.innerText.includes('Official Razorpay') || b.innerText.includes('Key Info')
      );
      if (infoBtn) infoBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1200));

    // 9. Capture Key Info & Explanation view
    console.log('Step 9: Capturing Razorpay Key Explanation & Setup View...');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '34-razorpay-key-explanation-and-setup.png') });

    // 10. Switch back to Gateway and complete test payment
    console.log('Step 10: Switching back to payment and simulating UPI payment...');
    await page.evaluate(() => {
      const backBtn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.innerText.includes('Use AgriMart Sandbox Gateway') || b.innerText.includes('Back to AgriMart')
      );
      if (backBtn) backBtn.click();
    });
    await new Promise((r) => setTimeout(r, 800));

    // 11. Click Pay via UPI button
    console.log('Step 11: Clicking Pay via UPI button...');
    await page.evaluate(() => {
      const payActionBtn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.innerText.includes('Pay ₹') && b.innerText.includes('via')
      );
      if (payActionBtn) payActionBtn.click();
    });
    await new Promise((r) => setTimeout(r, 2500));

    // 12. Capture Confirmed Order Screen
    console.log('Step 12: Capturing Order Confirmed screen...');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '35-order-confirmed-after-payment.png') });

    console.log('🎉 Verification complete! All screenshots captured.');
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    await browser.close();
  }
})();
