'use client';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';

export default function TermsOfService() {
  const { isHindi } = useLanguage();

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-100 shadow-sm">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#E27B12] mb-2 block">
            {isHindi ? 'एग्रीमार्ट कानूनी एवं संचालन' : 'AgriMart Legal & Governance'}
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#142B4A] mb-8">
            {isHindi ? 'सेवा की शर्तें (Terms of Service)' : 'Terms of Service'}
          </h1>
          <div className="prose prose-slate max-w-none text-slate-600 space-y-6 text-sm sm:text-base leading-relaxed">
            <p>
              {isHindi ? (
                <><strong>एग्रीमार्ट (AgriMart)</strong> में आपका स्वागत है। हमारे प्लेटफॉर्म, वेबसाइट का उपयोग करके या प्रमाणित बीज, जैविक उर्वरक और कृषि इनपुट्स ऑर्डर करके, आप निम्नलिखित नियमों और शर्तों का पालन करने और उनसे बाध्य होने के लिए सहमत होते हैं।</>
              ) : (
                <>Welcome to <strong>AgriMart</strong>. By accessing our platform, website, or ordering certified seeds, bio-fertilizers, and farm inputs, you agree to comply with and be bound by the following terms and conditions.</>
              )}
            </p>

            <h2 className="text-lg font-bold text-[#142B4A] mt-8 mb-4 tracking-wide uppercase">
              {isHindi ? '1. एग्रीमार्ट डार्क पॉड एवं खेत डिलीवरी सेवा' : '1. AgriMart Dark Pod & Farm Delivery Service'}
            </h2>
            <p>
              {isHindi
                ? 'एग्रीमार्ट विशेष कृषि प्रेषण पॉड्स संचालित करता है जो भारतीय किसानों को प्रमाणित बीजों, उच्च श्रेणी की जैविक खाद, घुलनशील उर्वरकों और कृषि वैज्ञानिक सहायता से जोड़ता है। डिलीवरी विकल्प (फगवाड़ा डार्क पॉड से एक्सप्रेस पार्सल प्रेषण और मानक फ़ार्म डिलीवरी) सड़क सुरक्षा और ऑर्डर दबाव समय के अधीन हैं।'
                : 'AgriMart operates specialized agricultural dispatch pods connecting Indian farmers with certified seeds, high-grade organic manure, water-soluble fertilizers, and agronomist support. Delivery options (Express Parcel Dispatch and Standard Farm Delivery from Phagwara Dark Pod) are subject to road safety and order surge windows.'}
            </p>

            <h2 className="text-lg font-bold text-[#142B4A] mt-8 mb-4 tracking-wide uppercase">
              {isHindi ? '2. उत्पाद प्रमाणीकरण एवं उपयोग' : '2. Product Certification & Usage'}
            </h2>
            <p>
              {isHindi
                ? 'सूचीबद्ध सभी इनपुट्स बीज अधिनियम 1966 और उर्वरक (अकार्बनिक, जैविक या मिश्रित) (नियंत्रण) आदेश 1985 का पालन करते हैं। किसानों को सलाह दी जाती है कि वे पैकेज पर अनुशंसित मात्रा और उपयोग दिशानिर्देशों का पालन करें या हमारे निःशुल्क कृषि सलाहकार डेस्क से परामर्श लें।'
                : 'All inputs listed comply with the Seeds Act, 1966 and the Fertilizer (Inorganic, Organic or Mixed) (Control) Order. Farmers are advised to follow recommended dosage and application guidelines on the label or consult our free agronomist advisory desk.'}
            </p>

            <h2 className="text-lg font-bold text-[#142B4A] mt-8 mb-4 tracking-wide uppercase">
              {isHindi ? '3. भुगतान एवं सीओडी सत्यापन' : '3. Payments & COD Verification'}
            </h2>
            <p>
              {isHindi
                ? 'ऑर्डर का भुगतान सुरक्षित ऑनलाइन गेटवे (UPI, कार्ड, नेटबैंकिंग) या कैश ऑन डिलीवरी (COD) के माध्यम से किया जा सकता है। सीओडी ऑर्डर के लिए पार्सल सौंपते समय ग्राहक ओटीपी सत्यापन आवश्यक हो सकता है।'
                : 'Orders may be paid via secure online gateways (UPI, Cards, Netbanking) or Cash on Delivery (COD). For COD orders, customer OTP verification may be required upon parcel handover.'}
            </p>

            <h2 className="text-lg font-bold text-[#142B4A] mt-8 mb-4 tracking-wide uppercase">
              {isHindi ? '4. लागू कानून' : '4. Governing Law'}
            </h2>
            <p>
              {isHindi
                ? 'ये शर्तें भारत के कानूनों द्वारा शासित होती हैं, जो पंजाब के न्यायालयों के अधिकार क्षेत्र के अंतर्गत हैं।'
                : 'These terms are governed by the laws of India, under the jurisdiction of the courts of Punjab.'}
            </p>

            <h2 className="text-lg font-bold text-[#142B4A] mt-8 mb-4 tracking-wide uppercase">
              {isHindi ? 'कानूनी पूछताछ' : 'Legal Inquiries'}
            </h2>
            <p>
              {isHindi ? 'ईमेल: ' : 'Email: '}<strong>legal@agrimart.farm</strong><br />
              {isHindi
                ? 'एग्रीमार्ट क्विक कॉमर्स प्राइवेट लिमिटेड, सेंट्रल किसान हब #01, फगवाड़ा, कपूरथला, पंजाब - 144401'
                : 'AgriMart Quick Commerce Private Limited, Central Kisan Hub #01, Phagwara, Kapurthala, Punjab - 144401'}
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
