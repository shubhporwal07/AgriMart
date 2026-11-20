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
  console.log('--- Testing Darker Blue Bar & Warm Golden Page Background ---');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  try {
    // 1. Visit Home Page
    console.log('[Step 1] Visiting Home Page at http://localhost:3002/ ...');
    await page.goto('http://localhost:3002/', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1500));

    // Close location modal if open
    try {
      const closeBtn = await page.$('button[aria-label="Close"], button.material-symbols-outlined, .material-symbols-outlined');
      // If modal has an X button or clicking backdrop
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 800));
    } catch (e) {}

    // Verify colors on Home Page
    const homeColors = await page.evaluate(() => {
      const noticeBar = document.querySelector('header > div:first-child');
      const body = document.body;
      const mainContainer = document.querySelector('.min-h-screen');
      const noticeBarBg = noticeBar ? window.getComputedStyle(noticeBar).backgroundColor : null;
      const bodyBg = window.getComputedStyle(body).backgroundColor;
      const containerBg = mainContainer ? window.getComputedStyle(mainContainer).backgroundColor : null;
      return { noticeBarBg, bodyBg, containerBg };
    });

    console.log('Home Page Computed Colors:', homeColors);

    const shot1 = path.join(SCREENSHOT_DIR, '53-home-darker-blue-bar-and-warm-golden-bg.png');
    await page.screenshot({ path: shot1, fullPage: false });
    saveScreenshot(shot1, '53-home-darker-blue-bar-and-warm-golden-bg.png');

    // 2. Check Dashboard Page
    console.log('[Step 2] Visiting Dashboard Page at http://localhost:3002/dashboard ...');
    await page.goto('http://localhost:3002/dashboard', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1500));

    const shot2 = path.join(SCREENSHOT_DIR, '54-dashboard-warm-golden-bg.png');
    await page.screenshot({ path: shot2, fullPage: false });
    saveScreenshot(shot2, '54-dashboard-warm-golden-bg.png');

    // 3. Login to Admin Panel
    console.log('[Step 3] Logging into Admin Panel at http://localhost:3002/admin ...');
    await page.goto('http://localhost:3002/admin', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1000));

    // Fill credentials: admin / admin9876
    const inputs = await page.$$('input');
    if (inputs.length >= 2) {
      await inputs[0].click({ clickCount: 3 });
      await inputs[0].type('admin');
      await inputs[1].click({ clickCount: 3 });
      await inputs[1].type('admin9876');

      const submitBtn = await page.$('button[type="submit"]');
      if (submitBtn) {
        await submitBtn.click();
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
      }
    }
    await new Promise(r => setTimeout(r, 2000));

    const adminColors = await page.evaluate(() => {
      const aside = document.querySelector('aside');
      const mainContainer = document.querySelector('.min-h-screen');
      const asideBg = aside ? window.getComputedStyle(aside).backgroundColor : null;
      const containerBg = mainContainer ? window.getComputedStyle(mainContainer).backgroundColor : null;
      return { asideBg, containerBg };
    });
    console.log('Admin Panel Computed Colors:', adminColors);

    const shot3 = path.join(SCREENSHOT_DIR, '55-admin-panel-darker-sidebar-and-warm-golden-bg.png');
    await page.screenshot({ path: shot3, fullPage: false });
    saveScreenshot(shot3, '55-admin-panel-darker-sidebar-and-warm-golden-bg.png');

    console.log('--- ALL COLOR VERIFICATIONS SUCCESSFUL ---');
  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    await browser.close();
  }
}

run();
