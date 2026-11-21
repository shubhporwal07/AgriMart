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

async function run() {
  console.log('🚀 Generating Clean Screenshots: Feedback Floating Widget & Forms...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  try {
    // -------------------------------------------------------------
    // Step 1: Visit Storefront as Unauthenticated Guest (Location Prompt Dismissed)
    // -------------------------------------------------------------
    console.log('Step 1: Navigating to http://localhost:3002 (unauthenticated guest)...');
    await page.goto('http://localhost:3002', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
      // Set location prompted flag to suppress initial location modal
      localStorage.setItem('agrimart_location_prompted_v3', 'true');
      sessionStorage.setItem('agrimart_location_prompted_v3', 'true');
      localStorage.setItem('agrimart_delivery_location_v3', JSON.stringify({
        id: 'loc_phagwara_hub',
        name: 'LPU Campus / Law Gate (Hub Location)',
        area: 'Lovely Professional University, Phagwara - 144411',
        distanceKm: 0.1,
        isServiceable: true,
        deliveryTime: '⚡ Express & Standard'
      }));
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1200));

    // Ensure any open location modal is closed if it rendered
    await page.evaluate(() => {
      const closeBtn = document.querySelector('button[aria-label="Close modal"]') ||
                       document.querySelector('button[aria-label="Close location dialog"]');
      if (closeBtn) closeBtn.click();
    });
    await new Promise(r => setTimeout(r, 400));

    // Check for the floating tag #site-feedback-tag
    await page.waitForSelector('#site-feedback-tag', { timeout: 8000 });
    console.log('✅ Floating feedback tag visible at bottom-left.');

    const ss1 = path.join(SCREENSHOT_DIR, '81-feedback-floating-tag.png');
    await page.screenshot({ path: ss1 });
    saveScreenshot(ss1, '81-feedback-floating-tag.png');

    // -------------------------------------------------------------
    // Step 2: Click Floating Tag when Unauthenticated -> Login Prompt
    // -------------------------------------------------------------
    console.log('Step 2: Clicking floating feedback tag while unauthenticated...');
    await page.evaluate(() => {
      document.getElementById('site-feedback-tag').click();
    });
    await new Promise(r => setTimeout(r, 800));

    // Verify login required prompt appears
    await page.waitForFunction(() => {
      return document.body.innerText.includes('Sign In Required to Give Feedback');
    }, { timeout: 6000 });
    console.log('✅ Animated login required dialog displayed properly.');

    const ss2 = path.join(SCREENSHOT_DIR, '82-feedback-login-required-modal.png');
    await page.screenshot({ path: ss2 });
    saveScreenshot(ss2, '82-feedback-login-required-modal.png');

    // -------------------------------------------------------------
    // Step 3: Authenticate User (pranavsinghkia@gmail.com)
    // -------------------------------------------------------------
    console.log('Step 3: Setting authenticated customer session for pranavsinghkia@gmail.com...');
    await page.evaluate(() => {
      localStorage.setItem('agrimart_user_email', 'pranavsinghkia@gmail.com');
      localStorage.setItem('userEmail', 'pranavsinghkia@gmail.com');
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('agrimart-auth-change'));
    });

    // Close the login modal and re-click feedback tag
    await page.evaluate(() => {
      const cancelBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Cancel'));
      if (cancelBtn) cancelBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    // Click feedback tag again as logged-in user
    console.log('Clicking feedback tag as logged-in user...');
    await page.evaluate(() => {
      document.getElementById('site-feedback-tag').click();
    });
    await new Promise(r => setTimeout(r, 800));

    // Verify authenticated feedback modal
    await page.waitForFunction(() => {
      return document.body.innerText.includes('Share Feedback & Suggestions') &&
             document.body.innerText.includes('pranavsinghkia@gmail.com');
    }, { timeout: 6000 });
    console.log('✅ Authenticated feedback form opened with verified account badge.');

    // Select category chip: "Website Feature Request"
    await page.evaluate(() => {
      const chip = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Website Feature Request'));
      if (chip) chip.click();
    });
    await new Promise(r => setTimeout(r, 300));

    // Type feedback message under 500 characters
    const feedbackText = "AgriMart delivery to Law Gate arrived in 24 hours with 96% seed germination! Please add drip irrigation accessories and solar pump parts to catalog.";
    console.log(`Typing feedback (${feedbackText.length} characters / 500 max)...`);

    const textarea = await page.waitForSelector('textarea[placeholder*="under 500 characters"]');
    await textarea.type(feedbackText, { delay: 10 });
    await new Promise(r => setTimeout(r, 500));

    const ss3 = path.join(SCREENSHOT_DIR, '83-feedback-authenticated-form-500chars.png');
    await page.screenshot({ path: ss3 });
    saveScreenshot(ss3, '83-feedback-authenticated-form-500chars.png');

    console.log('🎉 ALL SCREENSHOTS REFRESHED CLEANLY!');
  } catch (err) {
    console.error('❌ Failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
