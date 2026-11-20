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
            AgriMart Legal &amp; Governance
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#142B4A] mb-8">
            Terms of Service
          </h1>
          <div className="prose prose-slate max-w-none text-slate-600 space-y-6 text-sm sm:text-base leading-relaxed">
            <p>
              Welcome to <strong>AgriMart</strong>. By accessing our platform, website, or ordering certified seeds, bio-fertilizers, and farm inputs, you agree to comply with and be bound by the following terms and conditions.
            </p>

            <h2 className="text-lg font-bold text-[#142B4A] mt-8 mb-4 tracking-wide uppercase">
              1. AgriMart Dark Pod &amp; Farm Delivery Service
            </h2>
            <p>
              AgriMart operates specialized agricultural dispatch pods connecting Indian farmers with certified seeds, high-grade organic manure, water-soluble fertilizers, and agronomist support. Delivery options (Express Parcel Dispatch and Standard Farm Delivery from Phagwara Dark Pod) are subject to road safety and order surge windows.
            </p>

            <h2 className="text-lg font-bold text-[#142B4A] mt-8 mb-4 tracking-wide uppercase">
              2. Product Certification &amp; Usage
            </h2>
            <p>
              All inputs listed comply with the Seeds Act, 1966 and the Fertilizer (Inorganic, Organic or Mixed) (Control) Order. Farmers are advised to follow recommended dosage and application guidelines on the label or consult our free agronomist advisory desk.
            </p>

            <h2 className="text-lg font-bold text-[#142B4A] mt-8 mb-4 tracking-wide uppercase">
              3. Payments &amp; COD Verification
            </h2>
            <p>
              Orders may be paid via secure online gateways (UPI, Cards, Netbanking) or Cash on Delivery (COD). For COD orders, customer OTP verification may be required upon parcel handover.
            </p>

            <h2 className="text-lg font-bold text-[#142B4A] mt-8 mb-4 tracking-wide uppercase">
              4. Governing Law
            </h2>
            <p>
              These terms are governed by the laws of India, under the jurisdiction of the courts of Punjab.
            </p>

            <h2 className="text-lg font-bold text-[#142B4A] mt-8 mb-4 tracking-wide uppercase">
              Legal Inquiries
            </h2>
            <p>
              Email: <strong>legal@agrimart.farm</strong><br />
              AgriMart Quick Commerce Private Limited, Central Kisan Hub #01, Phagwara, Kapurthala, Punjab - 144401
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
