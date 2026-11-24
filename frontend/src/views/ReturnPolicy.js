'use client';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';

export default function ReturnPolicy() {
  const { isHindi } = useLanguage();

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-100 shadow-sm">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#E27B12] mb-2 block">
            {isHindi ? 'एग्रीमार्ट किसान आश्वासन' : 'AgriMart Farmer Assurance'}
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#142B4A] mb-8">
            {isHindi ? 'वापसी एवं रिफंड नीति (Return & Refund Policy)' : 'Return & Refund Policy'}
          </h1>
          <div className="prose prose-slate max-w-none text-slate-600 space-y-6 text-sm sm:text-base leading-relaxed">
            <p>
              {isHindi ? (
                <><strong>एग्रीमार्ट (AgriMart)</strong> में, हमारा उद्देश्य सर्वोत्तम प्रमाणित कृषि गुणवत्ता प्रदान करना है। हम समझते हैं कि प्रमाणित संकर बीजों, जैविक उर्वरकों और फसल सुरक्षा इनपुट्स के लिए सख्त गुणवत्ता आश्वासन और उचित भंडारण परिस्थितियों की आवश्यकता होती है। यदि आप डिलीवर की गई किसी भी सामग्री की गुणवत्ता से संतुष्ट नहीं हैं, तो हम त्वरित और परेशानी मुक्त वापसी व रिफंड समाधान प्रदान करते हैं।</>
              ) : (
                <>At <strong>AgriMart</strong>, our mission is to deliver nothing short of certified agricultural excellence. We understand that certified hybrid seeds, bio-fertilizers, and crop protection inputs require stringent quality assurance and proper storage conditions. If you are not completely satisfied with the quality of any delivered item, we offer an instant, no-hassle return and refund resolution.</>
              )}
            </p>

            <h2 className="text-lg font-bold text-[#142B4A] mt-8 mb-4 tracking-wide uppercase">
              {isHindi ? '1. 48-घंटे फसल एवं इनपुट गारंटी' : '1. 48-Hour Harvest & Input Guarantee'}
            </h2>
            <p>
              {isHindi
                ? 'यदि कोई सीलबंद बीज बैग या उर्वरक कंटेनर क्षतिग्रस्त, छेड़छाड़ किया हुआ, समाप्त (एक्सपायर) या आपके ऑर्डर विनिर्देशों से भिन्न प्राप्त होता है, तो तत्काल निःशुल्क प्रतिस्थापन या 100% रिफंड के लिए डिलीवरी के 48 घंटों के भीतर इसकी सूचना दें।'
                : 'If any sealed seed bag or fertilizer container arrives damaged, tampered, expired, or differs from your order specifications, report it within 48 hours of delivery for an immediate free replacement or 100% refund.'}
            </p>

            <h2 className="text-lg font-bold text-[#142B4A] mt-8 mb-4 tracking-wide uppercase">
              {isHindi ? '2. प्रमाणित अंकुरण आश्वासन' : '2. Certified Germination Assurance'}
            </h2>
            <p>
              {isHindi
                ? 'एग्रीमार्ट पर बेचे जाने वाले सभी बीज बैचों में सरकारी मान्यता प्राप्त अंकुरण प्रमाणपत्र (मानक बुवाई परिस्थितियों में न्यूनतम 90-95% अंकुरण दर) होते हैं। यदि कोई बैच अंकुरण परीक्षण में विफल रहता है, तो हमारी कृषि वैज्ञानिक टीम आपके बैच नंबर की समीक्षा करेगी और पूर्ण रिफंड जारी करेगी।'
                : 'All seed batches sold on AgriMart carry government-accredited germination certificates (minimum 90–95% germination rate under standard sowing conditions). If a batch fails germination testing, our agronomist team will review your batch number and initiate a full refund.'}
            </p>

            <h2 className="text-lg font-bold text-[#142B4A] mt-8 mb-4 tracking-wide uppercase">
              {isHindi ? '3. आसान वापसी प्रक्रिया' : '3. Seamless Return Process'}
            </h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                {isHindi
                  ? 'एग्रीमार्ट पर अपना ऑर्डर इतिहास खोलें या हमारी किसान केयर हेल्पलाइन (1800-AGRI-MART) पर कॉल करें।'
                  : 'Open your orders history on AgriMart or call our Kisan Care Helpline (1800-AGRI-MART).'}
              </li>
              <li>
                {isHindi
                  ? 'क्षतिग्रस्त सील या गलत इनपुट बैच की एक तस्वीर अपलोड करें।'
                  : 'Upload a photo of the damaged seal or incorrect input batch.'}
              </li>
              <li>
                {isHindi
                  ? 'स्वीकृत रिफंड 2-4 घंटों के भीतर आपके मूल भुगतान माध्यम में वापस जमा कर दिया जाएगा।'
                  : 'The approved refund will be credited back to your original payment method within 2–4 hours.'}
              </li>
            </ol>

            <h2 className="text-lg font-bold text-[#142B4A] mt-8 mb-4 tracking-wide uppercase">
              {isHindi ? 'किसान सहायता केंद्र' : 'Contact Farmer Care'}
            </h2>
            <p>
              {isHindi ? 'ईमेल: ' : 'Email: '}<strong>support@agrimart.farm</strong><br />
              {isHindi ? 'टोल-फ्री किसान हेल्पलाइन: ' : 'Toll-Free Kisan Line: '}<strong>1800-AGRI-MART (1800-2474-6278)</strong>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
