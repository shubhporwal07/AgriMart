const puppeteer = require('puppeteer-core');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/prana/.gemini/antigravity/brain/ca9c2629-ab51-46e1-b2ec-9750707c2a79';

async function runMobileTest() {
  console.log('📱 Running Mobile Login & Logout Animated Pop-up Test...');

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  await page.goto('http://localhost:3002/login', { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 600));

  // Enter credentials
  const emailInput = await page.$('input[type="text"], input[type="email"], input[name="email"]');
  const passwordInput = await page.$('input[type="password"]');

  await emailInput.type('admin@agrimart.farm', { delay: 15 });
  await passwordInput.type('admin9876', { delay: 15 });

  const submitBtn = await page.$('button[type="submit"]');
  await submitBtn.click();

  // Dwell 200ms and check during login modal on mobile
  await new Promise((r) => setTimeout(r, 200));
  const shotMobileDuringLogin = path.join(ARTIFACTS_DIR, '135-mobile-during-login-animated-modal.png');
  await page.screenshot({ path: shotMobileDuringLogin });
  console.log(`[Screenshot Saved] -> ${shotMobileDuringLogin}`);

  // Wait for post-login navigation
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 8000 }).catch(() => {});
  await new Promise((r) => setTimeout(r, 800));

  const shotMobileAfterLogin = path.join(ARTIFACTS_DIR, '136-mobile-after-login-animated-popup.png');
  await page.screenshot({ path: shotMobileAfterLogin });
  console.log(`[Screenshot Saved] -> ${shotMobileAfterLogin}`);

  // Trigger mobile logout
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.innerText.includes('Log Out') || b.innerText.includes('Logout'));
    if (btn) btn.click();
  });

  await new Promise((r) => setTimeout(r, 220));
  const shotMobileDuringLogout = path.join(ARTIFACTS_DIR, '137-mobile-during-logout-animated-modal.png');
  await page.screenshot({ path: shotMobileDuringLogout });
  console.log(`[Screenshot Saved] -> ${shotMobileDuringLogout}`);

  await new Promise((r) => setTimeout(r, 1400));
  const shotMobileAfterLogout = path.join(ARTIFACTS_DIR, '138-mobile-after-logout-animated-popup.png');
  await page.screenshot({ path: shotMobileAfterLogout });
  console.log(`[Screenshot Saved] -> ${shotMobileAfterLogout}`);

  console.log('✅ Mobile Animation checks completed successfully!');
  await browser.close();
}

runMobileTest().catch((err) => {
  console.error('❌ Mobile test failed:', err);
  process.exit(1);
});
