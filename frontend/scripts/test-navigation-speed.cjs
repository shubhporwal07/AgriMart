const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:/Users/prana/.gemini/antigravity/brain/ca9c2629-ab51-46e1-b2ec-9750707c2a79';
const SCREENSHOT_DIR = path.join(__dirname, '../../screenshots');

async function run() {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  try {
    console.log('1. Navigating to Home (http://localhost:3002/) ...');
    await page.goto('http://localhost:3002/', { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
      sessionStorage.setItem('agrimart_location_modal_dismissed', 'true');
    });

    // Test transition 1: Click "All Agri Products" link to go to /dashboard
    console.log('2. Measuring click -> navigation time to /dashboard ...');
    const start1 = Date.now();
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      page.evaluate(() => {
        const link = document.querySelector('a[href="/dashboard?category=all"], a[href*="dashboard"]');
        if (link) link.click();
      })
    ]);
    const duration1 = Date.now() - start1;
    console.log(`⏱️ Navigation to /dashboard took: ${duration1} ms`);

    // Test transition 2: Click Wishlist in Navbar
    console.log('3. Measuring click -> navigation to /wishlist ...');
    const start2 = Date.now();
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      page.evaluate(() => {
        const wlLink = document.querySelector('a[href="/wishlist"]');
        if (wlLink) wlLink.click();
      })
    ]);
    const duration2 = Date.now() - start2;
    console.log(`⏱️ Navigation to /wishlist took: ${duration2} ms`);

    // Test transition 3: Click Cart in Navbar
    console.log('4. Measuring click -> navigation to /cart ...');
    const start3 = Date.now();
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      page.evaluate(() => {
        const cartLink = document.querySelector('a[href="/cart"]');
        if (cartLink) cartLink.click();
      })
    ]);
    const duration3 = Date.now() - start3;
    console.log(`⏱️ Navigation to /cart took: ${duration3} ms`);

    // Test transition 4: Click Logo back to Home
    console.log('5. Measuring click -> navigation back to Home / ...');
    const start4 = Date.now();
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      page.evaluate(() => {
        const homeLink = document.querySelector('a[href="/"]');
        if (homeLink) homeLink.click();
      })
    ]);
    const duration4 = Date.now() - start4;
    console.log(`⏱️ Navigation to Home took: ${duration4} ms`);

    const avg = Math.round((duration1 + duration2 + duration3 + duration4) / 4);
    console.log(`\n🚀 All transitions complete! Average transition duration: ${avg} ms`);

    // Capture screenshot of fast navigation bar
    const s74 = path.join(SCREENSHOT_DIR, '74-instant-navigation-performance.png');
    await page.screenshot({ path: s74 });
    const destPath = path.join(ARTIFACTS_DIR, '74-instant-navigation-performance.png');
    try {
      fs.copyFileSync(s74, destPath);
    } catch {}

  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    await browser.close();
  }
}

run();
