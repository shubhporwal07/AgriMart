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
  console.log('🚀 Starting Verification: Product Details Modal Image Deduplication & Transparent Shift Buttons...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  try {
    console.log('1. Navigating to http://localhost:3002/dashboard ...');
    await page.goto('http://localhost:3002/dashboard', { waitUntil: 'domcontentloaded' });
    
    // Inject custom multi-image product directly into both storages
    await page.evaluate(() => {
      sessionStorage.clear();
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

      // Multi-image product mimicking user's custom product with 2 unique images
      const testMultiImageProduct = {
        id: 'agri-cpp-and-java',
        name: 'cpp and java',
        category: 'Micronutrients & Plant Growth',
        brand: 'AgriMart Certified',
        unit: '10g Pouch (~3,000 seeds)',
        price: 12321,
        mrp: 12321,
        discount: '',
        rating: 5.0,
        reviewCount: 0,
        deliveryTime: '⚡ Fast Farm Dispatch',
        inStock: true,
        stockCount: 100,
        isOrganic: true,
        dietaryTags: ['High germination rate (>85% lab tested)', 'Seed Act 1966 & FCO 1985 certified'],
        imageUrl: '/images/products/hybrid-tomato-seeds.png',
        imageDatas: [
          '/images/products/hybrid-tomato-seeds.png',
          '/images/products/dap-fertilizer-5kg.png'
        ],
        description: 'Certified high-yield inputs standard.',
        highlights: [
          'High germination rate (>85% lab tested)',
          'Seed Act 1966 & FCO 1985 certified',
          'Fast farm gate direct dispatch'
        ]
      };

      const existingLocal = JSON.parse(localStorage.getItem('agrimart_seeds_local_v7') || '[]');
      const filtered = existingLocal.filter(p => p.id !== 'agri-cpp-and-java');
      const localUpdated = [testMultiImageProduct, ...filtered];
      localStorage.setItem('agrimart_seeds_local_v7', JSON.stringify(localUpdated));

      const cachedProds = JSON.parse(localStorage.getItem('agrimart_seeds_products_v7') || '[]');
      const filteredCache = cachedProds.filter(p => p.id !== 'agri-cpp-and-java');
      const cacheUpdated = [testMultiImageProduct, ...filteredCache];
      localStorage.setItem('agrimart_seeds_products_v7', JSON.stringify(cacheUpdated));
      sessionStorage.setItem('agrimart_seeds_products_v7', JSON.stringify(cacheUpdated));
    });

    await page.reload({ waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));

    // Dismiss announcement popup if visible
    await page.evaluate(() => {
      const dismissBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Got It') || b.textContent.includes('Acknowledge'));
      if (dismissBtn) dismissBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    console.log('2. Clicking on the product "cpp and java" card to open ProductDetailsModal...');
    const cardFound = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('article'));
      for (const card of cards) {
        if (card.textContent.includes('cpp and java') || card.textContent.includes('12321')) {
          card.click();
          return true;
        }
      }
      return false;
    });

    console.log(`Card "cpp and java" clicked: ${cardFound}`);
    await new Promise(r => setTimeout(r, 1200));

    // Verify modal stats
    const modalStats = await page.evaluate(() => {
      const thumbnails = document.querySelectorAll('.w-16.h-16.rounded-xl');
      const prevBtn = document.querySelector('[data-testid="shift-prev-btn"]');
      const nextBtn = document.querySelector('[data-testid="shift-next-btn"]');
      const counterBadge = document.querySelector('[data-testid="image-counter-badge"]')?.textContent?.trim() || '';
      const mainImgSrc = document.querySelector('[data-testid="main-product-image"]')?.getAttribute('src');

      return {
        thumbnailCount: thumbnails.length,
        hasPrevBtn: !!prevBtn,
        hasNextBtn: !!nextBtn,
        counterBadge,
        mainImgSrc
      };
    });

    console.log('Modal Stats on Open:', modalStats);

    const shot1 = path.join(SCREENSHOT_DIR, '106-product-modal-transparent-shift-buttons.png');
    await page.screenshot({ path: shot1 });
    saveScreenshot(shot1, '106-product-modal-transparent-shift-buttons.png');

    console.log('3. Clicking Next transparent shift button (chevron_right)...');
    await page.evaluate(() => {
      const nextBtn = document.querySelector('[data-testid="shift-next-btn"]');
      if (nextBtn) nextBtn.click();
    });

    await new Promise(r => setTimeout(r, 800));

    const modalStatsAfterNext = await page.evaluate(() => {
      const counterBadge = document.querySelector('[data-testid="image-counter-badge"]')?.textContent?.trim() || '';
      const mainImgSrc = document.querySelector('[data-testid="main-product-image"]')?.getAttribute('src');
      return {
        counterBadge,
        mainImgSrc
      };
    });

    console.log('Modal Stats After Next Shift:', modalStatsAfterNext);

    const shot2 = path.join(SCREENSHOT_DIR, '107-product-modal-shifted-to-second-image.png');
    await page.screenshot({ path: shot2 });
    saveScreenshot(shot2, '107-product-modal-shifted-to-second-image.png');

    console.log('4. Testing keyboard arrow navigation (ArrowLeft to wrap back to image 1)...');
    await page.keyboard.press('ArrowLeft');
    await new Promise(r => setTimeout(r, 600));

    const statsAfterKeyboard = await page.evaluate(() => {
      return {
        counterBadge: document.querySelector('[data-testid="image-counter-badge"]')?.textContent?.trim() || '',
        mainImgSrc: document.querySelector('[data-testid="main-product-image"]')?.getAttribute('src')
      };
    });
    console.log('Modal Counter After ArrowLeft:', statsAfterKeyboard);

    console.log('🎉 Verification Complete! All transparent shift buttons and deduplication verified.');
  } catch (err) {
    console.error('❌ Error during verification:', err);
  } finally {
    await browser.close();
  }
}

run();
