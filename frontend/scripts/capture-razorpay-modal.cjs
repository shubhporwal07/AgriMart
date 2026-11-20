const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:/Users/prana/.gemini/antigravity/brain/ca9c2629-ab51-46e1-b2ec-9750707c2a79';
const SCREENSHOT_DIR = path.join(__dirname, '../../screenshots');

function saveScreenshot(sourcePath, filename) {
  const destPath = path.join(ARTIFACTS_DIR, filename);
  try {
    fs.copyFileSync(sourcePath, destPath);
    console.log(`[Screenshot Saved & Copied to Artifacts] -> ${destPath}`);
  } catch (err) {
    console.warn(`Could not copy to artifacts: ${err.message}`);
  }
}

async function run() {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on('dialog', async (dialog) => {
    console.error(`🚨 REGRESSION: Native browser dialog appeared! [type=${dialog.type()} message="${dialog.message()}"]`);
    await dialog.dismiss();
  });

  try {
    // 1. Log in as admin to have session
    await page.goto('http://localhost:3002/login', { waitUntil: 'networkidle2' });
    await page.waitForSelector('input[name="identifier"]', { timeout: 10000 });
    await page.type('input[name="identifier"]', 'admin', { delay: 30 });
    await page.type('input[name="password"]', 'admin9876', { delay: 30 });
    await page.click('button[type="submit"]');
    await page.waitForFunction(() => window.location.pathname.includes('/admin/panel'), { timeout: 15000 });

    // 2. Go to dashboard, add item
    await page.goto('http://localhost:3002/dashboard', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));
    await page.evaluate(() => {
      const addButtons = Array.from(document.querySelectorAll('button'));
      const addBtn = addButtons.find(b => b.innerText.trim() === 'ADD');
      if (addBtn) addBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    // 3. Go to /cart
    await page.goto('http://localhost:3002/cart', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));

    // Step 1: Click "Proceed to Delivery & Payment"
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.innerText.includes('Proceed to Delivery & Payment'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    // Step 2: Fill address if needed, click Review & Confirm
    const nameField = await page.$('input[placeholder*="Name"], input[name="fullName"]');
    if (nameField) {
      await nameField.click({ clickCount: 3 });
      await nameField.type('Farmer Ramesh Kumar', { delay: 10 });
    }
    const phoneField = await page.$('input[placeholder*="Mobile"], input[name="phoneNumber"]');
    if (phoneField) {
      await phoneField.click({ clickCount: 3 });
      await phoneField.type('9876543210', { delay: 10 });
    }
    const addressField = await page.$('input[placeholder*="House"], textarea[name="deliveryAddress"]');
    if (addressField) {
      await addressField.click({ clickCount: 3 });
      await addressField.type('LPU Main Campus, Near Gate 1', { delay: 10 });
    }

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.innerText.includes('Review & Confirm') || b.innerText.includes('Proceed to Payment'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    // Step 3: Click "Pay Online"
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.innerText.includes('Pay Online'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 2000));

    // Screenshot 62: Razorpay Sandbox Modal
    const s62 = path.join(SCREENSHOT_DIR, '62-designer-razorpay-sandbox-modal.png');
    await page.screenshot({ path: s62 });
    saveScreenshot(s62, '62-designer-razorpay-sandbox-modal.png');
    console.log('✅ Captured Razorpay Sandbox Modal screenshot');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
  }
}

run();
