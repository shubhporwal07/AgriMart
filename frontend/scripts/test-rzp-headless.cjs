const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--window-size=1280,850'],
  });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('response', async res => {
    if (res.url().includes('razorpay.com')) {
      console.log('RZP NET:', res.status(), res.url().substring(0, 100));
      try {
        const text = await res.text();
        if (text.includes('error') || text.includes('methods') || text.includes('message')) {
          console.log('RZP BODY:', text.substring(0, 300));
        }
      } catch(e) {}
    }
  });

  const html = `<!DOCTYPE html>
<html>
  <head>
    <title>Razorpay Test</title>
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  </head>
  <body style="background: #111; color: #fff; font-family: sans-serif; padding: 20px;">
    <h2>Direct Razorpay Checkout Test</h2>
    <button id="pay-btn" style="padding: 12px 24px; font-size: 16px; cursor: pointer;">Open Razorpay</button>
    <div id="status" style="margin-top: 20px;"></div>
    <script>
      function launch() {
        const rzp = new Razorpay({
          key: 'rzp_test_1DP5mmOlF5G5ag',
          amount: 95400,
          currency: 'INR',
          name: 'AGRIMART',
          description: 'Direct Test Payment',
          prefill: {
            name: 'Pranav',
            contact: '8077004382',
            email: 'farmer@agrimart.farm'
          },
          theme: { color: '#142B4A' },
          modal: {
            ondismiss: function() {
              document.getElementById('status').innerText = 'Dismissed / Cancelled';
            }
          }
        });
        rzp.on('payment.failed', function (res) {
          document.getElementById('status').innerText = 'Failed: ' + JSON.stringify(res.error);
        });
        rzp.open();
      }
      document.getElementById('pay-btn').onclick = launch;
      window.onload = launch;
    </script>
  </body>
</html>`;

  await page.setContent(html);
  await new Promise(r => setTimeout(r, 6000));
  await page.screenshot({ path: path.join(__dirname, '../../screenshots/rzp-test-result.png') });
  await browser.close();
  console.log('Done test. Screenshot saved.');
})();
