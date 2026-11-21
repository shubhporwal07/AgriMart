const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const viewport = { width: 360, height: 780, isMobile: true, hasTouch: true };
  await page.setViewport(viewport);

  console.log('Navigating to http://localhost:3002 on 360x780 viewport...');
  await page.goto('http://localhost:3002', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2000));

  const overflowReport = await page.evaluate(() => {
    const docWidth = document.documentElement.offsetWidth;
    const winWidth = window.innerWidth;
    const bodyScrollWidth = document.body.scrollWidth;
    const htmlScrollWidth = document.documentElement.scrollWidth;

    const overflowingElements = [];
    document.querySelectorAll('*').forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.right > winWidth + 1 || el.scrollWidth > winWidth + 1) {
        overflowingElements.push({
          tag: el.tagName,
          className: (el.className || '').toString().slice(0, 100),
          id: el.id,
          rectRight: Math.round(rect.right),
          rectWidth: Math.round(rect.width),
          scrollWidth: el.scrollWidth,
          innerTextSnippet: (el.innerText || '').slice(0, 60).replace(/\n/g, ' ')
        });
      }
    });

    return {
      winWidth,
      docWidth,
      bodyScrollWidth,
      htmlScrollWidth,
      overflowingElements: overflowingElements.slice(0, 20)
    };
  });

  console.log('Mobile Viewport Report (360px):', JSON.stringify(overflowReport, null, 2));

  const artifactsDir = path.resolve('C:/Users/prana/.gemini/antigravity/brain/ca9c2629-ab51-46e1-b2ec-9750707c2a79');
  await page.screenshot({
    path: path.join(artifactsDir, 'before-mobile-view-diagnosis.png'),
    fullPage: false
  });

  await browser.close();
})();
