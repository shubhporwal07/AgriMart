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
    console.error(`Failed to copy screenshot to artifacts: ${err.message}`);
  }
}

async function verifyNavbarAndLogout() {
  console.log('🔍 Starting Comprehensive Verification of Navbar, Dropdown & Logout Buttons...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Test 1: Desktop User Dropdown (1280px)
  console.log('1. Testing Desktop User Dropdown on 1280px...');
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:3002/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));

  // Set user session in localStorage
  await page.evaluate(() => {
    localStorage.setItem('agrimart_user_email', 'pranavsinghkia@gmail.com');
    localStorage.setItem('agrimart_user_name', 'Pranav Singh');
    localStorage.setItem('agrimart_customer_session_v1', JSON.stringify({
      email: 'pranavsinghkia@gmail.com',
      name: 'Pranav Singh',
      role: 'customer'
    }));
    document.querySelector('button[aria-label="Close Announcement"]')?.click();
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));

  // Dismiss announcement if open
  await page.evaluate(() => {
    document.querySelector('button[aria-label="Close Announcement"]')?.click();
  });

  // Click user profile button
  console.log('Clicking user account button...');
  const userBtn = await page.$('button[aria-expanded]');
  if (userBtn) {
    await userBtn.click();
    await new Promise(r => setTimeout(r, 500));
  }

  // Inspect dropdown and logout button visibility
  const dropdownMetrics = await page.evaluate(() => {
    const dropdown = document.querySelector('.origin-top-right');
    const logoutBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Log Out') || b.innerText.includes('Logout'));
    if (!dropdown || !logoutBtn) return { found: false };
    const dRect = dropdown.getBoundingClientRect();
    const lRect = logoutBtn.getBoundingClientRect();
    return {
      found: true,
      dropdownRect: { top: dRect.top, bottom: dRect.bottom, height: dRect.height, width: dRect.width },
      logoutBtnRect: { top: lRect.top, bottom: lRect.bottom, height: lRect.height, visible: lRect.height > 0 && lRect.top < window.innerHeight },
      logoutText: logoutBtn.innerText.trim()
    };
  });
  console.log('Desktop dropdown metrics:', dropdownMetrics);

  const shot1 = path.join(SCREENSHOT_DIR, '119-desktop-user-dropdown-logout-visible.png');
  await page.screenshot({ path: shot1, clip: { x: 700, y: 0, width: 580, height: 350 } });
  saveScreenshot(shot1, '119-desktop-user-dropdown-logout-visible.png');

  // Test 2: Mobile Drawer & Logout (360px viewport)
  console.log('2. Testing Mobile Navigation Drawer on 360px...');
  await page.setViewport({ width: 360, height: 800, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3002/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));

  await page.evaluate(() => {
    document.querySelector('button[aria-label="Close Announcement"]')?.click();
  });

  // Click mobile hamburger menu button
  const hamburgerBtn = await page.$('button[aria-label="Toggle Navigation"]');
  if (hamburgerBtn) {
    console.log('Opening mobile hamburger menu...');
    await hamburgerBtn.click();
    await new Promise(r => setTimeout(r, 1000));
  }

  // Inspect drawer content
  const mobileDrawerMetrics = await page.evaluate(() => {
    const drawer = document.querySelector('.z-50.sm\\:hidden.bg-white');
    const userBanner = drawer ? drawer.querySelector('.bg-\\[\\#FAF5EB\\]') : null;
    const categoryLinks = drawer ? Array.from(drawer.querySelectorAll('a[href*="category="]')).map(a => a.innerText.trim()) : [];
    const logoutBtn = drawer ? Array.from(drawer.querySelectorAll('button')).find(b => b.innerText.includes('Log Out') || b.innerText.includes('Logout')) : null;
    
    // Check duplicates in categoryLinks
    const uniqueCategories = Array.from(new Set(categoryLinks));
    const hasDuplicates = categoryLinks.length !== uniqueCategories.length;

    return {
      drawerOpen: !!drawer,
      hasUserBanner: !!userBanner,
      userBannerText: userBanner ? userBanner.innerText.replace(/\n+/g, ' ') : null,
      categoryCount: categoryLinks.length,
      categories: categoryLinks,
      hasDuplicates,
      hasLogoutBtn: !!logoutBtn,
      logoutBtnText: logoutBtn ? logoutBtn.innerText.replace(/\n+/g, ' ') : null
    };
  });
  console.log('Mobile drawer metrics:', mobileDrawerMetrics);

  const shot2 = path.join(SCREENSHOT_DIR, '120-mobile-menu-drawer-logout-visible.png');
  await page.screenshot({ path: shot2 });
  saveScreenshot(shot2, '120-mobile-menu-drawer-logout-visible.png');

  // Test 3: Login Page Logo
  console.log('3. Testing Login Page Logo on 360px...');
  await page.goto('http://localhost:3002/login', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));

  const loginPageMetrics = await page.evaluate(() => {
    const legacyImg = document.querySelector('img[src*="logo.png"]');
    const plantIcon = document.querySelector('.bg-\\[\\#0B1B30\\] span.material-symbols-outlined');
    return {
      hasLegacyLogoPng: !!legacyImg,
      hasAgriPlantIcon: !!plantIcon && plantIcon.innerText.includes('potted_plant'),
      headerText: document.querySelector('header')?.innerText.replace(/\n+/g, ' ')
    };
  });
  console.log('Login page logo metrics:', loginPageMetrics);

  const shot3 = path.join(SCREENSHOT_DIR, '121-login-page-agrimart-plant-logo.png');
  await page.screenshot({ path: shot3, clip: { x: 0, y: 0, width: 360, height: 350 } });
  saveScreenshot(shot3, '121-login-page-agrimart-plant-logo.png');

  // Test 4: Perform Logout Action from Mobile Drawer
  console.log('4. Performing Logout from Mobile Drawer...');
  await page.goto('http://localhost:3002/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));
  await page.evaluate(() => {
    document.querySelector('button[aria-label="Close Announcement"]')?.click();
  });

  const hamburgerAgain = await page.$('button[aria-label="Toggle Navigation"]');
  if (hamburgerAgain) {
    await hamburgerAgain.click();
    await new Promise(r => setTimeout(r, 800));
  }

  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Log Out'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  const postLogoutState = await page.evaluate(() => {
    return {
      userEmailStorage: localStorage.getItem('agrimart_user_email'),
      customerSession: localStorage.getItem('agrimart_customer_session_v1'),
      hasSignInBtn: !!document.querySelector('a[href="/login"]')
    };
  });
  console.log('Post-logout state:', postLogoutState);

  const shot4 = path.join(SCREENSHOT_DIR, '122-logout-action-executed-clean.png');
  await page.screenshot({ path: shot4, clip: { x: 0, y: 0, width: 360, height: 400 } });
  saveScreenshot(shot4, '122-logout-action-executed-clean.png');

  await browser.close();
  console.log('🎉 Navbar & Logout Verification Complete!');
}

verifyNavbarAndLogout().catch(console.error);
