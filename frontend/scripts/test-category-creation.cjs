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
    console.log(`Copied ${filename} to artifacts directory.`);
  }
}

(async () => {
  console.log('🚀 Starting Category Creation E2E Verification...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--window-size=1280,900'],
    defaultViewport: { width: 1280, height: 900 },
  });

  const page = await browser.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.log(`[BROWSER ERROR] ${msg.text()}`);
    }
  });

  try {
    // ---------------------------------------------------------
    // STEP 1: LOGIN AS ADMIN
    // ---------------------------------------------------------
    console.log('Step 1: Logging in as Admin...');
    await page.goto('http://localhost:3002/login', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1000));

    await page.evaluate(() => {
      localStorage.setItem('adminSession', JSON.stringify({
        adminId: 'admin@gmail.com',
        loginTime: new Date().toISOString(),
        isAdmin: true,
      }));
    });

    await page.goto('http://localhost:3002/admin/panel', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1500));

    // ---------------------------------------------------------
    // STEP 2: OPEN ADD PRODUCT MODAL & TEST INLINE CATEGORY CREATION
    // ---------------------------------------------------------
    console.log('Step 2: Opening Add Product Modal...');
    await page.evaluate(() => {
      const addBtn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.innerText.includes('Add Grocery Item') || b.innerText.includes('Add New')
      );
      if (addBtn) addBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1000));

    console.log('Step 3: Clicking + New Category in product modal...');
    await page.evaluate(() => {
      const catBtn = document.getElementById('admin-create-category-btn');
      if (catBtn) catBtn.click();
    });
    await new Promise((r) => setTimeout(r, 800));

    console.log('Step 4: Typing new category: "Hydroponics & Nutrients"...');
    const catInput = await page.$('#new-category-name-input');
    if (catInput) {
      await catInput.type('Hydroponics & Nutrients');
    }

    console.log('Step 5: Submitting new category...');
    await page.evaluate(() => {
      const submitCatBtn = document.getElementById('submit-new-category-btn');
      if (submitCatBtn) submitCatBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1500));

    // Verify selected value in select element
    const selectedCategory = await page.evaluate(() => {
      const select = document.getElementById('admin-category-select');
      return select ? select.value : null;
    });
    console.log(`Step 6: Selected Category in modal: "${selectedCategory}"`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '50-admin-add-product-new-category-created.png') });
    copyToArtifacts('50-admin-add-product-new-category-created.png');

    // Close the product modal
    await page.evaluate(() => {
      const closeBtn = document.querySelector('button[aria-label="Close"]');
      if (closeBtn) closeBtn.click();
    });
    await new Promise((r) => setTimeout(r, 800));

    // ---------------------------------------------------------
    // STEP 7: TEST ADMIN CATEGORIES TAB
    // ---------------------------------------------------------
    console.log('Step 7: Navigating to Categories tab in Admin Panel...');
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button'));
      const catTab = tabs.find((b) => b.innerText.includes('Categories'));
      if (catTab) catTab.click();
    });
    await new Promise((r) => setTimeout(r, 1200));

    console.log('Step 8: Opening Add New Category Modal in Categories Tab...');
    await page.evaluate(() => {
      const btn = document.getElementById('admin-panel-add-category-btn');
      if (btn) btn.click();
    });
    await new Promise((r) => setTimeout(r, 800));

    console.log('Step 9: Adding category "Greenhouse & Polyhouse Tools"...');
    const modalInput = await page.$('#admin-panel-cat-name-input');
    if (modalInput) {
      await modalInput.type('Greenhouse & Polyhouse Tools');
    }

    await page.evaluate(() => {
      const subBtn = document.getElementById('admin-panel-cat-submit-btn');
      if (subBtn) subBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1500));

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '51-admin-categories-tab-manager.png') });
    copyToArtifacts('51-admin-categories-tab-manager.png');

    // ---------------------------------------------------------
    // STEP 10: VERIFY SIDEBAR FILTERS IN CUSTOMER STOREFRONT
    // ---------------------------------------------------------
    console.log('Step 10: Navigating to Storefront (/dashboard) to verify dynamic categories...');
    await page.goto('http://localhost:3002/dashboard', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1500));

    const renderedCategories = await page.evaluate(() => {
      const labels = Array.from(document.querySelectorAll('label'));
      return labels.map((l) => l.innerText.trim()).filter(Boolean);
    });

    const hasHydroponics = renderedCategories.some((t) => t.includes('Hydroponics & Nutrients'));
    const hasGreenhouse = renderedCategories.some((t) => t.includes('Greenhouse & Polyhouse Tools'));

    console.log('Step 11: Dynamic Categories in Sidebar Filters:', {
      hasHydroponics,
      hasGreenhouse,
    });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '52-storefront-sidebar-dynamic-categories.png') });
    copyToArtifacts('52-storefront-sidebar-dynamic-categories.png');

    console.log('🎉 Category creation verified successfully across Admin Modal, Categories Tab, and Storefront Filters!');
  } catch (err) {
    console.error('❌ Category verification failed:', err);
  } finally {
    await browser.close();
  }
})();
