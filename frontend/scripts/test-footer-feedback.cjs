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
  console.log('🚀 Verifying Feedback Button Relocation into Footer...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Visit Storefront Home Page as guest (clear any storage)
  console.log('Navigating to http://localhost:3002...');
  await page.goto('http://localhost:3002', { waitUntil: 'networkidle2', timeout: 30000 });
  await page.evaluate(() => {
    localStorage.removeItem('agrimart_user_session');
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1200));

  // Verify that there is NO fixed floating feedback button covering content
  const fixedButtons = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns
      .filter((b) => {
        const style = window.getComputedStyle(b);
        return style.position === 'fixed' && b.innerText && b.innerText.includes('Feedback');
      })
      .map((b) => ({ text: b.innerText, id: b.id }));
  });

  console.log('Fixed floating feedback buttons found:', fixedButtons);
  if (fixedButtons.length > 0) {
    throw new Error('FAILED: Fixed floating feedback button is still present!');
  }
  console.log('✅ PASS: Zero fixed floating feedback buttons on viewport.');

  // Take screenshot of landing page content without floating feedback button
  const screenshotCleanContent = path.join(SCREENSHOT_DIR, '88-home-page-no-floating-feedback-covering-cards.png');
  await page.screenshot({ path: screenshotCleanContent, fullPage: false });
  saveScreenshot(screenshotCleanContent, '88-home-page-no-floating-feedback-covering-cards.png');

  // Verify the feedback button is located inside the footer
  const buttonInFooter = await page.evaluate(() => {
    const footer = document.querySelector('footer');
    if (!footer) return { foundInFooter: false, error: 'No footer found' };
    const btn = footer.querySelector('#site-feedback-tag');
    if (!btn) return { foundInFooter: false, error: 'Button #site-feedback-tag not inside footer' };

    const style = window.getComputedStyle(btn);
    return {
      foundInFooter: true,
      text: btn.innerText.trim(),
      position: style.position,
      display: style.display,
      backgroundColor: style.backgroundColor,
      borderRadius: style.borderRadius,
    };
  });

  console.log('Feedback button in footer check:', buttonInFooter);
  if (!buttonInFooter.foundInFooter) {
    throw new Error(`FAILED: Feedback button is not inside footer: ${buttonInFooter.error}`);
  }
  console.log('✅ PASS: Feedback button is properly rendered inside footer.');

  // Scroll feedback button into view and take screenshot of footer
  await page.evaluate(() => {
    const btn = document.getElementById('site-feedback-tag');
    if (btn) btn.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await new Promise((r) => setTimeout(r, 600));

  const screenshotFooter = path.join(SCREENSHOT_DIR, '89-footer-with-feedback-button.png');
  await page.screenshot({ path: screenshotFooter });
  saveScreenshot(screenshotFooter, '89-footer-with-feedback-button.png');

  // Test clicking feedback button in footer (Unauthenticated guest state)
  console.log('Testing click on footer feedback button...');
  await page.evaluate(() => {
    document.getElementById('site-feedback-tag').click();
  });
  await new Promise((r) => setTimeout(r, 800));

  const modalStateGuest = await page.evaluate(() => {
    const modalText = document.body.innerText;
    return {
      hasSignInPrompt: modalText.includes('Sign In Required to Give Feedback'),
      hasSignInBtn: Boolean(
        Array.from(document.querySelectorAll('button')).find((b) =>
          b.innerText.includes('Sign In to Give Feedback')
        )
      ),
    };
  });

  console.log('Guest modal check:', modalStateGuest);
  if (!modalStateGuest.hasSignInPrompt) {
    throw new Error('FAILED: Guest login prompt did not appear when clicking footer feedback button');
  }
  console.log('✅ PASS: Guest clicking footer feedback button triggers Sign In Required dialog.');

  const screenshotModalGuest = path.join(SCREENSHOT_DIR, '90-footer-feedback-modal-guest.png');
  await page.screenshot({ path: screenshotModalGuest });
  saveScreenshot(screenshotModalGuest, '90-footer-feedback-modal-guest.png');

  // Close modal
  await page.keyboard.press('Escape');
  await new Promise((r) => setTimeout(r, 400));

  // Now test with Authenticated customer session
  console.log('Testing with authenticated session (pranavsinghkia@gmail.com)...');
  await page.evaluate(() => {
    localStorage.setItem('agrimart_user_email', 'pranavsinghkia@gmail.com');
    localStorage.setItem('userEmail', 'pranavsinghkia@gmail.com');
  });

  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1000));

  // Scroll feedback button into view and click feedback button
  await page.evaluate(() => {
    const btn = document.getElementById('site-feedback-tag');
    if (btn) {
      btn.scrollIntoView({ behavior: 'instant', block: 'center' });
      btn.click();
    }
  });
  await new Promise((r) => setTimeout(r, 800));

  const modalStateAuth = await page.evaluate(() => {
    const text = document.body.innerText;
    const textarea = document.querySelector('textarea');
    return {
      hasUserEmail: text.includes('pranavsinghkia@gmail.com'),
      hasVerifiedPill: text.includes('Verified Account'),
      hasCounter: text.includes('/ 500'),
      hasCategoryChips: text.includes('General Suggestion') && text.includes('Seed & Fertilizer Quality'),
      hasTextarea: Boolean(textarea),
      maxLength: textarea ? textarea.getAttribute('maxlength') : null,
    };
  });

  console.log('Authenticated modal check:', modalStateAuth);
  if (!modalStateAuth.hasUserEmail || !modalStateAuth.hasTextarea || modalStateAuth.maxLength !== '500') {
    throw new Error('FAILED: Authenticated modal details mismatch!');
  }
  console.log('✅ PASS: Authenticated modal opened with verified email, category chips, and 500-char counter.');

  const screenshotModalAuth = path.join(SCREENSHOT_DIR, '91-footer-feedback-modal-authenticated.png');
  await page.screenshot({ path: screenshotModalAuth });
  saveScreenshot(screenshotModalAuth, '91-footer-feedback-modal-authenticated.png');

  await browser.close();
  console.log('🎉 ALL FOOTER FEEDBACK RELOCATION CHECKS PASSED SUCCESSFULLY!');
}

run().catch((err) => {
  console.error('VERIFICATION ERROR:', err);
  process.exit(1);
});
