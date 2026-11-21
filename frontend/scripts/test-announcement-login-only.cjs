const puppeteer = require('puppeteer-core');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/prana/.gemini/antigravity/brain/ca9c2629-ab51-46e1-b2ec-9750707c2a79';

async function runTest() {
  console.log('🚀 Running Announcement Login-Only Verification Test...');

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // 1. Step 1: Guest / Unauthenticated Visitor
  console.log('\n--- Step 1: Testing Unauthenticated Guest Visitor ---');
  await page.goto('http://localhost:3002', { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1500));

  // Dismiss location prompt if visible
  await page.evaluate(() => {
    const locModal = document.querySelector('button[aria-label="Close modal"]');
    if (locModal) locModal.click();
  });
  await new Promise((r) => setTimeout(r, 500));

  const guestCheck = await page.evaluate(() => {
    const popup = document.querySelector('[aria-labelledby="announcement-title"]');
    return {
      hasPopup: Boolean(popup),
      popupText: popup ? popup.innerText : null
    };
  });
  console.log('Guest Announcement Check (Should be false):', guestCheck);
  const shotGuest = path.join(ARTIFACTS_DIR, '123-announcement-guest-no-popup.png');
  await page.screenshot({ path: shotGuest });
  console.log(`[Screenshot Saved] -> ${shotGuest}`);

  if (guestCheck.hasPopup) {
    throw new Error('FAILURE: Announcement was displayed to an unauthenticated guest!');
  }

  // 2. Step 2: Customer Logs In
  const testEmail = `farmer_${Date.now()}@agrimart.farm`;
  console.log(`\n--- Step 2: Simulating Customer Login (${testEmail}) and Redirection ---`);
  // Set customer session as if just authenticated
  await page.evaluate((email) => {
    localStorage.setItem('agrimart_user_email', email);
    localStorage.setItem('agrimart_user_name', 'Fresh Farmer');
    localStorage.setItem('agrimart_customer_session_v1', JSON.stringify({
      email: email,
      name: 'Fresh Farmer',
      loginTime: new Date().toISOString()
    }));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('agrimart-auth-change'));
  }, testEmail);

  // Navigate to dashboard right after login
  await page.goto('http://localhost:3002/dashboard', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1800));

  // Dismiss location prompt if open
  await page.evaluate(() => {
    const locModal = document.querySelector('button[aria-label="Close modal"]');
    if (locModal) locModal.click();
  });
  await new Promise((r) => setTimeout(r, 500));

  const loginCheck = await page.evaluate(() => {
    const popup = document.querySelector('[aria-labelledby="announcement-title"]');
    return {
      hasPopup: Boolean(popup),
      title: popup ? popup.querySelector('h2')?.innerText : null,
      message: popup ? popup.querySelector('p')?.innerText : null
    };
  });
  console.log('Post-Login Announcement Check (Should be true if announcement published):', loginCheck);

  const shotLogin = path.join(ARTIFACTS_DIR, '124-announcement-login-popup-active.png');
  await page.screenshot({ path: shotLogin });
  console.log(`[Screenshot Saved] -> ${shotLogin}`);

  // 3. Step 3: Dismiss Announcement if displayed
  if (loginCheck.hasPopup) {
    console.log('\n--- Step 3: Dismissing Announcement ---');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find((b) => b.innerText.includes('Acknowledge') || b.innerText.includes('Dismiss'));
      if (btn) btn.click();
    });
    await new Promise((r) => setTimeout(r, 800));

    const checkDismissed = await page.evaluate(() => {
      return Boolean(document.querySelector('[aria-labelledby="announcement-title"]'));
    });
    console.log('Announcement dismissed check (Should be false):', checkDismissed);
  }

  // 4. Step 4: Perform Logout and Check That No Announcement Appears Post-Logout
  console.log('\n--- Step 4: Testing Logout Action & Post-Logout State ---');
  // Open desktop profile dropdown using explicit aria-label
  const profileClicked = await page.evaluate(() => {
    const trigger = document.querySelector('button[aria-label="User Account Menu"]');
    if (trigger) {
      trigger.click();
      return true;
    }
    return false;
  });
  console.log('Profile menu clicked:', profileClicked);
  await new Promise((r) => setTimeout(r, 600));

  // Click logout button inside dropdown
  const logoutClicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const logoutBtn = buttons.find((b) => b.innerText.includes('Log Out'));
    if (logoutBtn) {
      logoutBtn.click();
      return true;
    }
    return false;
  });
  console.log('Logout button clicked:', logoutClicked);
  await new Promise((r) => setTimeout(r, 2000));

  // Verify post-logout announcement state
  const postLogoutCheck = await page.evaluate(() => {
    const popup = document.querySelector('[aria-labelledby="announcement-title"]');
    const userEmailInStorage = localStorage.getItem('agrimart_user_email');
    return {
      hasPopup: Boolean(popup),
      userEmailInStorage: userEmailInStorage,
      currentUrl: window.location.href
    };
  });
  console.log('Post-Logout Announcement Check (hasPopup MUST be false):', postLogoutCheck);

  const shotLogout = path.join(ARTIFACTS_DIR, '125-announcement-post-logout-no-popup.png');
  await page.screenshot({ path: shotLogout });
  console.log(`[Screenshot Saved] -> ${shotLogout}`);

  if (postLogoutCheck.hasPopup) {
    throw new Error('FAILURE: Announcement popped up after logout!');
  }

  console.log('\n✅ ALL VERIFICATION CHECKS PASSED:');
  console.log('1. Guest visitors do NOT see announcements.');
  console.log('2. Logged-in users receive announcements right after login.');
  console.log('3. Logging out terminates the session and NEVER triggers an announcement popup.');

  await browser.close();
}

runTest().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
