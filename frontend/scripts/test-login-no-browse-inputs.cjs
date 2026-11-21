const puppeteer = require('puppeteer-core');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/prana/.gemini/antigravity/brain/ca9c2629-ab51-46e1-b2ec-9750707c2a79';

async function runTest() {
  console.log('🚀 Verifying removal of "Browse Inputs" on Login Page...');

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // 1. Mobile Viewport (390px x 844px) - matching user screenshot
  console.log('\n--- Step 1: Mobile Viewport Verification (390px) ---');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3002/login', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1000));

  const mobileCheck = await page.evaluate(() => {
    const text = document.body.innerText;
    const hasBrowseInputs = text.includes('Browse Inputs') || text.includes('Browse inputs') || text.includes('browser input');
    const headerLinks = Array.from(document.querySelectorAll('header a')).map(a => a.innerText.trim());
    return {
      hasBrowseInputs,
      headerLinks
    };
  });
  console.log('Mobile Check Results:', mobileCheck);

  const shotMobile = path.join(ARTIFACTS_DIR, '129-login-header-mobile-no-browse-inputs.png');
  await page.screenshot({ path: shotMobile });
  console.log(`[Screenshot Saved] -> ${shotMobile}`);

  if (mobileCheck.hasBrowseInputs) {
    throw new Error('FAILURE: "Browse Inputs" is still present on mobile login page!');
  }

  // 2. Desktop Viewport (1280px x 800px)
  console.log('\n--- Step 2: Desktop Viewport Verification (1280px) ---');
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:3002/login', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1000));

  const desktopCheck = await page.evaluate(() => {
    const text = document.body.innerText;
    const hasBrowseInputs = text.includes('Browse Inputs') || text.includes('Browse inputs');
    const headerLinks = Array.from(document.querySelectorAll('header a')).map(a => a.innerText.trim());
    return {
      hasBrowseInputs,
      headerLinks
    };
  });
  console.log('Desktop Check Results:', desktopCheck);

  const shotDesktop = path.join(ARTIFACTS_DIR, '130-login-header-desktop-no-browse-inputs.png');
  await page.screenshot({ path: shotDesktop });
  console.log(`[Screenshot Saved] -> ${shotDesktop}`);

  if (desktopCheck.hasBrowseInputs) {
    throw new Error('FAILURE: "Browse Inputs" is still present on desktop login page!');
  }

  console.log('\n✅ ALL CHECKS PASSED: "Browse Inputs" has been completely removed from the login page!');
  await browser.close();
}

runTest().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
