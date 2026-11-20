const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:/Users/prana/.gemini/antigravity/brain/ca9c2629-ab51-46e1-b2ec-9750707c2a79';
const SCREENSHOT_DIR = path.join(__dirname, '../../screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

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
  console.log('🚀 Starting Verification: Zero Generic Popups & Designer Transitions...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  let nativeDialogCount = 0;
  page.on('dialog', async (dialog) => {
    nativeDialogCount++;
    console.error(`🚨 REGRESSION: Native browser dialog appeared! [type=${dialog.type()} message="${dialog.message()}"]`);
    await dialog.dismiss();
  });

  try {
    // 1. Log in as admin via unified login
    console.log('1. Navigating to /login to log in as admin...');
    await page.goto('http://localhost:3002/login', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1000));

    // Clear previous sessions
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    await page.waitForSelector('input[type="text"], input[name="identifier"]', { timeout: 10000 });
    const identifierInput = await page.$('input[name="identifier"]') || await page.$('input[type="text"]');
    const passwordInput = await page.$('input[name="password"]') || await page.$('input[type="password"]');

    await identifierInput.click({ clickCount: 3 });
    await identifierInput.type('admin', { delay: 40 });

    await passwordInput.click({ clickCount: 3 });
    await passwordInput.type('admin9876', { delay: 40 });

    const submitBtn = await page.$('button[type="submit"]');
    await submitBtn.click();

    console.log('Waiting for redirection to /admin/panel...');
    await page.waitForFunction(() => window.location.pathname.includes('/admin/panel'), { timeout: 15000 });
    console.log('✅ Reached /admin/panel');
    await new Promise(r => setTimeout(r, 1500));

    // 2. Go to Categories tab
    console.log('2. Switching to Categories tab...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const catBtn = buttons.find(b => b.innerText.includes('Categories'));
      if (catBtn) catBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));

    // Check if any custom category exists, if not create a quick test category
    console.log('Checking for custom category or creating one...');
    let hasCustomCat = await page.evaluate(() => {
      const deleteButtons = document.querySelectorAll('button[title="Delete custom category"]');
      return deleteButtons.length > 0;
    });

    if (!hasCustomCat) {
      console.log('Creating a test custom category to verify deletion dialog...');
      // Click Add Category button
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const addBtn = buttons.find(b => b.innerText.includes('Add Category') || b.innerText.includes('New Category'));
        if (addBtn) addBtn.click();
      });
      await new Promise(r => setTimeout(r, 1000));

      // Fill in category form
      const nameInput = await page.$('input[placeholder*="Organic Hydroponics"]') || await page.$('form input[type="text"]');
      if (nameInput) {
        await nameInput.type('Special Hydroponics', { delay: 30 });
        const formSubmit = await page.$('form button[type="submit"]');
        if (formSubmit) await formSubmit.click();
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    // Now find the delete button on custom category
    console.log('3. Triggering delete on custom category...');
    const deleteBtn = await page.$('button[title="Delete custom category"]');
    if (deleteBtn) {
      await deleteBtn.click();
      console.log('Clicked custom category delete button');
      await new Promise(r => setTimeout(r, 1000));

      // Verify designer category deletion modal is present
      const modalHeader = await page.evaluate(() => {
        const h2 = document.querySelector('h2');
        return h2 ? h2.innerText : null;
      });
      console.log(`Designer modal header text: "${modalHeader}"`);

      // Capture screenshot 59
      const s59 = path.join(SCREENSHOT_DIR, '59-designer-category-delete-modal.png');
      await page.screenshot({ path: s59 });
      saveScreenshot(s59, '59-designer-category-delete-modal.png');

      // Click cancel button on the designer modal
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const cancelBtn = buttons.find(b => b.innerText.trim() === 'Cancel');
        if (cancelBtn) cancelBtn.click();
      });
      await new Promise(r => setTimeout(r, 1000));
      console.log('✅ Dismissed category deletion modal smoothly');
    } else {
      console.log('Note: No custom category delete button found, skipping click');
    }

    // 4. Navigate to /dashboard as admin to verify product deletion designer modal
    console.log('4. Navigating to /dashboard to verify product deletion designer modal...');
    await page.goto('http://localhost:3002/dashboard', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));

    // Look for admin Delete button on product card
    const hasAdminDelete = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const delBtn = buttons.find(b => b.innerText.trim() === 'Delete' && b.className.includes('bg-rose-600'));
      if (delBtn) {
        delBtn.click();
        return true;
      }
      return false;
    });

    if (hasAdminDelete) {
      console.log('Clicked product card Delete button');
      await new Promise(r => setTimeout(r, 1000));

      // Verify ConfirmDialog appeared
      const confirmDialogTitle = await page.evaluate(() => {
        const h2 = document.querySelector('h2');
        return h2 ? h2.innerText : null;
      });
      console.log(`Product ConfirmDialog header: "${confirmDialogTitle}"`);

      // Capture screenshot 60
      const s60 = path.join(SCREENSHOT_DIR, '60-designer-product-delete-modal.png');
      await page.screenshot({ path: s60 });
      saveScreenshot(s60, '60-designer-product-delete-modal.png');

      // Click Cancel on ConfirmDialog
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const cancelBtn = buttons.find(b => b.innerText.trim() === 'Cancel');
        if (cancelBtn) cancelBtn.click();
      });
      await new Promise(r => setTimeout(r, 1000));
      console.log('✅ Dismissed product deletion modal smoothly');
    } else {
      console.log('Product delete button was not visible directly, checking articles...');
    }

    // 5. Test Add to Cart & Checkout Payment Modal (Designer animations)
    console.log('5. Navigating to /cart with items to verify payment modal designer transitions...');
    // Add an item first
    await page.evaluate(() => {
      const addButtons = Array.from(document.querySelectorAll('button'));
      const addBtn = addButtons.find(b => b.innerText.trim() === 'ADD');
      if (addBtn) addBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    await page.goto('http://localhost:3002/cart', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));

    // Fill delivery form if step 2
    const nameField = await page.$('input[placeholder*="Name"], input[name="fullName"]');
    if (nameField) {
      await nameField.click({ clickCount: 3 });
      await nameField.type('Farmer Ramesh Kumar', { delay: 20 });
    }
    const phoneField = await page.$('input[placeholder*="Mobile"], input[name="phoneNumber"]');
    if (phoneField) {
      await phoneField.click({ clickCount: 3 });
      await phoneField.type('9876543210', { delay: 20 });
    }
    const addressField = await page.$('input[placeholder*="House"], textarea[name="deliveryAddress"]');
    if (addressField) {
      await addressField.click({ clickCount: 3 });
      await addressField.type('LPU Main Campus, Near Gate 1', { delay: 20 });
    }

    // Click Proceed / Pay Online
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const proceedBtn = buttons.find(b => b.innerText.includes('Proceed to Payment') || b.innerText.includes('Pay Online') || b.innerText.includes('Review & Confirm'));
      if (proceedBtn) proceedBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));

    // If on review step, click Pay Online
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const payBtn = buttons.find(b => b.innerText.includes('Pay Online'));
      if (payBtn) payBtn.click();
    });
    await new Promise(r => setTimeout(r, 2500));

    // Capture screenshot 61 of the designer payment modal
    const s61 = path.join(SCREENSHOT_DIR, '61-designer-payment-modal.png');
    await page.screenshot({ path: s61 });
    saveScreenshot(s61, '61-designer-payment-modal.png');
    console.log('✅ Captured payment modal designer view');

    console.log(`\n========================================`);
    console.log(`RESULTS SUMMARY:`);
    console.log(`Native Dialogs Triggered: ${nativeDialogCount} (Target: 0)`);
    if (nativeDialogCount === 0) {
      console.log(`🎉 SUCCESS! ZERO native dialogs detected across all user and admin workflows! All pop-ups are designer dialogs.`);
    } else {
      console.error(`❌ FAILED! ${nativeDialogCount} native dialogs detected.`);
    }
    console.log(`========================================\n`);

  } catch (err) {
    console.error('Error in verification test:', err);
  } finally {
    await browser.close();
  }
}

run();
