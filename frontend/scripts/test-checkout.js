import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = path.resolve(process.cwd(), 'screenshots');

async function testCheckout() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,900'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  page.on('console', (msg) => console.log('BROWSER LOG:', msg.type(), msg.text()));

  try {
    // 1. Go to dashboard and add item
    await page.goto('http://localhost:3002/dashboard', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));
    
    // Add product to cart
    const addBtns = await page.$$('button');
    for (const b of addBtns) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text && text.includes('ADD')) {
        await b.click();
        console.log('Added product to cart');
        break;
      }
    }
    await new Promise(r => setTimeout(r, 800));

    // 2. Go to cart
    await page.goto('http://localhost:3002/cart', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    // Click Proceed to Delivery & Payment
    const clicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.innerText.includes('Proceed to Delivery'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    console.log('Clicked Proceed to Delivery:', clicked);
    await new Promise(r => setTimeout(r, 1000));

    // Inspect Modal
    const modalButtons = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button')).map(b => b.innerText);
    });
    console.log('Modal buttons:', modalButtons);

    // Click Online Payment container
    await page.evaluate(() => {
      const divs = Array.from(document.querySelectorAll('div'));
      const onlineDiv = divs.find(d => d.innerText.includes('Online Payment') && d.innerText.includes('UPI/Card'));
      if (onlineDiv) {
        onlineDiv.click();
      }
    });
    await new Promise(r => setTimeout(r, 500));

    // Fill in inputs via evaluate
    await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const fullNameInput = inputs.find(i => i.placeholder && i.placeholder.includes('full name'));
      const phoneInput = inputs.find(i => i.placeholder && i.placeholder.includes('mobile'));
      const streetInput = inputs.find(i => i.placeholder && (i.placeholder.includes('Street') || i.placeholder.includes('Model Town')));
      const pinInput = inputs.find(i => i.placeholder && i.placeholder.includes('PIN'));

      if (fullNameInput) {
        fullNameInput.value = 'Rajinder Singh';
        fullNameInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (phoneInput) {
        phoneInput.value = '9876543210';
        phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (streetInput) {
        streetInput.value = 'Main Farm Gate, GT Road';
        streetInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (pinInput) {
        pinInput.value = '144401';
        pinInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test-modal-filled.png') });

    // Check button text now
    const payBtnText = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.innerText.includes('Pay Online') || b.innerText.includes('Place'));
      return btn ? btn.innerText : 'not found';
    });
    console.log('Pay button text:', payBtnText);

    // Click Pay Online button
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.innerText.includes('Pay Online'));
      if (btn) btn.click();
    });

    console.log('Clicked Pay Online! Waiting for Razorpay...');
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 500));
      const hasRazorpay = await page.evaluate(() => {
        return !!(
          document.querySelector('iframe[src*="razorpay"]') ||
          document.querySelector('.razorpay-container') ||
          document.querySelector('#rzp-checkout-frame') ||
          window.Razorpay
        );
      });
      const frameCount = page.frames().length;
      console.log(`Check ${i}: hasRazorpay=${hasRazorpay}, frameCount=${frameCount}`);
      const rzpFrame = page.frames().find(f => f.url().includes('razorpay.com'));
      if (rzpFrame) {
        console.log('🎯 Found Razorpay frame:', rzpFrame.url());
        break;
      }
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test-razorpay-result.png') });
  } catch (err) {
    console.error('Error in testCheckout:', err);
  } finally {
    await browser.close();
  }
}

testCheckout();
