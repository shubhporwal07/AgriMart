'use client';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ReturnPolicy() {
  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-100 shadow-sm">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#E27B12] mb-2 block">
            Gupta Mart Customer Assurance
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#142B4A] mb-8">
            Freshness Guarantee &amp; Return Policy
          </h1>
          <div className="prose prose-slate max-w-none text-slate-600 space-y-6 text-sm sm:text-base leading-relaxed">
            <p>
              At <strong>Gupta Mart</strong>, our mission is to deliver nothing short of farm-fresh excellence. We understand that fresh produce, dairy, and artisanal baked goods require the highest standards of handling. If you are not completely satisfied with the quality of any delivered item, we offer an instant, no-hassle return and refund resolution.
            </p>

            <h2 className="text-lg font-bold text-[#142B4A] mt-8 mb-4 tracking-wide uppercase">
              1. 100% Freshness Guarantee (Perishables)
            </h2>
            <p>
              For all fresh fruits, vegetables, dairy, bread, and chilled items, you can report any quality issue (such as bruising, over-ripeness, or damage) within <strong>24 hours</strong> of delivery. Our customer support team will issue an <strong>instant refund</strong> or replacement without requiring return pickups for perishables.
            </p>

            <h2 className="text-lg font-bold text-[#142B4A] mt-8 mb-4 tracking-wide uppercase">
              2. Packaged Groceries &amp; Staples
            </h2>
            <p>
              Packaged dry goods (such as flours, oils, spices, grains, and honey) can be returned within <strong>3 days</strong> of delivery if the packaging was unsealed, damaged, expired, or tampered with prior to arrival.
            </p>

            <h2 className="text-lg font-bold text-[#142B4A] mt-8 mb-4 tracking-wide uppercase">
              3. Order Cancellation
            </h2>
            <p>
              Because our dark pods pack and dispatch orders within 3–5 minutes to meet our 12-minute express delivery window, orders can be cancelled free of charge within <strong>60 seconds</strong> of placing the order via the live order tracking screen.
            </p>

            <h2 className="text-lg font-bold text-[#142B4A] mt-8 mb-4 tracking-wide uppercase">
              4. How to Request a Quality Refund
            </h2>
            <p>
              To report an issue or request a refund:
            </p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Open your orders history on Gupta Mart or contact our 24/7 care desk.</li>
              <li>Share your Order ID and attach a quick photo of the defective produce.</li>
              <li>The approved refund will be credited back to your original payment method or Gupta Mart balance within 2–4 hours.</li>
            </ol>

            <h2 className="text-lg font-bold text-[#142B4A] mt-8 mb-4 tracking-wide uppercase">
              Customer Support Desk
            </h2>
            <p>
              Email: <strong>support@guptamart.com</strong><br />
              WhatsApp / Helpline: <strong>+91-800-487-8262</strong> (Toll Free, 6 AM – 11 PM)
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
