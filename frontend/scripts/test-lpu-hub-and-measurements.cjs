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
  console.log('🚀 Testing LPU Hub, 30 km Delivery, and kg/Litre measurements in Chrome...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--window-size=1280,850'],
    defaultViewport: { width: 1280, height: 850 },
  });

  const page = await browser.newPage();

  try {
    // 1. Visit Dashboard (Catalog with 33 products)
    console.log('Step 1: Navigating to Dashboard...');
    await page.goto('http://localhost:3002/dashboard', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1500));

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '27-catalog-with-photos-and-weights.png') });
    copyToArtifacts('27-catalog-with-photos-and-weights.png');
    console.log('📸 Captured 27-catalog-with-photos-and-weights.png');

    // 2. Open Product Details Modal
    console.log('Step 2: Opening Product Details Modal...');
    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('h3'));
      if (cards.length > 0) cards[0].click();
    });
    await new Promise((r) => setTimeout(r, 1000));

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '28-product-details-measurement-modal.png') });
    copyToArtifacts('28-product-details-measurement-modal.png');
    console.log('📸 Captured 28-product-details-measurement-modal.png');

    // Close details modal
    await page.evaluate(() => {
      const closeBtn = document.querySelector('button[aria-label="Close modal"]') || document.querySelector('button:has(span.material-symbols-outlined)');
      if (closeBtn) closeBtn.click();
    });
    await new Promise((r) => setTimeout(r, 500));

    // 3. Visit Admin Panel to check Add Product Modal with kg and Litre options
    console.log('Step 3: Checking Admin Panel Product Form...');
    // Set admin session in localStorage
    await page.evaluate(() => {
      localStorage.setItem('adminSession', JSON.stringify({ role: 'admin', loggedInAt: new Date().toISOString() }));
    });
    await page.goto('http://localhost:3002/admin/panel', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1200));

    // Click Add Product button
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const addBtn = btns.find((b) => b.innerText.includes('Add New Product') || b.innerText.includes('Add Product'));
      if (addBtn) addBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1000));

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '29-admin-add-product-kg-litre-options.png') });
    copyToArtifacts('29-admin-add-product-kg-litre-options.png');
    console.log('📸 Captured 29-admin-add-product-kg-litre-options.png');

    // 4. Visit Cart at LPU Hub location
    console.log('Step 4: Checking Cart at LPU Hub location...');
    await page.goto('http://localhost:3002/dashboard', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1000));

    // Add item to cart
    await page.evaluate(() => {
      const addBtns = Array.from(document.querySelectorAll('button')).filter(
        (b) => b.innerText.trim() === 'ADD' || b.innerText.includes('ADD TO')
      );
      if (addBtns.length > 0) addBtns[0].click();
    });
    await new Promise((r) => setTimeout(r, 800));

    await page.goto('http://localhost:3002/cart', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1200));

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '30-cart-lpu-hub-delivery-options.png') });
    copyToArtifacts('30-cart-lpu-hub-delivery-options.png');
    console.log('📸 Captured 30-cart-lpu-hub-delivery-options.png');

    // 5. Change Location to Kartarpur (>15 km from LPU Hub) to test distance surcharge & disabled express
    console.log('Step 5: Testing location beyond 15 km (Kartarpur ~28.4 km)...');
    await page.evaluate(() => {
      const locBtn = document.querySelector('button:has(span.material-symbols-outlined)') || document.querySelector('button');
      // trigger location change via context helper in window if available or open modal
      const locModalBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Farm Dispatch') || b.innerText.includes('LPU') || b.innerText.includes('Model Town'));
      if (locModalBtn) locModalBtn.click();
    });
    await new Promise((r) => setTimeout(r, 800));

    // Click Kartarpur preset
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const kartarpurBtn = buttons.find(b => b.innerText.includes('Kartarpur'));
      if (kartarpurBtn) kartarpurBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1200));

    // Reload cart
    await page.goto('http://localhost:3002/cart', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1500));

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '31-cart-standard-over-15km-surcharge.png') });
    copyToArtifacts('31-cart-standard-over-15km-surcharge.png');
    console.log('📸 Captured 31-cart-standard-over-15km-surcharge.png');

    console.log('🎉 ALL TESTS COMPLETED AND ALL 5 SCREENSHOTS CAPTURED!');
  } catch (err) {
    console.error('❌ Test error:', err);
  } finally {
    await browser.close();
  }
})();
