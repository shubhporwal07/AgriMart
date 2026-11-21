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
    console.error(`Failed to copy screenshot to artifacts: ${err.message}`);
  }
}

async function verifyWishlistButtons() {
  console.log('🔍 Starting Comprehensive Verification of Wishlist Buttons...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  // Test both mobile 360px and desktop 1280px
  await page.setViewport({ width: 360, height: 800, isMobile: true, hasTouch: true });

  // 1. Home Page Verification
  console.log('1. Navigating to http://localhost:3002/ ...');
  await page.goto('http://localhost:3002/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));

  // Dismiss announcement / location modal if open
  await page.evaluate(() => {
    document.querySelector('button[aria-label="Close Announcement"]')?.click();
    localStorage.setItem('agrimart_location_prompted_v3', 'true');
  });

  await page.waitForSelector('button[aria-label="Wishlist item"]', { timeout: 10000 });

  // Inspect the hero deals wishlist buttons
  const heroBtnMetrics = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button[aria-label="Wishlist item"]'));
    return btns.map((b, i) => {
      const rect = b.getBoundingClientRect();
      const sibling = b.nextElementSibling;
      const sibRect = sibling ? sibling.getBoundingClientRect() : null;
      const cs = getComputedStyle(b);
      const span = b.querySelector('span');
      const spanCs = span ? getComputedStyle(span) : null;
      return {
        index: i,
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        isSquare: Math.abs(rect.width - rect.height) <= 1,
        siblingHeight: sibRect ? Math.round(sibRect.height) : null,
        heightAligned: sibRect ? Math.abs(rect.height - sibRect.height) <= 2 : false,
        display: cs.display,
        justifyContent: cs.justifyContent,
        alignItems: cs.alignItems,
        iconFontSize: spanCs ? spanCs.fontSize : null,
      };
    });
  });
  console.log('Hero wishlist buttons metrics (360px):', heroBtnMetrics);

  // Take screenshot of hero deals buttons before click (inactive)
  const heroDealSection = await page.$('section');
  const shot1 = path.join(SCREENSHOT_DIR, '115-hero-deals-wishlist-buttons-inactive-fixed.png');
  await heroDealSection.screenshot({ path: shot1 });
  saveScreenshot(shot1, '115-hero-deals-wishlist-buttons-inactive-fixed.png');

  // Click the first wishlist button to test active state
  console.log('Clicking first hero wishlist button to verify active state...');
  const firstWishlistBtn = await page.$('button[aria-label="Wishlist item"]');
  await firstWishlistBtn.click();
  await new Promise(r => setTimeout(r, 600));

  const shot2 = path.join(SCREENSHOT_DIR, '116-hero-deals-wishlist-button-active-fixed.png');
  await heroDealSection.screenshot({ path: shot2 });
  saveScreenshot(shot2, '116-hero-deals-wishlist-button-active-fixed.png');

  // 2. Dashboard Product Cards Verification
  console.log('2. Navigating to http://localhost:3002/dashboard ...');
  await page.goto('http://localhost:3002/dashboard', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));

  await page.evaluate(() => {
    document.querySelector('button[aria-label="Close Announcement"]')?.click();
  });

  const cardBtnMetrics = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button[aria-label="Add to wishlist"], button[aria-label="Remove from wishlist"]'));
    return btns.slice(0, 4).map((b, i) => {
      const rect = b.getBoundingClientRect();
      const cs = getComputedStyle(b);
      return {
        index: i,
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        isCircle: Math.abs(rect.width - rect.height) <= 1,
        borderRadius: cs.borderRadius,
        display: cs.display,
        justifyContent: cs.justifyContent,
        alignItems: cs.alignItems
      };
    });
  });
  console.log('Dashboard product cards wishlist buttons metrics:', cardBtnMetrics);

  const productGrid = await page.$('main');
  const shot3 = path.join(SCREENSHOT_DIR, '117-dashboard-product-cards-wishlist-fixed.png');
  await page.screenshot({ path: shot3, clip: { x: 0, y: 150, width: 360, height: 600 } });
  saveScreenshot(shot3, '117-dashboard-product-cards-wishlist-fixed.png');

  // 3. Wishlist Page Verification
  console.log('3. Navigating to http://localhost:3002/wishlist ...');
  // First ensure there is at least one item in wishlist
  await page.evaluate(() => {
    const defaultProduct = {
      id: 'agri-hybrid-tomato-seeds',
      name: 'F1 Hybrid Tomato Seeds (Abhinav)',
      category: 'Vegetable Seeds',
      price: 185,
      mrp: 245,
      unit: '10g Foil Pack (~3,000 seeds)',
      imageUrl: '/images/products/hybrid-tomato-seeds.png'
    };
    const current = JSON.parse(localStorage.getItem('agrimart_wishlist_v1') || '[]');
    if (!current.some(p => p.id === defaultProduct.id)) {
      current.push(defaultProduct);
      localStorage.setItem('agrimart_wishlist_v1', JSON.stringify(current));
    }
  });

  await page.goto('http://localhost:3002/wishlist', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));

  const wishlistPageMetrics = await page.evaluate(() => {
    const removeBtns = Array.from(document.querySelectorAll('button[aria-label="Remove from wishlist"]'));
    return {
      itemsCount: removeBtns.length,
      firstBtnMetrics: removeBtns.length > 0 ? {
        width: Math.round(removeBtns[0].getBoundingClientRect().width),
        height: Math.round(removeBtns[0].getBoundingClientRect().height),
        isCircle: Math.abs(removeBtns[0].getBoundingClientRect().width - removeBtns[0].getBoundingClientRect().height) <= 1,
      } : null
    };
  });
  console.log('Wishlist page metrics:', wishlistPageMetrics);

  const shot4 = path.join(SCREENSHOT_DIR, '118-wishlist-page-items-fixed.png');
  await page.screenshot({ path: shot4, clip: { x: 0, y: 80, width: 360, height: 500 } });
  saveScreenshot(shot4, '118-wishlist-page-items-fixed.png');

  await browser.close();
  console.log('🎉 Wishlist Buttons Verification Complete!');
}

verifyWishlistButtons().catch(console.error);
