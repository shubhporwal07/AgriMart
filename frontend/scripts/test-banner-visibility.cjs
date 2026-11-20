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
  console.log('🚀 Verifying Blue Banner visibility: Visible on Home Page ONLY, removed on all other pages...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--window-size=1280,850'],
    defaultViewport: { width: 1280, height: 850 },
  });

  const page = await browser.newPage();

  try {
    // 1. Visit Home Page (/)
    console.log('Step 1: Navigating to Home Page (/)...');
    await page.goto('http://localhost:3002/', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1200));

    // Check if blue banner is present
    const hasBannerOnHome = await page.evaluate(() => {
      const banner = Array.from(document.querySelectorAll('div')).find((el) =>
        el.innerText && el.innerText.includes('Express Farm Delivery & Certified Inputs') && el.innerText.includes('1800-AGRI-MART')
      );
      return Boolean(banner);
    });
    console.log(`Home Page (/) has top blue banner: ${hasBannerOnHome}`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '41-home-page-with-blue-banner.png') });
    copyToArtifacts('41-home-page-with-blue-banner.png');

    // 2. Visit Cart Page (/cart)
    console.log('Step 2: Navigating to Cart Page (/cart)...');
    await page.goto('http://localhost:3002/cart', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1200));

    const hasBannerOnCart = await page.evaluate(() => {
      const banner = Array.from(document.querySelectorAll('div')).find((el) =>
        el.innerText && el.innerText.includes('Express Farm Delivery & Certified Inputs') && el.innerText.includes('1800-AGRI-MART')
      );
      return Boolean(banner);
    });
    console.log(`Cart Page (/cart) has top blue banner: ${hasBannerOnCart} (Expected: false)`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '42-cart-without-blue-banner.png') });
    copyToArtifacts('42-cart-without-blue-banner.png');

    // 3. Visit Wishlist Page (/wishlist)
    console.log('Step 3: Navigating to Wishlist Page (/wishlist)...');
    await page.goto('http://localhost:3002/wishlist', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1200));

    const hasBannerOnWishlist = await page.evaluate(() => {
      const banner = Array.from(document.querySelectorAll('div')).find((el) =>
        el.innerText && el.innerText.includes('Express Farm Delivery & Certified Inputs') && el.innerText.includes('1800-AGRI-MART')
      );
      return Boolean(banner);
    });
    console.log(`Wishlist Page (/wishlist) has top blue banner: ${hasBannerOnWishlist} (Expected: false)`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '43-wishlist-without-blue-banner.png') });
    copyToArtifacts('43-wishlist-without-blue-banner.png');

    // 4. Visit Dashboard Page (/dashboard)
    console.log('Step 4: Navigating to Dashboard Page (/dashboard)...');
    await page.goto('http://localhost:3002/dashboard', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1200));

    const hasBannerOnDashboard = await page.evaluate(() => {
      const banner = Array.from(document.querySelectorAll('div')).find((el) =>
        el.innerText && el.innerText.includes('Express Farm Delivery & Certified Inputs') && el.innerText.includes('1800-AGRI-MART')
      );
      return Boolean(banner);
    });
    console.log(`Dashboard Page (/dashboard) has top blue banner: ${hasBannerOnDashboard} (Expected: false)`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '44-dashboard-without-blue-banner.png') });
    copyToArtifacts('44-dashboard-without-blue-banner.png');

    console.log('🎉 Verification completed successfully!');
  } catch (err) {
    console.error('❌ Test error:', err);
  } finally {
    await browser.close();
  }
})();
