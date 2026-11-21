const puppeteer = require('puppeteer-core');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/prana/.gemini/antigravity/brain/ca9c2629-ab51-46e1-b2ec-9750707c2a79';

async function runMobileTest() {
  console.log('📱 Running Mobile Announcement Login/Logout Verification Test...');

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  // Standard mobile viewport
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  // 1. Mobile Guest check
  console.log('\n--- Step 1: Mobile Guest Visitor ---');
  await page.goto('http://localhost:3002', { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1200));

  // Dismiss location prompt if open
  await page.evaluate(() => {
    const locModal = document.querySelector('button[aria-label="Close modal"]');
    if (locModal) locModal.click();
  });
  await new Promise((r) => setTimeout(r, 400));

  const mobileGuestCheck = await page.evaluate(() => {
    const popup = document.querySelector('[aria-labelledby="announcement-title"]');
    return Boolean(popup);
  });
  console.log('Mobile Guest Announcement Check (Should be false):', mobileGuestCheck);

  const shotMobileGuest = path.join(ARTIFACTS_DIR, '126-mobile-guest-no-announcement.png');
  await page.screenshot({ path: shotMobileGuest });
  console.log(`[Screenshot Saved] -> ${shotMobileGuest}`);

  if (mobileGuestCheck) {
    throw new Error('FAILURE: Announcement was shown to a mobile guest!');
  }

  // 2. Mobile User Login
  const mobileEmail = `mobile_farmer_${Date.now()}@agrimart.farm`;
  console.log(`\n--- Step 2: Simulating Mobile Customer Login (${mobileEmail}) ---`);
  await page.evaluate((email) => {
    localStorage.setItem('agrimart_user_email', email);
    localStorage.setItem('agrimart_user_name', 'Mobile Kisan');
    localStorage.setItem('agrimart_customer_session_v1', JSON.stringify({
      email: email,
      name: 'Mobile Kisan',
      loginTime: new Date().toISOString()
    }));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('agrimart-auth-change'));
  }, mobileEmail);

  await page.goto('http://localhost:3002/dashboard', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1500));

  // Dismiss location prompt if open
  await page.evaluate(() => {
    const locModal = document.querySelector('button[aria-label="Close modal"]');
    if (locModal) locModal.click();
  });
  await new Promise((r) => setTimeout(r, 400));

  const mobileLoginCheck = await page.evaluate(() => {
    const popup = document.querySelector('[aria-labelledby="announcement-title"]');
    return {
      hasPopup: Boolean(popup),
      text: popup ? popup.innerText : null
    };
  });
  console.log('Mobile Login Announcement Check (Should be true):', mobileLoginCheck);

  const shotMobileLogin = path.join(ARTIFACTS_DIR, '127-mobile-login-announcement-popup.png');
  await page.screenshot({ path: shotMobileLogin });
  console.log(`[Screenshot Saved] -> ${shotMobileLogin}`);

  // 3. Dismiss on mobile
  if (mobileLoginCheck.hasPopup) {
    console.log('\n--- Step 3: Dismissing Announcement on Mobile ---');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find((b) => b.innerText.includes('Acknowledge') || b.innerText.includes('Dismiss'));
      if (btn) btn.click();
    });
    await new Promise((r) => setTimeout(r, 600));
  }

  // 4. Open Mobile Drawer Menu and Click Logout
  console.log('\n--- Step 4: Open Mobile Drawer and Click Log Out ---');
  await page.evaluate(() => {
    const hamburger = document.querySelector('button[aria-label="Toggle Navigation"]');
    if (hamburger) hamburger.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  // Click the red "Log Out of AgriMart" button in drawer
  const mobileLogoutClicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const logoutBtn = buttons.find((b) => b.innerText.includes('Log Out of AgriMart') || b.innerText.includes('Log Out'));
    if (logoutBtn) {
      logoutBtn.click();
      return true;
    }
    return false;
  });
  console.log('Mobile drawer logout button clicked:', mobileLogoutClicked);
  await new Promise((r) => setTimeout(r, 1800));

  // 5. Verify Post-Logout state on Mobile
  const mobilePostLogoutCheck = await page.evaluate(() => {
    const popup = document.querySelector('[aria-labelledby="announcement-title"]');
    const email = localStorage.getItem('agrimart_user_email');
    return {
      hasPopup: Boolean(popup),
      userEmail: email,
      url: window.location.href
    };
  });
  console.log('Mobile Post-Logout Check (hasPopup MUST be false):', mobilePostLogoutCheck);

  const shotMobilePostLogout = path.join(ARTIFACTS_DIR, '128-mobile-post-logout-no-announcement.png');
  await page.screenshot({ path: shotMobilePostLogout });
  console.log(`[Screenshot Saved] -> ${shotMobilePostLogout}`);

  if (mobilePostLogoutCheck.hasPopup) {
    throw new Error('FAILURE: Announcement showed on mobile after logout!');
  }

  console.log('\n✅ MOBILE VERIFICATION PASSED: No announcement on guest or post-logout on mobile!');
  await browser.close();
}

runMobileTest().catch((err) => {
  console.error('❌ Mobile test failed:', err);
  process.exit(1);
});
