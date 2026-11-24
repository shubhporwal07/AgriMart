'use client';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';

export default function PrivacyPolicy() {
  const { isHindi } = useLanguage();

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-100 shadow-sm">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#E27B12] mb-2 block">
            {isHindi ? 'एग्रीमार्ट कानूनी एवं अनुपालन' : 'AgriMart Legal & Compliance'}
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#142B4A] mb-8">
            {isHindi ? 'गोपनीयता नीति (Privacy Policy)' : 'Privacy Policy'}
          </h1>
          <div className="prose prose-slate max-w-none text-slate-600 space-y-6 text-sm sm:text-base leading-relaxed">
            <p>
              {isHindi ? (
                <><strong>एग्रीमार्ट (AgriMart)</strong> में, हम आपके व्यक्तिगत डेटा की सुरक्षा और आपके कृषि इनपुट खरीद अनुभव को पूरी तरह सुरक्षित रखने के लिए प्रतिबद्ध हैं। यह गोपनीयता नीति उन जानकारियों का विवरण देती है जो हम हमारे प्रमाणित कृषि इनपुट डिलीवरी ऐप और वेबसाइट के उपयोग के दौरान एकत्र करते हैं, और विश्वसनीय कृषि आपूर्ति प्रदान करने के लिए हम इसका उपयोग कैसे करते हैं।</>
              ) : (
                <>At <strong>AgriMart</strong>, we are committed to safeguarding your personal data and ensuring that your agricultural input purchasing experience is completely secure. This Privacy Policy details the types of information we collect when you use our certified farm inputs delivery application and website, and how we utilize it to provide reliable agricultural fulfillment.</>
              )}
            </p>

            <h2 className="text-lg font-bold text-[#142B4A] mt-8 mb-4 tracking-wide uppercase">
              {isHindi ? '1. हम कौन सी जानकारी एकत्र करते हैं' : '1. Information We Collect'}
            </h2>
            <p>
              {isHindi
                ? 'त्वरित कृषि डिलीवरी और खेत तक सही रूटिंग सुनिश्चित करने के लिए, हम निम्नलिखित एकत्र करते हैं:'
                : 'To ensure swift agricultural delivery and accurate farmland routing, we collect:'}
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                {isHindi
                  ? 'संपर्क विवरण: डिलीवरी अपडेट और प्रेषण ओटीपी के लिए नाम, ईमेल पता और मोबाइल फोन नंबर।'
                  : 'Contact details: Name, email address, and mobile phone number for delivery updates and dispatch OTPs.'}
              </li>
              <li>
                {isHindi
                  ? 'डिलीवरी निर्देशांक: निकटतम डार्क स्टोर पॉड या किसान हब से रूट करने के लिए खेत का स्थान, गांव का नाम, सड़क का पता और पिन कोड।'
                  : 'Delivery coordinates: Farm location, village name, street address, and pincode to route to the nearest dark store pod or Kisan Hub.'}
              </li>
              <li>
                {isHindi
                  ? 'ऑर्डर प्राथमिकताएं: पसंदीदा बीज किस्में, मृदा पोषण योजनाएं और आवर्ती मौसमी कृषि इनपुट्स।'
                  : 'Order preferences: Favorite seed varieties, soil nutrition plans, and recurring seasonal inputs.'}
              </li>
              <li>
                {isHindi
                  ? 'भुगतान पहचानकर्ता: रेज़रपे (Razorpay) जैसे पीसीआई-डीएसएस अनुरूप गेटवे के माध्यम से सुरक्षित रूप से संसाधित (हम कच्चे कार्ड क्रेडेंशियल संग्रहीत नहीं करते हैं)।'
                  : 'Payment identifiers: Processed securely through PCI-DSS compliant gateways like Razorpay (we do not store raw card credentials).'}
              </li>
            </ul>

            <h2 className="text-lg font-bold text-[#142B4A] mt-8 mb-4 tracking-wide uppercase">
              {isHindi ? '2. हम आपके डेटा का उपयोग कैसे करते हैं' : '2. How We Use Your Data'}
            </h2>
            <p>
              {isHindi ? 'आपके डेटा का उपयोग विशेष रूप से निम्न कार्यों के लिए किया जाता है:' : 'Your data is exclusively utilized to:'}
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                {isHindi
                  ? 'प्रमाणित बीज, जैविक उर्वरक और फसल सुरक्षा इनपुट्स को संसाधित और प्रेषित करना।'
                  : 'Process and dispatch certified seeds, bio-fertilizers, and crop protection inputs.'}
              </li>
              <li>
                {isHindi
                  ? 'एसएमएस या व्हाट्सएप के माध्यम से वास्तविक समय में प्रेषण, रूट और ओटीपी सूचनाएं भेजना।'
                  : 'Send real-time dispatch, route, and OTP notifications via SMS or WhatsApp.'}
              </li>
              <li>
                {isHindi
                  ? 'यदि आपने अलर्ट सब्सक्राइब किए हैं, तो मौसमी बुवाई सलाह और सरकारी सब्सिडी घोषणाओं की सूचना देना।'
                  : 'Notify you of seasonal sowing advisories and government subsidy announcements if you have subscribed to alerts.'}
              </li>
              <li>
                {isHindi
                  ? 'डार्क स्टोर इन्वेंट्री पूर्वानुमान में सुधार करना और बुवाई के मौसम में प्रमाणित बीजों की निरंतर उपलब्धता सुनिश्चित करना।'
                  : 'Improve dark store inventory forecasting and ensure certified seeds remain available during sowing windows.'}
              </li>
            </ul>

            <h2 className="text-lg font-bold text-[#142B4A] mt-8 mb-4 tracking-wide uppercase">
              {isHindi ? '3. डेटा सुरक्षा एवं एन्क्रिप्शन' : '3. Data Security & Encryption'}
            </h2>
            <p>
              {isHindi
                ? 'सभी ग्राहक सत्र और संचार 256-बिट टीएलएस (TLS) एन्क्रिप्शन का उपयोग करके सुरक्षित किए जाते हैं। खेत शिपिंग पते तक पहुंच सक्रिय पारगमन के दौरान केवल अधिकृत डिलीवरी कर्मियों तक ही सीमित है।'
                : 'All customer sessions and communications are secured using 256-bit TLS encryption. Access to farmland shipping addresses is strictly restricted to assigned delivery partners during active transit.'}
            </p>

            <h2 className="text-lg font-bold text-[#142B4A] mt-8 mb-4 tracking-wide uppercase">
              {isHindi ? 'गोपनीयता अधिकारी से संपर्क करें' : 'Contact Privacy Officer'}
            </h2>
            <p>
              {isHindi ? 'ईमेल: ' : 'Email: '}<strong>privacy@agrimart.farm</strong><br />
              {isHindi
                ? 'एग्रीमार्ट किसान क्विक कॉमर्स प्राइवेट लिमिटेड, सेंट्रल किसान हब #01, फगवाड़ा, कपूरथला, पंजाब - 144401'
                : 'AgriMart Kisan Quick Commerce Private Limited, Central Kisan Hub #01, Phagwara, Kapurthala, Punjab - 144401'}
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
