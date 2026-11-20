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
    console.log(`Saved screenshot to artifact directory: ${destPath}`);
  } catch (err) {
    console.error('Failed to copy screenshot to artifacts:', err);
  }
}

async function run() {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  try {
    console.log('--- TEST 1: Arrow After Login in Navbar ---');
    // Set customer session as Pranav Singh
    await page.goto('http://localhost:3002/', { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
      localStorage.setItem('agrimart_user_email', 'pranavsinghkia@gmail.com');
      localStorage.setItem('userEmail', 'pranavsinghkia@gmail.com');
      localStorage.setItem('agrimart_user_location', JSON.stringify({
        address: 'LPU Campus / Law Gate (Hub Location)',
        distanceKm: 0.1,
        isServiceable: true,
      }));
      sessionStorage.setItem('agrimart_location_modal_dismissed', 'true');
    });

    // Also simulate user in Auth state by clicking sign-in or evaluating
    // Let's go to /login and log in as customer or admin to verify live user state in Navbar
    console.log('Logging in on /login with admin credentials or setting auth state...');
    await page.goto('http://localhost:3002/login', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));

    // Fill login form with admin to verify user profile button
    const emailInput = await page.$('input[placeholder*="email" i], input[type="text"], input[type="email"]');
    const passInput = await page.$('input[type="password"]');
    if (emailInput && passInput) {
      await emailInput.type('admin');
      await passInput.type('admin9876');
      const submitBtn = await page.$('button[type="submit"]');
      if (submitBtn) await submitBtn.click();
      await new Promise(r => setTimeout(r, 1200));
    }

    // Now go to home page
    await page.goto('http://localhost:3002/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    // Verify user profile button and the arrow
    const arrowCheck = await page.evaluate(() => {
      const userBtn = document.querySelector('button[aria-expanded]');
      if (!userBtn) return { found: false, error: 'User button not found' };

      const nameEl = userBtn.querySelector('span.text-xs');
      const arrowSvg = userBtn.querySelector('svg');
      const nameText = nameEl ? nameEl.innerText : '';
      const arrowRect = arrowSvg ? arrowSvg.getBoundingClientRect() : null;

      return {
        found: true,
        nameText,
        hasArrowSvg: !!arrowSvg,
        arrowRect: arrowRect ? {
          width: arrowRect.width,
          height: arrowRect.height,
          top: arrowRect.top,
          left: arrowRect.left
        } : null,
      };
    });

    console.log('User profile arrow check:', arrowCheck);

    // Click user button to open dropdown and verify rotated arrow
    await page.evaluate(() => {
      const userBtn = document.querySelector('button[aria-expanded]');
      if (userBtn) userBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    // Take screenshot of navbar with profile dropdown open and clear arrow
    const s71 = path.join(SCREENSHOT_DIR, '71-navbar-user-arrow-and-dropdown.png');
    await page.screenshot({ path: s71 });
    saveScreenshot(s71, '71-navbar-user-arrow-and-dropdown.png');

    console.log('--- TEST 2: Colored Website Scroller ---');
    // Check computed scrollbar styles
    const scrollbarStyles = await page.evaluate(() => {
      const htmlStyle = window.getComputedStyle(document.documentElement);
      const bodyStyle = window.getComputedStyle(document.body);
      return {
        htmlScrollbarColor: htmlStyle.scrollbarColor,
        htmlScrollbarWidth: htmlStyle.scrollbarWidth,
        bodyScrollbarColor: bodyStyle.scrollbarColor,
        scrollHeight: document.documentElement.scrollHeight,
        clientHeight: document.documentElement.clientHeight,
      };
    });
    console.log('Scrollbar computed styles:', scrollbarStyles);

    console.log('--- TEST 3: Floating Cart Pill Not Covering Footer Details ---');
    // Navigate to home page and add products to cart using real storefront button
    await page.goto('http://localhost:3002/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    // Click "Quick Order Kit" or "Quick Order Combo" on home page hero cards
    console.log('Clicking Quick Order button to add items to cart...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const quickBtn = buttons.find(b => b.innerText && (b.innerText.includes('Quick Order') || b.innerText.includes('Add to Cart')));
      if (quickBtn) quickBtn.click();
    });
    // Wait for CartAddedPopup notice to complete and auto-dismiss (3 seconds)
    console.log('Waiting for toast to settle so floating cart pill is prominent...');
    await new Promise(r => setTimeout(r, 3200));

    // Scroll all the way to the bottom of the page
    console.log('Scrolling all the way to the bottom of the page...');
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await new Promise(r => setTimeout(r, 1200));

    // Check overlap between footer details and floating pill
    const overlapCheck = await page.evaluate(() => {
      const floatingPillContainer = document.querySelector('.fixed.bottom-6.right-6');
      const floatingPill = floatingPillContainer ? floatingPillContainer.querySelector('a') : null;
      const footer = document.querySelector('footer');
      const licenseEl = Array.from(document.querySelectorAll('span, p')).find(el => el.innerText && el.innerText.includes('Seed License No'));

      const pillRect = floatingPill ? floatingPill.getBoundingClientRect() : null;
      const footerRect = footer ? footer.getBoundingClientRect() : null;
      const licenseRect = licenseEl ? licenseEl.getBoundingClientRect() : null;

      let isCovered = false;
      let verticalGap = null;
      if (pillRect && licenseRect) {
        // Vertical gap between bottom of license text and top of pill
        verticalGap = pillRect.top - licenseRect.bottom;
        isCovered = !(
          pillRect.right < licenseRect.left ||
          pillRect.left > licenseRect.right ||
          pillRect.bottom < licenseRect.top ||
          pillRect.top > licenseRect.bottom
        );
      }

      return {
        hasFloatingPill: !!floatingPill,
        pillText: floatingPill ? floatingPill.innerText.replace(/\s+/g, ' ') : null,
        hasLicense: !!licenseEl,
        licenseText: licenseEl ? licenseEl.innerText.replace(/\s+/g, ' ') : null,
        isCovered,
        verticalGapPx: verticalGap,
        pillRect: pillRect ? { top: pillRect.top, bottom: pillRect.bottom, left: pillRect.left, right: pillRect.right } : null,
        licenseRect: licenseRect ? { top: licenseRect.top, bottom: licenseRect.bottom, left: licenseRect.left, right: licenseRect.right } : null,
      };
    });

    console.log('Overlap check between pill and footer details:', overlapCheck);

    // Capture screenshot at bottom of page showing footer and floating pill with clear separation
    const s72 = path.join(SCREENSHOT_DIR, '72-footer-details-not-covered-by-cart-pill.png');
    await page.screenshot({ path: s72 });
    saveScreenshot(s72, '72-footer-details-not-covered-by-cart-pill.png');

    // Also capture full view of colored scrollbar track and thumb on right edge
    const s73 = path.join(SCREENSHOT_DIR, '73-website-colored-scroller.png');
    await page.screenshot({ path: s73 });
    saveScreenshot(s73, '73-website-colored-scroller.png');

    console.log('✅ All 3 tests executed successfully!');
  } catch (err) {
    console.error('❌ Test script error:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
