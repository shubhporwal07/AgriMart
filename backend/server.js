const express = require("express");
const cors = require("cors");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL, // Production frontend URL
    ].filter(Boolean); // Remove undefined/null

    // Allow requests from any localhost port, or if origin matches allowed Origins
    if (!origin || origin.match(/^http:\/\/localhost:\d+$/) || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());

// Initialize Razorpay
let razorpayKeyId = process.env.RAZORPAY_KEY_ID || "rzp_test_1DP5mmOlF5G5ag";
let razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || "rzp_test_secret";

let razorpay = null;
function initRazorpayClient() {
  try {
    razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });
  } catch (e) {
    console.warn("⚠️ Razorpay SDK initialization warning:", e.message);
  }
}
initRazorpayClient();

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "AgriMart Payment Server is running",
    razorpayKey: razorpayKeyId,
    timestamp: new Date().toISOString()
  });
});

// Razorpay credential status & config check
app.get("/api/razorpay-config", (req, res) => {
  const isDummy = !razorpayKeyId || razorpayKeyId === "rzp_test_1DP5mmOlF5G5ag";
  const hasSecret = Boolean(razorpayKeySecret && razorpayKeySecret !== "rzp_test_secret");
  res.json({
    keyId: razorpayKeyId,
    isDummy,
    hasSecret,
    isLiveConfigured: !isDummy && hasSecret,
  });
});

// Update Razorpay credentials dynamically
app.post("/api/set-razorpay-keys", (req, res) => {
  const { keyId, keySecret } = req.body;
  if (!keyId || !keyId.startsWith("rzp_")) {
    return res.status(400).json({ error: "Invalid Razorpay Key ID format (must start with rzp_)" });
  }
  razorpayKeyId = keyId.trim();
  if (keySecret) razorpayKeySecret = keySecret.trim();
  initRazorpayClient();
  console.log(`✅ Updated Razorpay credentials to: ${razorpayKeyId}`);
  res.json({
    success: true,
    keyId: razorpayKeyId,
    isDummy: razorpayKeyId === "rzp_test_1DP5mmOlF5G5ag",
    message: "Razorpay credentials updated successfully"
  });
});

/**
 * POST /api/create-order
 * Creates a Razorpay order for the given amount and cart items
 */
app.post("/api/create-order", async (req, res) => {
  try {
    const { amount, cartItems } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid payment amount." });
    }

    // Amount must be in paise (₹100 = 10000 paise)
    const amountInPaise = Math.round(amount * 100);
    let orderId = null;

    // Attempt official Razorpay order creation if razorpay is initialized with real credentials
    let isLiveRazorpay = false;
    if (
      razorpay &&
      razorpayKeySecret &&
      razorpayKeySecret !== "rzp_test_secret" &&
      razorpayKeyId &&
      razorpayKeyId !== "rzp_test_1DP5mmOlF5G5ag"
    ) {
      try {
        const order = await razorpay.orders.create({
          amount: amountInPaise,
          currency: "INR",
          receipt: `order_${Date.now()}`,
          notes: {
            source: "agrimart-web",
            itemCount: cartItems ? cartItems.length : 0,
          },
        });
        orderId = order.id;
        isLiveRazorpay = true;
        console.log(`✅ Official Razorpay order created: ${order.id} | ₹${amount}`);
      } catch (rzpErr) {
        console.warn("⚠️ Live Razorpay API order creation failed:", rzpErr.message);
      }
    } else {
      orderId = `order_agri_${Date.now()}`;
      console.log(`ℹ️ AgriMart Sandbox Payment Gateway initialized for ₹${amount}`);
    }

    res.json({
      success: true,
      orderId: orderId,
      amount: amountInPaise,
      currency: "INR",
      key: razorpayKeyId,
      isDummyKey: !razorpayKeyId || razorpayKeyId === "rzp_test_1DP5mmOlF5G5ag",
      gatewayMode: isLiveRazorpay ? "razorpay_live" : "sandbox",
    });
  } catch (error) {
    console.error("❌ Error creating order:", error);
    res.status(500).json({ error: "Failed to create payment order." });
  }
});

/**
 * POST /api/verify-payment
 * Verifies the Razorpay payment signature after successful payment
 */
app.post("/api/verify-payment", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_payment_id) {
      return res.status(400).json({ error: "Missing payment ID." });
    }

    // In dev / test mode with test secret or direct checkout without signature
    if (!razorpay_signature || razorpayKeySecret === "rzp_test_secret") {
      console.log(`✅ Test payment accepted: ${razorpay_payment_id}`);
      return res.json({
        success: true,
        message: "Payment verified successfully (test/dev mode)!",
        orderId: razorpay_order_id || `order_${Date.now()}`,
        paymentId: razorpay_payment_id,
      });
    }

    // Official signature verification using HMAC SHA256
    const body = (razorpay_order_id || "") + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", razorpayKeySecret)
      .update(body)
      .digest("hex");

    const isValid = expectedSignature === razorpay_signature;

    if (isValid) {
      console.log(`✅ Payment verified: ${razorpay_payment_id}`);
      res.json({
        success: true,
        message: "Payment verified successfully!",
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      });
    } else {
      console.error("❌ Payment verification failed: Invalid signature");
      res.status(400).json({ error: "Payment verification failed. Invalid signature." });
    }
  } catch (error) {
    console.error("❌ Error verifying payment:", error);
    res.status(500).json({ error: "Failed to verify payment." });
  }
});

/**
 * POST /api/subscribe
 * Sends a welcome email to the subscriber
 */
app.post("/api/subscribe", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Configure your real SMTP server here (e.g., Gmail)
    let transporter = nodemailer.createTransport({
      service: "gmail", // You can change this to your email provider (sendgrid, mailgun, etc.)
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let info = await transporter.sendMail({
      from: '"AgriMart Support" <' + process.env.EMAIL_USER + '>',
      to: email,
      subject: "Welcome to AgriMart! ₹200 OFF on Certified Seeds & Fertilizers 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #142B4A; text-align: center;">Welcome to AgriMart!</h2>
          <p>Kisan Namaskar,</p>
          <p>Thank you for subscribing to AgriMart! Certified high-yield seeds, organic fertilizers, and farm inputs delivered straight to your farmland.</p>
          <p>Use code <strong>KISAN200</strong> for ₹200 off your first certified farm inputs order above ₹999.</p>
          <br/>
          <p>Warm regards,<br/><strong>The AgriMart Kisan Team</strong></p>
        </div>
      `,
    });

    console.log("✅ Subscription email successfully sent to %s", email);

    res.json({ success: true, message: "Subscription successful!" });
  } catch (error) {
    console.error("❌ Error sending email:", error);
    res.status(500).json({ error: "Failed to send subscription email. Check server credentials." });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════════════════╗
  ║   AGRIMART - Certified Farm Inputs & Payment Server      ║
  ║   Running on http://localhost:${PORT}                      ║
  ║   Razorpay Key: ${process.env.RAZORPAY_KEY_ID}              ║
  ╚══════════════════════════════════════════════════════════╝
  `);
});
