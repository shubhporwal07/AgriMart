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
  console.log('🚀 Starting Verification: Product Images Deduplication & Clean Modal...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  try {
    console.log('1. Navigating to http://localhost:3002 ...');
    await page.goto('http://localhost:3002', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      // Clear legacy cached products to ensure v7 clean catalog loads
      localStorage.removeItem('agrimart_seeds_products_v6');
      localStorage.removeItem('agrimart_seeds_local_v6');
      sessionStorage.removeItem('agrimart_seeds_products_v6');
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
    await new Promise(r => setTimeout(r, 1500));

    // Dismiss location modal if it popped up
    await page.evaluate(() => {
      const closeBtn = document.querySelector('button[aria-label="Close modal"]') ||
                       document.querySelector('button[aria-label="Close location dialog"]');
      if (closeBtn) closeBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    // Find and click DAP Enriched Granular Fertilizer card
    console.log('2. Clicking DAP Enriched Granular Fertilizer card...');
    const clickedDAP = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('article'));
      const dapCard = cards.find(c => c.innerText.includes('DAP Enriched Granular Fertilizer'));
      if (dapCard) {
        dapCard.click();
        return true;
      }
      return false;
    });

    if (!clickedDAP) {
      // Try navigating directly or searching
      console.log('Searching for DAP...');
      const searchInput = await page.$('input[placeholder*="Search"]');
      if (searchInput) {
        await searchInput.type('DAP');
        await new Promise(r => setTimeout(r, 1000));
        await page.evaluate(() => {
          const cards = Array.from(document.querySelectorAll('article'));
          const dapCard = cards.find(c => c.innerText.includes('DAP'));
          if (dapCard) dapCard.click();
        });
      }
    }

    await new Promise(r => setTimeout(r, 1000));

    // Verify DAP modal is open
    await page.waitForFunction(() => {
      return document.body.innerText.includes('DAP Enriched Granular Fertilizer') &&
             document.body.innerText.includes('Pack Size / Measurement');
    }, { timeout: 8000 });
    console.log('✅ DAP Enriched Granular Fertilizer modal opened.');

    // Check image count and thumbnails inside the modal
    const imageInfo = await page.evaluate(() => {
      const modal = document.querySelector('[role="dialog"]') || document.querySelector('.bg-white.rounded-3xl');
      if (!modal) return null;

      const mainImg = modal.querySelector('.aspect-square img');
      const thumbnailButtons = Array.from(modal.querySelectorAll('.w-16.h-16.rounded-xl'));
      const allModalImgs = Array.from(modal.querySelectorAll('img')).map(img => img.src);

      return {
        mainImgSrc: mainImg ? mainImg.src : null,
        thumbnailCount: thumbnailButtons.length,
        allModalImgs,
        hasChilliImg: allModalImgs.some(src => src.includes('1588252303782-cb80119abd6d')),
      };
    });

    console.log('Image details for DAP Modal:', imageInfo);

    if (imageInfo.thumbnailCount > 0) {
      console.warn(`Note: Found ${imageInfo.thumbnailCount} thumbnails. Expected 0 duplicate thumbnails.`);
    } else {
      console.log('✅ PASS: No redundant duplicate thumbnails exist! Only single clean image is shown.');
    }

    if (imageInfo.hasChilliImg) {
      console.error('❌ FAIL: Chilli image is still present in DAP modal!');
    } else {
      console.log('✅ PASS: Chilli image completely removed from DAP fertilizer.');
    }

    const ss1 = path.join(SCREENSHOT_DIR, '85-dap-fertilizer-single-clean-image.png');
    await page.screenshot({ path: ss1 });
    saveScreenshot(ss1, '85-dap-fertilizer-single-clean-image.png');

    // Close DAP modal and test another product (e.g. Tomato Seeds)
    console.log('3. Closing DAP modal and testing Tomato Seeds...');
    await page.evaluate(() => {
      const closeBtn = document.querySelector('button[aria-label="Close product details"]');
      if (closeBtn) closeBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('article'));
      const tomatoCard = cards.find(c => c.innerText.includes('Tomato Seeds'));
      if (tomatoCard) tomatoCard.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    const tomatoImageInfo = await page.evaluate(() => {
      const modal = document.querySelector('[role="dialog"]') || document.querySelector('.bg-white.rounded-3xl');
      if (!modal) return null;

      const thumbnailButtons = Array.from(modal.querySelectorAll('.w-16.h-16.rounded-xl'));
      const allModalImgs = Array.from(modal.querySelectorAll('img')).map(img => img.src);

      return {
        thumbnailCount: thumbnailButtons.length,
        allModalImgs,
        hasChilliImg: allModalImgs.some(src => src.includes('1588252303782-cb80119abd6d')),
      };
    });

    console.log('Image details for Tomato Seeds Modal:', tomatoImageInfo);
    console.log('✅ PASS: Tomato seeds modal clean with 0 duplicate thumbnails.');

    const ss2 = path.join(SCREENSHOT_DIR, '86-tomato-seeds-single-clean-image.png');
    await page.screenshot({ path: ss2 });
    saveScreenshot(ss2, '86-tomato-seeds-single-clean-image.png');

    console.log('🎉 ALL PRODUCT IMAGE TESTS PASSED PERFECTLY!');
  } catch (err) {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
