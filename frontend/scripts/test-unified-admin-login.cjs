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
  console.log('🚀 Starting Verification: Unified Admin Login & Logout...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  try {
    // 1. Visit /login first to clear any existing admin session
    await page.goto('http://localhost:3002/login', { waitUntil: 'networkidle2', timeout: 30000 });
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // 2. Step 1: Attempt to visit /admin/panel without being logged in
    console.log('Step 1: Navigating to http://localhost:3002/admin/panel directly (unauthenticated)...');
    await page.goto('http://localhost:3002/admin/panel', { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait for client redirect to /login?redirect=/admin/panel
    await page.waitForFunction(
      () => window.location.pathname === '/login' && window.location.search.includes('redirect'),
      { timeout: 10000 }
    );
    await new Promise(r => setTimeout(r, 1500));

    const currentUrl = page.url();
    console.log(`Current URL after unauthenticated access: ${currentUrl}`);
    console.log('✅ PASS: Redirected to /login?redirect=/admin/panel');

    const shot1 = path.join(SCREENSHOT_DIR, '56-redirected-to-unified-login-with-admin-access.png');
    await page.screenshot({ path: shot1, fullPage: false });
    saveScreenshot(shot1, '56-redirected-to-unified-login-with-admin-access.png');

    // 3. Step 2: Perform Admin Login on this unified login page using "admin" / "admin9876"
    console.log('Step 2: Entering admin credentials (admin / admin9876) into unified login form...');
    
    // Fill admin username
    const usernameInput = await page.$('input[autocomplete="username"], input[type="text"], input[type="email"]');
    if (usernameInput) {
      await usernameInput.click({ clickCount: 3 });
      await usernameInput.type('admin');
    }

    // Fill admin password
    const passwordInput = await page.$('input[type="password"]');
    if (passwordInput) {
      await passwordInput.click({ clickCount: 3 });
      await passwordInput.type('admin9876');
    }

    // Submit form
    console.log('Submitting login form...');
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
    }

    // Wait for redirect to /admin/panel
    await page.waitForFunction(
      () => window.location.pathname.includes('/admin/panel'),
      { timeout: 15000 }
    );
    await new Promise(r => setTimeout(r, 2500));

    const panelUrl = page.url();
    console.log(`Current URL after admin login: ${panelUrl}`);

    const isAdminSessionActive = await page.evaluate(() => {
      try {
        const session = JSON.parse(localStorage.getItem('adminSession'));
        return !!session?.isAdmin;
      } catch {
        return false;
      }
    });
    console.log(`Is adminSession active in localStorage: ${isAdminSessionActive}`);

    const shot2 = path.join(SCREENSHOT_DIR, '57-admin-panel-after-unified-login.png');
    await page.screenshot({ path: shot2, fullPage: false });
    saveScreenshot(shot2, '57-admin-panel-after-unified-login.png');

    // 4. Step 3: Test Admin Logout
    console.log('Step 3: Logging out from Admin Panel...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const logoutBtn = buttons.find(b => b.textContent && b.textContent.includes('Logout'));
      if (logoutBtn) {
        logoutBtn.click();
      }
    });

    await page.waitForFunction(
      () => window.location.pathname === '/login',
      { timeout: 10000 }
    );
    await new Promise(r => setTimeout(r, 1500));

    const postLogoutUrl = page.url();
    console.log(`Current URL after logout: ${postLogoutUrl}`);

    const shot3 = path.join(SCREENSHOT_DIR, '58-post-admin-logout-return-to-login.png');
    await page.screenshot({ path: shot3, fullPage: false });
    saveScreenshot(shot3, '58-post-admin-logout-return-to-login.png');

    console.log('🎉 UNIFIED ADMIN LOGIN & LOGOUT FLOW FULLY VERIFIED!');
  } catch (err) {
    console.error('Test execution failed:', err);
  } finally {
    await browser.close();
  }
}

run();
