'use client';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-100 shadow-sm">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#E27B12] mb-2 block">
            Gupta Mart Legal
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#142B4A] mb-8">
            Terms of Service
          </h1>
          <div className="prose prose-slate max-w-none text-slate-600 space-y-6 text-sm sm:text-base leading-relaxed">
            <p>
              Welcome to <strong>Gupta Mart</strong>. By accessing our platform, website, or ordering grocery and pantry items, you agree to comply with and be bound by the following terms and conditions.
            </p>

            <h2 className="text-lg font-bold text-[#142B4A] mt-8 mb-4 tracking-wide uppercase">
              1. Platform Services
            </h2>
            <p>
              Gupta Mart operates dark fulfillment pods and connects consumers with farm-fresh produce, dairy, bakery items, and household staples. Delivery commitments (e.g. 12–15 minute express delivery) are subject to weather conditions, traffic safety, and order surge windows.
            </p>

            <h2 className="text-lg font-bold text-[#142B4A] mt-8 mb-4 tracking-wide uppercase">
              2. Product Weights &amp; Perishables
            </h2>
            <p>
              Due to the organic nature of fresh fruits and vegetables, item weights may vary slightly (±5%). When purchasing weighed items, pricing is calculated based on the stated pack size or unit weight. All produce is sourced in compliance with FSSAI standards.
            </p>

            <h2 className="text-lg font-bold text-[#142B4A] mt-8 mb-4 tracking-wide uppercase">
              3. Pricing and Availability
            </h2>
            <p>
              All listed prices are in Indian Rupees (INR) inclusive of applicable GST. We reserve the right to revise prices, discontinue promotional discounts, or cancel orders containing typographical pricing errors with a prompt full refund.
            </p>

            <h2 className="text-lg font-bold text-[#142B4A] mt-8 mb-4 tracking-wide uppercase">
              4. Payment &amp; Deliveries
            </h2>
            <p>
              Orders can be paid through integrated secure channels including UPI, RuPay, Visa, Mastercard, and Net Banking. Our delivery partner will attempt delivery to the address provided during checkout.
            </p>

            <h2 className="text-lg font-bold text-[#142B4A] mt-8 mb-4 tracking-wide uppercase">
              5. Contact Us
            </h2>
            <p>
              For legal inquiries or customer complaints regarding terms of service:<br />
              Email: <strong>legal@guptamart.com</strong><br />
              Gupta Mart Quick Commerce Private Limited, Bengaluru, India.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
