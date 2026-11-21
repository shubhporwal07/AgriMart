const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:/Users/prana/.gemini/antigravity/brain/ca9c2629-ab51-46e1-b2ec-9750707c2a79';

async function testMobile() {
  console.log('🚀 Running Comprehensive Mobile View Verification without modal backdrop...');

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Set 360x780 (Compact Android)
  await page.setViewport({ width: 360, height: 780, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3002', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1200));

  // If location modal is open, close it
  await page.evaluate(() => {
    const closeBtn = document.querySelector('button[aria-label="Close modal"]');
    if (closeBtn) closeBtn.click();
  });
  await new Promise((r) => setTimeout(r, 800));

  const report360 = await page.evaluate(() => {
    const winWidth = window.innerWidth;
    const bodyScrollWidth = document.body.scrollWidth;
    const htmlScrollWidth = document.documentElement.scrollWidth;

    const hamburger = document.querySelector('header button[aria-label="Toggle Navigation"]');
    const hamburgerRect = hamburger ? hamburger.getBoundingClientRect() : null;

    const cart = document.querySelector('header a[href="/cart"]');
    const cartRect = cart ? cart.getBoundingClientRect() : null;

    const signIn = document.querySelector('header a[href="/login"]');
    const signInRect = signIn ? signIn.getBoundingClientRect() : null;

    const wishlist = document.querySelector('header a[href="/wishlist"]');
    const wishlistRect = wishlist ? wishlist.getBoundingClientRect() : null;

    const logo = document.querySelector('header a[href="/"]');
    const logoRect = logo ? logo.getBoundingClientRect() : null;

    return {
      winWidth,
      bodyScrollWidth,
      htmlScrollWidth,
      zeroOverflow: bodyScrollWidth === winWidth && htmlScrollWidth === winWidth,
      elements: {
        logoRight: logoRect ? Math.round(logoRect.right) : null,
        wishlistRight: wishlistRect ? Math.round(wishlistRect.right) : null,
        signInRight: signInRect ? Math.round(signInRect.right) : null,
        cartRight: cartRect ? Math.round(cartRect.right) : null,
        hamburgerRight: hamburgerRect ? Math.round(hamburgerRect.right) : null,
      }
    };
  });

  console.log('Mobile Top Header Report (360px):', JSON.stringify(report360, null, 2));

  // Capture hero & header view on 360px
  const shot360Hero = path.join(ARTIFACTS_DIR, '98-mobile-view-360-hero.png');
  await page.screenshot({ path: shot360Hero, fullPage: false });
  console.log(`[Screenshot Saved] -> ${shot360Hero}`);

  // Test opening hamburger menu drawer
  const hamburgerBtn = await page.$('header button[aria-label="Toggle Navigation"]');
  if (hamburgerBtn) {
    await hamburgerBtn.click();
    await new Promise((r) => setTimeout(r, 600));

    const shotDrawer = path.join(ARTIFACTS_DIR, '100-mobile-menu-drawer-opened.png');
    await page.screenshot({ path: shotDrawer, fullPage: false });
    console.log(`[Screenshot Saved] -> ${shotDrawer}`);

    // Close drawer
    await hamburgerBtn.click();
    await new Promise((r) => setTimeout(r, 400));
  }

  // Scroll down to check deal cards, categories, trust badges
  await page.evaluate(() => window.scrollBy(0, 500));
  await new Promise((r) => setTimeout(r, 600));
  const shot360Mid = path.join(ARTIFACTS_DIR, '101-mobile-view-360-deals-and-categories.png');
  await page.screenshot({ path: shot360Hero.replace('360-hero', '360-mid'), fullPage: false });

  // Scroll down to footer
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise((r) => setTimeout(r, 600));
  const shot360Footer = path.join(ARTIFACTS_DIR, '102-mobile-view-360-footer.png');
  await page.screenshot({ path: shot360Footer, fullPage: false });
  console.log(`[Screenshot Saved] -> ${shot360Footer}`);

  // Now test 390px iPhone 14
  console.log('\n📱 Testing Viewport 390x844 (iPhone 14)...');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 800));

  const shot390 = path.join(ARTIFACTS_DIR, '99-mobile-view-390-iphone.png');
  await page.screenshot({ path: shot390, fullPage: false });
  console.log(`[Screenshot Saved] -> ${shot390}`);

  await browser.close();
  console.log('\n✅ Comprehensive Mobile View Verification Successfully Completed!');
}

testMobile().catch((err) => {
  console.error('Mobile test failed:', err);
  process.exit(1);
});
