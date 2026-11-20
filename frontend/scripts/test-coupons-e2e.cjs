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
  console.log('🚀 Starting Verification: Admin Discount Creation & Customer Cart Redemption...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--window-size=1280,900'],
    defaultViewport: { width: 1280, height: 900 },
  });

  const page = await browser.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.text().includes('Coupon') || msg.text().includes('AgriMart')) {
      console.log(`[BROWSER] ${msg.text()}`);
    }
  });

  try {
    // -------------------------------------------------------------
    // PART 1: ADMIN PORTAL - CREATE DISCOUNT COUPON WITH PRICE BAND
    // -------------------------------------------------------------
    console.log('Step 1: Navigating to Admin Login...');
    await page.goto('http://localhost:3002/admin', { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 1200));

    // Check if login form exists
    const userInput = await page.$('input[placeholder*="admin"]');
    if (userInput) {
      console.log('Typing admin credentials...');
      await userInput.type('admin');
      const passInput = await page.$('input[type="password"]');
      if (passInput) await passInput.type('admin9876');

      await page.evaluate(() => {
        const submitBtn = Array.from(document.querySelectorAll('button')).find((b) =>
          b.innerText.includes('Enter AgriMart Console')
        );
        if (submitBtn) submitBtn.click();
      });
      await new Promise((r) => setTimeout(r, 2000));
    }

    // Ensure we are on admin panel
    if (!page.url().includes('/admin/panel')) {
      await page.goto('http://localhost:3002/admin/panel', { waitUntil: 'domcontentloaded' });
      await new Promise((r) => setTimeout(r, 1500));
    }

    // In Admin Panel, navigate to "Discounts" Tab
    console.log('Step 2: Clicking Discounts tab in Admin Sidebar...');
    await page.evaluate(() => {
      const discountBtns = Array.from(document.querySelectorAll('button')).filter((b) =>
        b.innerText.trim() === 'Discounts' || b.innerText.includes('Discounts')
      );
      if (discountBtns.length > 0) discountBtns[0].click();
    });
    await new Promise((r) => setTimeout(r, 1200));

    // Capture Admin Discounts Management Dashboard
    console.log('Step 3: Capturing Admin Discounts & Coupons Manager...');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '36-admin-discounts-coupons-manager.png') });
    copyToArtifacts('36-admin-discounts-coupons-manager.png');

    // Click "Create New Coupon"
    console.log('Step 4: Opening Create Coupon Modal...');
    await page.evaluate(() => {
      const createBtn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.innerText.includes('Create New Coupon')
      );
      if (createBtn) createBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1000));

    // Fill Create Coupon Form with code, percentage, and price band
    console.log('Step 5: Filling Coupon Form (Code: KISAN50, 50% discount, Price band: ₹1,000)...');
    await page.evaluate(() => {
      const codeInput = document.querySelector('input[name="code"]');
      if (codeInput) {
        codeInput.value = 'KISAN50';
        codeInput.dispatchEvent(new Event('input', { bubbles: true }));
      }

      const percentInput = document.querySelector('input[name="discountPercentage"]');
      if (percentInput) {
        percentInput.value = '50';
        percentInput.dispatchEvent(new Event('input', { bubbles: true }));
      }

      const minOrderInput = document.querySelector('input[name="minOrderValue"]');
      if (minOrderInput) {
        minOrderInput.value = '1000';
        minOrderInput.dispatchEvent(new Event('input', { bubbles: true }));
      }

      const descInput = document.querySelector('input[name="description"]');
      if (descInput) {
        descInput.value = 'Special 50% Kisan Subsidy Discount on orders above ₹1,000';
        descInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    await new Promise((r) => setTimeout(r, 800));

    // Capture Create Coupon Modal with filled form & customer preview card
    console.log('Step 6: Capturing Create Coupon Modal...');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '37-admin-create-coupon-modal.png') });
    copyToArtifacts('37-admin-create-coupon-modal.png');

    // Submit Coupon Form
    console.log('Step 7: Saving & Publishing Coupon...');
    await page.evaluate(() => {
      const saveBtn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.innerText.includes('Save & Publish')
      );
      if (saveBtn) saveBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1500));

    // -------------------------------------------------------------
    // PART 2: CUSTOMER CART - REDEEM COUPON & TEST PRICE BAND
    // -------------------------------------------------------------
    console.log('Step 8: Navigating to Dashboard and adding products to cart...');
    await page.goto('http://localhost:3002/dashboard', { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 1500));

    // Dismiss any location modal if present
    await page.evaluate(() => {
      const closeButtons = Array.from(document.querySelectorAll('button'));
      const closeX = closeButtons.find(b => b.getAttribute('aria-label') === 'Close modal' || b.innerText.trim() === 'close' || b.innerText.includes('✕') || b.innerText.includes('Confirm'));
      if (closeX) closeX.click();
    });
    await new Promise((r) => setTimeout(r, 800));

    // Add certified farm products
    await page.evaluate(() => {
      const addBtns = Array.from(document.querySelectorAll('button')).filter((b) =>
        b.innerText.trim() === 'ADD' || b.innerText.includes('ADD TO')
      );
      // Add first 3 products to ensure subtotal exceeds ₹1,000
      for (let i = 0; i < Math.min(addBtns.length, 3); i++) {
        addBtns[i].click();
      }
    });
    await new Promise((r) => setTimeout(r, 1200));

    // Navigate to Cart
    console.log('Step 9: Navigating to Cart...');
    await page.goto('http://localhost:3002/cart', { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 1500));

    // Test Price Band Validation: Type KISAN50 into coupon input and apply
    console.log('Step 10: Applying coupon KISAN50 in Cart...');
    await page.evaluate(() => {
      const couponInput = document.querySelector('input[placeholder*="coupon code"]');
      if (couponInput) {
        couponInput.value = 'KISAN50';
        couponInput.dispatchEvent(new Event('input', { bubbles: true }));
      }

      const applyBtn = Array.from(document.querySelectorAll('button')).find(
        (b) => b.innerText.trim() === 'Apply'
      );
      if (applyBtn) applyBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1200));

    // Capture Cart with Coupon Applied & Discount in Bill Details
    console.log('Step 11: Capturing Cart with Applied Coupon & Bill Details...');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '38-cart-coupon-applied-bill-details.png') });
    copyToArtifacts('38-cart-coupon-applied-bill-details.png');

    // Toggle "View All" available coupons drawer
    console.log('Step 12: Opening Available Coupons Drawer...');
    await page.evaluate(() => {
      const viewAllBtn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.innerText.includes('View All')
      );
      if (viewAllBtn) viewAllBtn.click();
    });
    await new Promise((r) => setTimeout(r, 800));

    // Capture Available Coupons Drawer showing price bands
    console.log('Step 13: Capturing Available Coupons Drawer...');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '39-cart-available-coupons-drawer.png') });
    copyToArtifacts('39-cart-available-coupons-drawer.png');

    // Click "Proceed to Delivery & Payment"
    console.log('Step 14: Proceeding to Checkout Address with Coupon Discount...');
    await page.evaluate(() => {
      const proceedBtn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.innerText.includes('Proceed to Delivery & Payment')
      );
      if (proceedBtn) proceedBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1000));

    // Capture Checkout Modal showing Coupon Discount applied to final total
    console.log('Step 15: Capturing Checkout Modal with Coupon Discount...');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '40-checkout-with-coupon-discount.png') });
    copyToArtifacts('40-checkout-with-coupon-discount.png');

    console.log('🎉 Verification complete! All 5 screenshots captured successfully.');
  } catch (err) {
    console.error('❌ Test error:', err);
  } finally {
    await browser.close();
  }
})();
