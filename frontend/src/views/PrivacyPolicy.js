'use client';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-100 shadow-sm">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#E27B12] mb-2 block">
            AgriMart Legal &amp; Compliance
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#142B4A] mb-8">
            Privacy Policy
          </h1>
          <div className="prose prose-slate max-w-none text-slate-600 space-y-6 text-sm sm:text-base leading-relaxed">
            <p>
              At <strong>AgriMart</strong>, we are committed to safeguarding your personal data and ensuring that your agricultural input purchasing experience is completely secure. This Privacy Policy details the types of information we collect when you use our certified farm inputs delivery application and website, and how we utilize it to provide reliable agricultural fulfillment.
            </p>

            <h2 className="text-lg font-bold text-[#142B4A] mt-8 mb-4 tracking-wide uppercase">
              1. Information We Collect
            </h2>
            <p>
              To ensure swift agricultural delivery and accurate farmland routing, we collect:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Contact details: Name, email address, and mobile phone number for delivery updates and dispatch OTPs.</li>
              <li>Delivery coordinates: Farm location, village name, street address, and pincode to route to the nearest dark store pod or Kisan Hub.</li>
              <li>Order preferences: Favorite seed varieties, soil nutrition plans, and recurring seasonal inputs.</li>
              <li>Payment identifiers: Processed securely through PCI-DSS compliant gateways like Razorpay (we do not store raw card credentials).</li>
            </ul>

            <h2 className="text-lg font-bold text-[#142B4A] mt-8 mb-4 tracking-wide uppercase">
              2. How We Use Your Data
            </h2>
            <p>
              Your data is exclusively utilized to:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Process and dispatch certified seeds, bio-fertilizers, and crop protection inputs.</li>
              <li>Send real-time dispatch, route, and OTP notifications via SMS or WhatsApp.</li>
              <li>Notify you of seasonal sowing advisories and government subsidy announcements if you have subscribed to alerts.</li>
              <li>Improve dark store inventory forecasting and ensure certified seeds remain available during sowing windows.</li>
            </ul>

            <h2 className="text-lg font-bold text-[#142B4A] mt-8 mb-4 tracking-wide uppercase">
              3. Data Security &amp; Encryption
            </h2>
            <p>
              All customer sessions and communications are secured using 256-bit TLS encryption. Access to farmland shipping addresses is strictly restricted to assigned delivery partners during active transit.
            </p>

            <h2 className="text-lg font-bold text-[#142B4A] mt-8 mb-4 tracking-wide uppercase">
              Contact Privacy Officer
            </h2>
            <p>
              Email: <strong>privacy@agrimart.farm</strong><br />
              AgriMart Kisan Quick Commerce Private Limited, Central Kisan Hub #01, Phagwara, Kapurthala, Punjab - 144401
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
