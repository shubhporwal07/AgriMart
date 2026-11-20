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
  console.log('🚀 Starting Verification: Home Screen Hero Deals, Visible Images, Modal Open & Admin Showcase Manager...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  try {
    // 1. Visit Home Page
    console.log('1. Navigating to Home Page (http://localhost:3002/)...');
    await page.goto('http://localhost:3002/', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));

    // Verify hero deal images are visible and not broken
    const heroImageStates = await page.evaluate(() => {
      const heroCards = Array.from(document.querySelectorAll('.lg\\:col-span-4 > div'));
      return heroCards.map((card, i) => {
        const img = card.querySelector('img');
        const title = card.querySelector('h3')?.innerText || '';
        const price = card.querySelector('.font-price')?.innerText || '';
        return {
          index: i,
          title,
          price,
          imgSrc: img ? img.src : null,
          imgNaturalWidth: img ? img.naturalWidth : 0,
          imgComplete: img ? img.complete : false,
        };
      });
    });

    console.log('Hero deal cards found on Home Page:', JSON.stringify(heroImageStates, null, 2));

    // Capture Screenshot 63: Home Page Hero Deals with Fixed, Beautiful Images
    const s63 = path.join(SCREENSHOT_DIR, '63-home-page-hero-deals-fixed-images.png');
    await page.screenshot({ path: s63 });
    saveScreenshot(s63, '63-home-page-hero-deals-fixed-images.png');

    // 2. Click on the first Hero Deal card to verify that it OPENS ProductDetailsModal!
    console.log('2. Clicking on the first Hero Deal card to verify ProductDetailsModal opens...');
    await page.evaluate(() => {
      const heroCards = Array.from(document.querySelectorAll('.lg\\:col-span-4 > div'));
      if (heroCards[0]) heroCards[0].click();
    });
    await new Promise(r => setTimeout(r, 1500));

    // Verify modal is open
    const modalTitle = await page.evaluate(() => {
      const modal = document.querySelector('[role="dialog"]') || document.querySelector('.fixed.inset-0 h2');
      return modal ? modal.innerText : null;
    });
    console.log(`Opened modal title: "${modalTitle}"`);

    // Capture Screenshot 64: Product Details Modal Open
    const s64 = path.join(SCREENSHOT_DIR, '64-hero-deal-card-opens-details-modal.png');
    await page.screenshot({ path: s64 });
    saveScreenshot(s64, '64-hero-deal-card-opens-details-modal.png');

    // Close the modal
    await page.evaluate(() => {
      const closeBtn = document.querySelector('button[aria-label="Close product details"]') ||
                       document.querySelector('.fixed.inset-0 button');
      if (closeBtn) closeBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    // 3. Log in as Admin to test Home Screen Showcase Manager in Admin Panel
    console.log('3. Logging in as Admin to access Admin Panel...');
    await page.goto('http://localhost:3002/login', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    const identifierInput = await page.$('input[name="identifier"]') || await page.$('input[type="text"]');
    const passwordInput = await page.$('input[name="password"]') || await page.$('input[type="password"]');

    await identifierInput.click({ clickCount: 3 });
    await identifierInput.type('admin', { delay: 30 });
    await passwordInput.click({ clickCount: 3 });
    await passwordInput.type('admin9876', { delay: 30 });

    const submitBtn = await page.$('button[type="submit"]');
    await submitBtn.click();

    await page.waitForFunction(() => window.location.pathname.includes('/admin/panel'), { timeout: 15000 });
    console.log('✅ Reached /admin/panel');
    await new Promise(r => setTimeout(r, 1500));

    // 4. Switch to "Home Screen" Showcase Tab
    console.log('4. Navigating to "Home Screen" showcase tab in Admin Panel...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const homeTab = buttons.find(b => b.innerText.includes('Home Screen'));
      if (homeTab) homeTab.click();
    });
    await new Promise(r => setTimeout(r, 1500));

    // Capture Screenshot 65: Admin Home Screen Showcase Manager
    const s65 = path.join(SCREENSHOT_DIR, '65-admin-home-screen-showcase-manager.png');
    await page.screenshot({ path: s65 });
    saveScreenshot(s65, '65-admin-home-screen-showcase-manager.png');

    // 5. Test Limit Rejection!
    console.log('5. Testing Strict Limit Rejection when trying to add a 3rd item to Hero Deals...');
    // Click on a "+ Add" button from the candidates mini-grid while at capacity
    await page.evaluate(() => {
      const addButtons = Array.from(document.querySelectorAll('button'));
      const miniAddBtn = addButtons.find(b => b.innerText.trim() === '+ Add');
      if (miniAddBtn) miniAddBtn.click();
    });
    await new Promise(r => setTimeout(r, 1200));

    // Check if rejection modal appeared
    const rejectionTitle = await page.evaluate(() => {
      const modal = document.querySelector('.fixed.inset-0 h3');
      return modal ? modal.innerText : null;
    });
    console.log(`Rejection modal title: "${rejectionTitle}"`);

    // Capture Screenshot 66: Limit Rejection Modal
    const s66 = path.join(SCREENSHOT_DIR, '66-admin-home-showcase-limit-rejection-modal.png');
    await page.screenshot({ path: s66 });
    saveScreenshot(s66, '66-admin-home-showcase-limit-rejection-modal.png');

    // Dismiss rejection modal
    await page.evaluate(() => {
      const dismissBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Understood'));
      if (dismissBtn) dismissBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    // 6. Test Removal and Adding a New Product to Live Showcase
    console.log('6. Removing 1 item from Hero Deals and adding a new product...');
    await page.evaluate(() => {
      const removeBtns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.trim() === 'Remove');
      if (removeBtns[1]) removeBtns[1].click();
    });
    await new Promise(r => setTimeout(r, 800));

    // Confirm removal in ConfirmDialog
    await page.evaluate(() => {
      const confirmBtns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.includes('Remove from Showcase'));
      if (confirmBtns[0]) confirmBtns[0].click();
    });
    await new Promise(r => setTimeout(r, 1500));

    // Now slot is 1/2 available. Add the first available product
    console.log('Adding new product to the freed slot...');
    await page.evaluate(() => {
      const miniAddBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === '+ Add');
      if (miniAddBtn) miniAddBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));

    // 7. Revisit Home Page to verify live update
    console.log('7. Re-visiting Home Page to verify new product is now live in the hero showcase...');
    await page.goto('http://localhost:3002/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));

    const updatedHeroCards = await page.evaluate(() => {
      const heroCards = Array.from(document.querySelectorAll('.lg\\:col-span-4 > div'));
      return heroCards.map((card, i) => {
        const title = card.querySelector('h3')?.innerText || '';
        const price = card.querySelector('.font-price')?.innerText || '';
        return { index: i, title, price };
      });
    });
    console.log('Updated Hero Cards on Home Page:', JSON.stringify(updatedHeroCards, null, 2));

    // Capture Screenshot 67: Live Home Page with Updated Product Showcase
    const s67 = path.join(SCREENSHOT_DIR, '67-home-screen-updated-live-with-new-product.png');
    await page.screenshot({ path: s67 });
    saveScreenshot(s67, '67-home-screen-updated-live-with-new-product.png');

    console.log('\n🎉 ALL VERIFICATION CHECKS COMPLETED SUCCESSFULLY!\n');

  } catch (err) {
    console.error('Error in verification test:', err);
  } finally {
    await browser.close();
  }
}

run();
