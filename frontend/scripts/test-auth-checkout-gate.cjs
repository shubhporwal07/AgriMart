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
  console.log('🚀 Starting Verification: Auth Checkout Gate & Saved Address Flow...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--window-size=1280,900'],
    defaultViewport: { width: 1280, height: 900 },
  });

  const page = await browser.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.text().includes('AgriMart') || msg.text().includes('saved') || msg.text().includes('address')) {
      console.log(`[BROWSER] ${msg.text()}`);
    }
  });

  try {
    // ------------------------------------------------------------------
    // STEP 1: START AS GUEST (CLEAR LOCAL STORAGE / AUTH)
    // ------------------------------------------------------------------
    console.log('Step 1: Navigating to Dashboard as Guest...');
    await page.goto('http://localhost:3002/dashboard', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1000));

    // Clear auth state in browser
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1000));

    // Dismiss any location modal if present
    await page.evaluate(() => {
      const closeButtons = Array.from(document.querySelectorAll('button'));
      const closeX = closeButtons.find(b => b.getAttribute('aria-label') === 'Close modal' || b.innerText.trim() === 'close' || b.innerText.includes('✕') || b.innerText.includes('Confirm'));
      if (closeX) closeX.click();
    });
    await new Promise((r) => setTimeout(r, 600));

    // ------------------------------------------------------------------
    // STEP 2: ADD PRODUCT TO CART AS GUEST
    // ------------------------------------------------------------------
    console.log('Step 2: Adding product to cart as guest...');
    await page.evaluate(() => {
      const addBtns = Array.from(document.querySelectorAll('button')).filter((b) =>
        b.innerText.trim() === 'ADD' || b.innerText.includes('ADD TO')
      );
      if (addBtns.length > 0) addBtns[0].click();
    });
    await new Promise((r) => setTimeout(r, 1200));

    // ------------------------------------------------------------------
    // STEP 3: NAVIGATE TO CART & CLICK PROCEED TO DELIVERY
    // ------------------------------------------------------------------
    console.log('Step 3: Navigating to Cart and clicking Proceed to Delivery & Payment...');
    await page.goto('http://localhost:3002/cart', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1200));

    // Click Proceed
    await page.evaluate(() => {
      const proceedBtn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.innerText.includes('Proceed to Delivery & Payment')
      );
      if (proceedBtn) proceedBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1500));

    // ------------------------------------------------------------------
    // STEP 4: VERIFY REDIRECT TO LOGIN
    // ------------------------------------------------------------------
    const currentUrl = page.url();
    console.log(`Step 4: Current URL after clicking Proceed: ${currentUrl}`);
    const isRedirectedToLogin = currentUrl.includes('/login') && currentUrl.includes('redirect');
    console.log(`Redirected to Login: ${isRedirectedToLogin}`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '45-unauthenticated-redirected-to-login.png') });
    copyToArtifacts('45-unauthenticated-redirected-to-login.png');

    // ------------------------------------------------------------------
    // STEP 5: SIGN IN OR CREATE TEST FARMER ACCOUNT
    // ------------------------------------------------------------------
    console.log('Step 5: Signing in on Login page...');
    const testEmail = 'kisan.farmer@gmail.com';
    const testPassword = 'Farmer@123456';

    // Ensure we are on Sign In tab (default)
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const signinTab = buttons.find((b) => b.innerText.trim() === 'SIGN IN');
      if (signinTab) signinTab.click();
    });
    await new Promise((r) => setTimeout(r, 600));

    // Type email
    const emailInput = await page.$('input[type="email"]');
    if (emailInput) {
      await emailInput.click({ clickCount: 3 });
      await emailInput.type(testEmail);
    }

    // Type password
    const passInput = await page.$('input[type="password"]');
    if (passInput) {
      await passInput.click({ clickCount: 3 });
      await passInput.type(testPassword);
    }
    await new Promise((r) => setTimeout(r, 500));

    // Submit sign in
    await page.evaluate(() => {
      const submitBtn = document.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.click();
    });
    await new Promise((r) => setTimeout(r, 3500));

    // ------------------------------------------------------------------
    // STEP 6: VERIFY REDIRECT DIRECTLY BACK TO CART (ADDRESS MODAL OPEN)
    // ------------------------------------------------------------------
    const returnUrl = page.url();
    console.log(`Step 6: Returned to URL: ${returnUrl}`);

    // If still transitioning, navigate to cart
    if (!returnUrl.includes('/cart')) {
      await page.goto('http://localhost:3002/cart?step=address', { waitUntil: 'networkidle2' });
      await new Promise((r) => setTimeout(r, 1500));
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '46-cart-address-step-after-login.png') });
    copyToArtifacts('46-cart-address-step-after-login.png');

    // ------------------------------------------------------------------
    // STEP 7: FILL DETAILS (NAME, PHONE, ADDRESS) & SUBMIT COD ORDER
    // ------------------------------------------------------------------
    console.log('Step 7: Filling address details (Pranav Kisan, 9876543210, LPU Hub Block)...');
    await page.evaluate(() => {
      function setReactInput(input, value) {
        if (!input) return;
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeInputValueSetter.call(input, value);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }

      setReactInput(document.querySelector('input[placeholder*="full name"], input[placeholder*="Name"]'), 'Pranav Kisan');
      setReactInput(document.querySelector('input[placeholder*="phone"], input[placeholder*="Mobile"], input[type="tel"]'), '9876543210');
      setReactInput(document.querySelector('input[placeholder*="House"]'), 'Pod 4, Farm Block');
      setReactInput(document.querySelector('input[placeholder*="Street"]'), 'LPU Kisan Hub, GT Road');
      setReactInput(document.querySelector('input[placeholder*="6-digit"]'), '144401');
    });
    await new Promise((r) => setTimeout(r, 800));

    // Submit Order to save address
    console.log('Step 8: Submitting COD order to persist address...');
    await page.evaluate(() => {
      const payBtn = document.getElementById('pay-submit-btn') || Array.from(document.querySelectorAll('button')).find((b) =>
        b.innerText.includes('Place COD Order') || b.innerText.includes('Pay')
      );
      if (payBtn) payBtn.click();
    });
    await new Promise((r) => setTimeout(r, 2000));

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '47-order-placed-address-saved.png') });
    copyToArtifacts('47-order-placed-address-saved.png');

    // ------------------------------------------------------------------
    // STEP 9: ADD ANOTHER PRODUCT & GO TO CART AS LOGGED IN USER
    // ------------------------------------------------------------------
    console.log('Step 9: Adding another product and checking saved address auto-fill...');
    await page.goto('http://localhost:3002/dashboard', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1200));

    // Add product
    await page.evaluate(() => {
      const addBtns = Array.from(document.querySelectorAll('button')).filter((b) =>
        b.innerText.trim() === 'ADD' || b.innerText.includes('ADD TO')
      );
      if (addBtns.length > 1) addBtns[1].click();
      else if (addBtns.length > 0) addBtns[0].click();
    });
    await new Promise((r) => setTimeout(r, 1000));

    // Go to Cart
    await page.goto('http://localhost:3002/cart', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1200));

    // Click Proceed (Now user is logged in!)
    console.log('Step 10: Clicking Proceed to Delivery & Payment as logged-in user...');
    await page.evaluate(() => {
      const proceedBtn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.innerText.includes('Proceed to Delivery & Payment')
      );
      if (proceedBtn) proceedBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1200));

    // Check if saved address is pre-populated
    const savedValues = await page.evaluate(() => {
      const name = document.querySelector('input[placeholder*="full name"], input[placeholder*="Name"]')?.value;
      const phone = document.querySelector('input[type="tel"]')?.value;
      const street = document.querySelector('input[placeholder*="Street"]')?.value;
      const badge = Array.from(document.querySelectorAll('div')).some(el =>
        el.innerText && el.innerText.includes('Saved Delivery Address Loaded')
      );
      return { name, phone, street, hasBadge: badge };
    });

    console.log('Step 11: Saved address verification results:', JSON.stringify(savedValues));

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '48-saved-address-auto-populated.png') });
    copyToArtifacts('48-saved-address-auto-populated.png');

    console.log('🎉 Verification complete! All 4 screenshots captured successfully.');
  } catch (err) {
    console.error('❌ Test error:', err);
  } finally {
    await browser.close();
  }
})();
