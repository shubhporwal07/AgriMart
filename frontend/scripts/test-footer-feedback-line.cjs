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
  console.log('🚀 Verifying Clean Footer Line with Give Feedback Link...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:3002', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1200));

  // Scroll to footer bottom bar
  await page.evaluate(() => {
    const footer = document.querySelector('footer');
    if (footer) footer.scrollIntoView({ behavior: 'instant', block: 'end' });
  });
  await new Promise((r) => setTimeout(r, 600));

  // Inspect the bottom bar elements
  const bottomBarDetails = await page.evaluate(() => {
    const btn = document.getElementById('site-feedback-tag');
    const linksRow = btn ? btn.parentElement : null;
    const links = linksRow ? Array.from(linksRow.querySelectorAll('a, button')).map((el) => el.innerText.trim()) : [];
    const style = btn ? window.getComputedStyle(btn) : null;

    return {
      hasBtn: Boolean(btn),
      btnText: btn ? btn.innerText.trim() : null,
      linksText: links,
      isTextLink: style ? style.backgroundColor === 'rgba(0, 0, 0, 0)' && style.borderRadius === '0px' : false,
      color: style ? style.color : null,
      fontSize: style ? style.fontSize : null,
    };
  });

  console.log('Footer bottom bar details:', bottomBarDetails);
  if (!bottomBarDetails.hasBtn || bottomBarDetails.btnText !== 'Give Feedback') {
    throw new Error('FAILED: Give Feedback button not found in bottom bar!');
  }

  const expectedLinks = ['Privacy Policy', 'Terms of Service', 'Return Policy', 'Give Feedback'];
  const matchesExpected = expectedLinks.every((l) => bottomBarDetails.linksText.includes(l));
  if (!matchesExpected) {
    throw new Error(`FAILED: Expected links ${expectedLinks.join(', ')}, got: ${bottomBarDetails.linksText.join(', ')}`);
  }
  console.log('✅ PASS: Footer bottom bar contains clean line: Privacy Policy | Terms of Service | Return Policy | Give Feedback');

  // Take screenshot of clean footer bottom bar matching Anil Jeweller's format
  const screenshotBottomBar = path.join(SCREENSHOT_DIR, '96-footer-bottom-bar-clean-give-feedback-line.png');
  await page.screenshot({ path: screenshotBottomBar });
  saveScreenshot(screenshotBottomBar, '96-footer-bottom-bar-clean-give-feedback-line.png');

  // Click Give Feedback
  console.log('Clicking Give Feedback text link in footer...');
  await page.evaluate(() => {
    const btn = document.getElementById('site-feedback-tag');
    btn.scrollIntoView({ behavior: 'instant', block: 'center' });
    btn.click();
  });
  await new Promise((r) => setTimeout(r, 800));

  const modalOpen = await page.evaluate(() => {
    const modal = document.querySelector('div[class*="backdrop-blur-sm"]');
    return {
      isOpen: Boolean(modal),
      hasTitle: document.body.innerText.includes('Share Feedback & Suggestions'),
    };
  });

  console.log('Modal opened check:', modalOpen);
  if (!modalOpen.isOpen || !modalOpen.hasTitle) {
    throw new Error('FAILED: Modal failed to open after clicking Give Feedback!');
  }
  console.log('✅ PASS: Clicking Give Feedback text link opens animated feedback modal.');

  const screenshotModal = path.join(SCREENSHOT_DIR, '97-give-feedback-modal-opened-from-footer-line.png');
  await page.screenshot({ path: screenshotModal });
  saveScreenshot(screenshotModal, '97-give-feedback-modal-opened-from-footer-line.png');

  await browser.close();
  console.log('🎉 FOOTER GIVE FEEDBACK LINE VERIFIED WITH 100% SUCCESS!');
}

run().catch((err) => {
  console.error('VERIFICATION ERROR:', err);
  process.exit(1);
});
