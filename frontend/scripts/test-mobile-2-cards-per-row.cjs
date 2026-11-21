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

async function run() {
  console.log('📱 Starting Verification: Mobile 2 Cards in a Row Layout...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=390,844']
  });

  const page = await browser.newPage();

  try {
    // 1. Test 390px Viewport (iPhone 14 / modern Android) on /dashboard
    console.log('1. Testing 390px Viewport on /dashboard ...');
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:3002/dashboard', { waitUntil: 'domcontentloaded' });
    
    // Dismiss location modal / announcements
    await page.evaluate(() => {
      localStorage.setItem('agrimart_location_prompted_v3', 'true');
      sessionStorage.setItem('agrimart_location_prompted_v3', 'true');
      localStorage.setItem('agrimart_delivery_location_v3', JSON.stringify({
        id: 'loc_phagwara_hub',
        name: 'LPU Campus / Law Gate (Hub Location)',
        area: 'Lovely Professional University, Phagwara - 144411',
        distanceKm: 0.1,
        isServiceable: true,
        deliveryTime: '⚡ Express & Standard'
      }));
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));

    // Dismiss announcement popup once it mounts
    await page.evaluate(() => {
      const closeBtn = document.querySelector('button[aria-label="Close Announcement"]');
      if (closeBtn) {
        closeBtn.click();
      } else {
        const btns = Array.from(document.querySelectorAll('button'));
        const dismiss = btns.find(b => b.textContent.includes('Acknowledge') || b.textContent.includes('Got It'));
        if (dismiss) dismiss.click();
      }
    });
    await new Promise(r => setTimeout(r, 800));

    // Scroll to the cards grid
    await page.evaluate(() => {
      const firstCard = document.querySelector('article');
      if (firstCard) firstCard.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await new Promise(r => setTimeout(r, 600));

    // Measure card layout on /dashboard
    const dashboardLayout = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('article'));
      if (cards.length < 2) return { count: cards.length, error: 'Less than 2 cards found' };

      const rect0 = cards[0].getBoundingClientRect();
      const rect1 = cards[1].getBoundingClientRect();
      const rect2 = cards.length > 2 ? cards[2].getBoundingClientRect() : null;

      const isSideBySide = Math.abs(rect0.top - rect1.top) < 6;
      const isRowOrdered = rect0.right <= rect1.left + 15;
      const isNextRowBelow = rect2 ? rect2.top > rect0.bottom - 5 : true;
      const hasHorizontalScroll = document.documentElement.scrollWidth > document.documentElement.clientWidth;

      return {
        cardCount: cards.length,
        card0Width: Math.round(rect0.width),
        card1Width: Math.round(rect1.width),
        card0Top: Math.round(rect0.top),
        card1Top: Math.round(rect1.top),
        card0Left: Math.round(rect0.left),
        card1Left: Math.round(rect1.left),
        isSideBySide,
        isRowOrdered,
        isNextRowBelow,
        hasHorizontalScroll,
        columnsInFirstRow: isSideBySide ? 2 : 1
      };
    });

    console.log('Dashboard 390px Layout Results:', dashboardLayout);

    const shot1 = path.join(SCREENSHOT_DIR, '108-mobile-dashboard-2-cards-per-row-390px.png');
    await page.screenshot({ path: shot1, fullPage: false });
    saveScreenshot(shot1, '108-mobile-dashboard-2-cards-per-row-390px.png');

    // 2. Test 360px Viewport (Standard Android) on /dashboard
    console.log('2. Testing 360px Viewport (Standard Android) on /dashboard ...');
    await page.setViewport({ width: 360, height: 800, isMobile: true, hasTouch: true });
    await new Promise(r => setTimeout(r, 500));

    const shot2 = path.join(SCREENSHOT_DIR, '109-mobile-dashboard-2-cards-per-row-360px.png');
    await page.screenshot({ path: shot2, fullPage: false });
    saveScreenshot(shot2, '109-mobile-dashboard-2-cards-per-row-360px.png');

    // 3. Test Home Page (LandingPage) Flash Deals on 390px
    console.log('3. Testing Landing Page Flash Deals on 390px ...');
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:3002', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));

    // Dismiss announcement popup once it mounts
    await page.evaluate(() => {
      const closeBtn = document.querySelector('button[aria-label="Close Announcement"]');
      if (closeBtn) {
        closeBtn.click();
      } else {
        const btns = Array.from(document.querySelectorAll('button'));
        const dismiss = btns.find(b => b.textContent.includes('Acknowledge') || b.textContent.includes('Got It'));
        if (dismiss) dismiss.click();
      }
    });
    await new Promise(r => setTimeout(r, 800));

    // Scroll to flash deals section
    await page.evaluate(() => {
      const flashCards = document.querySelectorAll('article');
      if (flashCards.length > 0) flashCards[0].scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await new Promise(r => setTimeout(r, 600));

    const shot3 = path.join(SCREENSHOT_DIR, '110-mobile-home-flash-deals-2-cards-per-row.png');
    await page.screenshot({ path: shot3, fullPage: false });
    saveScreenshot(shot3, '110-mobile-home-flash-deals-2-cards-per-row.png');

    console.log('🎉 Verification Complete! 2 cards per row layout verified on mobile.');
  } catch (err) {
    console.error('❌ Error during verification:', err);
  } finally {
    await browser.close();
  }
}

run();
