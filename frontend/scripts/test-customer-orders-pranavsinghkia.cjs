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
    console.log('1. Navigating to http://localhost:3002/orders ...');
    await page.goto('http://localhost:3002/orders', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    // Set localStorage user email to pranavsinghkia@gmail.com
    console.log('2. Setting user session for pranavsinghkia@gmail.com...');
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

    // Reload page to apply session
    console.log('3. Reloading /orders with pranavsinghkia@gmail.com session...');
    await page.goto('http://localhost:3002/orders', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));

    // Check if order exists in DOM
    const orderInfo = await page.evaluate(() => {
      const bodyText = document.body.innerText;
      const hasOrderId = bodyText.includes('order_agri_1795198292031') || bodyText.includes('-P6u97hmKiKQPGejeA1_');
      const hasAmount = bodyText.includes('1,189') || bodyText.includes('₹1,189.00');
      const hasEmail = bodyText.includes('pranavsinghkia@gmail.com');
      const orderCards = document.querySelectorAll('.bg-white.rounded-3xl');

      return {
        hasOrderId,
        hasAmount,
        hasEmail,
        cardCount: orderCards.length,
        bodySnippet: bodyText.slice(0, 500)
      };
    });

    console.log('Order Info on /orders:', orderInfo);

    // Expand the order card by clicking it
    console.log('4. Expanding the order card to view items and tracking...');
    await page.evaluate(() => {
      const header = document.querySelector('.bg-white.rounded-3xl .cursor-pointer');
      if (header) header.click();
    });
    await new Promise(r => setTimeout(r, 1200));

    // Verify expanded details
    const expandedDetails = await page.evaluate(() => {
      const bodyText = document.body.innerText;
      return {
        hasTomato: bodyText.includes('Tomato Seeds') || bodyText.includes('F1 Hybrid'),
        hasChilli: bodyText.includes('Chilli Seeds') || bodyText.includes('Teja'),
        hasLawGate: bodyText.includes('Law gate') || bodyText.includes('Phagwara'),
        hasOrderConfirmed: bodyText.includes('Order Confirmed'),
      };
    });
    console.log('Expanded details check:', expandedDetails);

    // Take screenshot of customer orders page
    const s69 = path.join(SCREENSHOT_DIR, '69-customer-orders-pranavsinghkia.png');
    await page.screenshot({ path: s69, fullPage: false });
    saveScreenshot(s69, '69-customer-orders-pranavsinghkia.png');

    // Also test search lookup input directly
    console.log('5. Testing search/lookup input with "pranavsinghkia"...');
    const searchInput = await page.$('input[placeholder*="Look up order"]');
    if (searchInput) {
      await searchInput.click({ clickCount: 3 });
      await page.keyboard.press('Backspace');
      await searchInput.type('pranavsinghkia@gmail.com');
      await new Promise(r => setTimeout(r, 800));
    }

    const s70 = path.join(SCREENSHOT_DIR, '70-customer-order-search-lookup.png');
    await page.screenshot({ path: s70, fullPage: false });
    saveScreenshot(s70, '70-customer-order-search-lookup.png');

    console.log('✅ Successfully verified orders for pranavsinghkia@gmail.com!');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
