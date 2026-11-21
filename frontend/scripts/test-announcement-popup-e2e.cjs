const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:/Users/prana/.gemini/antigravity/brain/ca9c2629-ab51-46e1-b2ec-9750707c2a79';

async function runTest() {
  console.log('🚀 Running Announcement Popup End-to-End Verification...');

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // Clear local storage and cookies to start fresh
  await page.goto('http://localhost:3002', { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1200));

  // 1. Verify Guest sees the Announcement
  console.log('\nStep 1: Checking guest announcement visibility on home page...');
  const guestCheck = await page.evaluate(() => {
    const popup = document.querySelector('[aria-labelledby="announcement-title"]');
    const msg = popup ? popup.querySelector('p')?.innerText : null;
    return {
      hasPopup: Boolean(popup),
      message: msg
    };
  });
  console.log('Guest Announcement Check:', guestCheck);

  const shotGuest = path.join(ARTIFACTS_DIR, '103-announcement-popup-visible-on-website.png');
  await page.screenshot({ path: shotGuest });
  console.log(`[Screenshot Saved] -> ${shotGuest}`);

  // 2. Now simulate a logged in customer
  console.log('\nStep 2: Simulating logged-in customer (farmerkisan@agrimart.farm)...');
  await page.evaluate(() => {
    localStorage.setItem('agrimart_user_email', 'farmerkisan@agrimart.farm');
    localStorage.setItem('userEmail', 'farmerkisan@agrimart.farm');
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('agrimart-auth-change'));
  });

  // Navigate to dashboard
  await page.goto('http://localhost:3002/dashboard', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1500));

  // Dismiss location modal if it popped up before announcement
  await page.evaluate(() => {
    const locModal = document.querySelector('button[aria-label="Close modal"]');
    if (locModal) locModal.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  // Check announcement visibility for logged in user on /dashboard
  const loggedInCheck = await page.evaluate(() => {
    const popup = document.querySelector('[aria-labelledby="announcement-title"]');
    const msg = popup ? popup.querySelector('p')?.innerText : null;
    const title = popup ? popup.querySelector('h2')?.innerText : null;
    return {
      hasPopup: Boolean(popup),
      title: title,
      message: msg
    };
  });
  console.log('Logged-In User Announcement Check on /dashboard:', loggedInCheck);

  const shotLoggedIn = path.join(ARTIFACTS_DIR, '104-announcement-visible-after-user-login.png');
  await page.screenshot({ path: shotLoggedIn });
  console.log(`[Screenshot Saved] -> ${shotLoggedIn}`);

  // 3. Click "Acknowledge & Dismiss" button
  console.log('\nStep 3: Clicking "Acknowledge & Dismiss"...');
  const dismissResult = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find((b) => b.innerText.includes('Acknowledge') || b.innerText.includes('Dismiss'));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log('Dismiss button clicked:', dismissResult);
  await new Promise((r) => setTimeout(r, 800));

  // 4. Verify popup is now gone
  const afterDismissCheck = await page.evaluate(() => {
    const popup = document.querySelector('[aria-labelledby="announcement-title"]');
    return {
      hasPopup: Boolean(popup)
    };
  });
  console.log('Announcement after dismiss:', afterDismissCheck);

  const shotDismissed = path.join(ARTIFACTS_DIR, '105-announcement-dismissed-clean.png');
  await page.screenshot({ path: shotDismissed });
  console.log(`[Screenshot Saved] -> ${shotDismissed}`);

  // 5. Reload page to verify it does not re-appear (since type === 'once')
  console.log('\nStep 5: Reloading page to verify "Show Once" suppression...');
  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1500));

  const reloadCheck = await page.evaluate(() => {
    const popup = document.querySelector('[aria-labelledby="announcement-title"]');
    return {
      hasPopup: Boolean(popup)
    };
  });
  console.log('Announcement after reload for same user:', reloadCheck);

  await browser.close();

  if (loggedInCheck.hasPopup && !afterDismissCheck.hasPopup && !reloadCheck.hasPopup) {
    console.log('\n🎉 ALL ANNOUNCEMENT TESTS PASSED PERFECTLY!');
  } else {
    throw new Error('Announcement assertion failed!');
  }
}

runTest().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
