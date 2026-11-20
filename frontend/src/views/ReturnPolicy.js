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
            AgriMart Farmer Assurance
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#142B4A] mb-8">
            Return &amp; Refund Policy
          </h1>
          <div className="prose prose-slate max-w-none text-slate-600 space-y-6 text-sm sm:text-base leading-relaxed">
            <p>
              At <strong>AgriMart</strong>, our mission is to deliver nothing short of certified agricultural excellence. We understand that certified hybrid seeds, bio-fertilizers, and crop protection inputs require stringent quality assurance and proper storage conditions. If you are not completely satisfied with the quality of any delivered item, we offer an instant, no-hassle return and refund resolution.
            </p>

            <h2 className="text-lg font-bold text-[#142B4A] mt-8 mb-4 tracking-wide uppercase">
              1. 48-Hour Harvest &amp; Input Guarantee
            </h2>
            <p>
              If any sealed seed bag or fertilizer container arrives damaged, tampered, expired, or differs from your order specifications, report it within 48 hours of delivery for an immediate free replacement or 100% refund.
            </p>

            <h2 className="text-lg font-bold text-[#142B4A] mt-8 mb-4 tracking-wide uppercase">
              2. Certified Germination Assurance
            </h2>
            <p>
              All seed batches sold on AgriMart carry government-accredited germination certificates (minimum 90–95% germination rate under standard sowing conditions). If a batch fails germination testing, our agronomist team will review your batch number and initiate a full refund.
            </p>

            <h2 className="text-lg font-bold text-[#142B4A] mt-8 mb-4 tracking-wide uppercase">
              3. Seamless Return Process
            </h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Open your orders history on AgriMart or call our Kisan Care Helpline (1800-AGRI-MART).</li>
              <li>Upload a photo of the damaged seal or incorrect input batch.</li>
              <li>The approved refund will be credited back to your original payment method within 2–4 hours.</li>
            </ol>

            <h2 className="text-lg font-bold text-[#142B4A] mt-8 mb-4 tracking-wide uppercase">
              Contact Farmer Care
            </h2>
            <p>
              Email: <strong>support@agrimart.farm</strong><br />
              Toll-Free Kisan Line: <strong>1800-AGRI-MART (1800-2474-6278)</strong>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
