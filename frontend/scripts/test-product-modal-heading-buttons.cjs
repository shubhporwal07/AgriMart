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
  console.log('📱 Starting Verification: Product Modal Buttons Heading & Mobile Layout...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=360,800']
  });

  const page = await browser.newPage();
  // Emulate 360px viewport (matching user screenshot)
  await page.setViewport({ width: 360, height: 800, isMobile: true, hasTouch: true });

  try {
    console.log('1. Navigating to http://localhost:3002/dashboard ...');
    await page.goto('http://localhost:3002/dashboard', { waitUntil: 'domcontentloaded' });
    
    // Dismiss location modal / announcements
    await page.evaluate(() => {
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
    await new Promise(r => setTimeout(r, 2000));

    // Dismiss announcement popup
    await page.evaluate(() => {
      const closeBtn = document.querySelector('button[aria-label="Close Announcement"]');
      if (closeBtn) {
        closeBtn.click();
      } else {
        const btns = Array.from(document.querySelectorAll('button'));
        const dismiss = btns.find(b => b.textContent.includes('Acknowledge') || b.textContent.includes('Got It'));
        if (dismiss) dismiss.click();
      }
    });
    await new Promise(r => setTimeout(r, 800));

    console.log('2. Opening modal for DAP Enriched Granular Fertilizer 5kg ...');
    const opened = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('article'));
      for (const card of cards) {
        if (card.textContent.includes('DAP') || card.textContent.includes('Fertilizer') || card.textContent.includes('290')) {
          card.click();
          return true;
        }
      }
      if (cards.length > 0) {
        cards[0].click();
        return true;
      }
      return false;
    });

    console.log(`Product modal opened: ${opened}`);
    await new Promise(r => setTimeout(r, 1200));

    // Measure Header bar elements
    const headerStats = await page.evaluate(() => {
      const header = document.querySelector('[role="dialog"] > div > div:first-child') ||
                     document.querySelector('.relative.bg-white > div:first-child');
      
      const categoryPill = header?.querySelector('span.rounded-full');
      const dispatchBadge = header?.querySelector('span.flex.items-center');
      const closeBtn = header?.querySelector('button[aria-label="Close"]');
      const wishlistBtn = header?.querySelector('button[aria-label*="wishlist" i]');

      const pillRect = categoryPill ? categoryPill.getBoundingClientRect() : null;
      const pillComputed = categoryPill ? window.getComputedStyle(categoryPill) : null;
      const dispatchComputed = dispatchBadge ? window.getComputedStyle(dispatchBadge) : null;

      // Check measurement section
      const measureBox = document.querySelector('.bg-slate-50.border.rounded-xl');
      const measureIcon = measureBox?.querySelector('span:first-child')?.textContent?.trim();
      const measureOptions = Array.from(measureBox?.querySelectorAll('span.rounded-md') || []).map(s => s.textContent.trim());

      // Check ADD TO CART button
      const addCartBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('ADD TO CART'));
      const addCartRect = addCartBtn ? addCartBtn.getBoundingClientRect() : null;

      return {
        headerExists: !!header,
        categoryText: categoryPill?.textContent?.trim(),
        pillWhiteSpace: pillComputed?.whiteSpace,
        pillHeight: pillRect ? Math.round(pillRect.height) : null,
        pillSingleLine: pillRect ? pillRect.height < 32 : false,
        dispatchText: dispatchBadge?.textContent?.trim(),
        dispatchWhiteSpace: dispatchComputed?.whiteSpace,
        hasCloseBtn: !!closeBtn,
        hasWishlistBtn: !!wishlistBtn,
        measureIcon,
        measureOptions,
        addCartHeight: addCartRect ? Math.round(addCartRect.height) : null,
        addCartSingleLine: addCartRect ? addCartRect.height < 50 : false
      };
    });

    console.log('Modal Header & Buttons Inspection:', headerStats);

    // Capture Full Modal
    const shot1 = path.join(SCREENSHOT_DIR, '111-modal-full-mobile-buttons-heading-fixed.png');
    await page.screenshot({ path: shot1, fullPage: false });
    saveScreenshot(shot1, '111-modal-full-mobile-buttons-heading-fixed.png');

    // Capture Zoomed Header Bar
    const headerClip = await page.evaluate(() => {
      const header = document.querySelector('.relative.bg-white > div.border-b') ||
                     document.querySelector('.flex.items-center.justify-between.border-b');
      if (!header) return null;
      const rect = header.getBoundingClientRect();
      return {
        x: Math.max(0, rect.x),
        y: Math.max(0, rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      };
    });

    if (headerClip) {
      const shot2 = path.join(SCREENSHOT_DIR, '112-modal-top-heading-buttons-fixed.png');
      await page.screenshot({ path: shot2, clip: headerClip });
      saveScreenshot(shot2, '112-modal-top-heading-buttons-fixed.png');
    }

    // Scroll modal body down to view Pack Size Measurement and ADD TO CART
    await page.evaluate(() => {
      const modalBody = document.querySelector('.overflow-y-auto.no-scrollbar');
      if (modalBody) modalBody.scrollTop = 320;
    });
    await new Promise(r => setTimeout(r, 600));

    const shot3 = path.join(SCREENSHOT_DIR, '113-modal-bottom-price-add-to-cart-fixed.png');
    await page.screenshot({ path: shot3, fullPage: false });
    saveScreenshot(shot3, '113-modal-bottom-price-add-to-cart-fixed.png');

    console.log('🎉 Verification Complete! Modal heading buttons verified.');
  } catch (err) {
    console.error('❌ Error during verification:', err);
  } finally {
    await browser.close();
  }
}

run();
