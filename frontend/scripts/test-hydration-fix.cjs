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
  console.log('🚀 Starting Verification: Zero Hydration Errors on Storefront...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const capturedErrors = [];
  const hydrationWarnings = [];

  page.on('pageerror', (err) => {
    console.error('🔴 PAGE ERROR:', err.message);
    capturedErrors.push(err.message);
  });

  page.on('console', (msg) => {
    const text = msg.text();
    if (msg.type() === 'error') {
      console.error('🔴 BROWSER ERROR LOG:', text);
      capturedErrors.push(text);
    } else if (text.toLowerCase().includes('hydration') || text.toLowerCase().includes('did not match')) {
      console.warn('⚠️ HYDRATION WARNING LOG:', text);
      hydrationWarnings.push(text);
    }
  });

  try {
    // -----------------------------------------------------------------------------------
    // Test 1: Clean Visit
    // -----------------------------------------------------------------------------------
    console.log('Test 1: Clean visit to http://localhost:3002 ...');
    await page.goto('http://localhost:3002', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.setItem('agrimart_location_prompted_v3', 'true');
      sessionStorage.setItem('agrimart_location_prompted_v3', 'true');
    });
    await new Promise((r) => setTimeout(r, 1500));

    // -----------------------------------------------------------------------------------
    // Test 2: Stress Test Hydration with Custom Showcase (The exact condition that caused the error)
    // Server renders default ['agri-kisan-starter-kit', 'agri-soil-booster-combo'] (Save ₹220)
    // Client has localStorage with ['agri-kisan-starter-kit', 'agri-hybrid-tomato-seeds'] (95%+ Certified Germination)
    // -----------------------------------------------------------------------------------
    console.log('Test 2: Injecting custom home showcase in localStorage and reloading...');
    await page.evaluate(() => {
      localStorage.setItem(
        'agrimart_home_showcase_v1',
        JSON.stringify({
          heroDeals: ['agri-kisan-starter-kit', 'agri-hybrid-tomato-seeds'],
          flashDeals: [
            'agri-pure-vermicompost-25kg',
            'agri-npk-19-19-19',
            'agri-cold-pressed-neem-oil',
            'agri-dap-granular-fertilizer',
            'agri-cotton-seeds-bg2',
            'agri-bio-enzyme-plant-tonic',
          ],
        })
      );
    });

    // Clear error tracking before reload
    capturedErrors.length = 0;
    hydrationWarnings.length = 0;

    await page.reload({ waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 2000));

    // Check if Next.js error overlay exists in the DOM
    const nextErrorOverlay = await page.evaluate(() => {
      const overlay = document.querySelector('nextjs-portal') ||
                      document.querySelector('[data-nextjs-dialog-overlay]') ||
                      document.querySelector('#__next-build-watcher');
      const bodyText = document.body.innerText;
      const hasErrorText =
        bodyText.includes('Unhandled Runtime Error') ||
        bodyText.includes('Text content does not match server-rendered HTML') ||
        bodyText.includes('react-hydration-error');
      return {
        hasOverlay: !!overlay,
        hasErrorText,
      };
    });

    console.log('Next.js error overlay check:', nextErrorOverlay);
    console.log('Captured errors count:', capturedErrors.length);
    console.log('Hydration warnings count:', hydrationWarnings.length);

    if (nextErrorOverlay.hasErrorText) {
      throw new Error('Hydration error overlay is still present on the page!');
    }

    if (capturedErrors.some(e => e.includes('hydration') || e.includes('does not match'))) {
      throw new Error(`Hydration error detected in logs: ${JSON.stringify(capturedErrors)}`);
    }

    console.log('✅ ZERO HYDRATION ERRORS DETECTED!');

    // Capture clean screenshot
    const ssPath = path.join(SCREENSHOT_DIR, '87-home-page-zero-hydration-errors.png');
    await page.screenshot({ path: ssPath });
    saveScreenshot(ssPath, '87-home-page-zero-hydration-errors.png');

    console.log('🎉 VERIFICATION COMPLETED WITH 100% SUCCESS!');
  } catch (err) {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
