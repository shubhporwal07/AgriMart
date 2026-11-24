'use client';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';

export default function NotFound() {
  const { isHindi } = useLanguage();
  return (
    <div className="min-h-screen bg-[#FAF5EB] flex flex-col justify-between">
      <Navbar />
      <div className="max-w-md mx-auto text-center px-4 py-20">
        <div className="w-20 h-20 bg-[#FFE8D6] text-[#E27B12] rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-sm">
          <span className="material-symbols-outlined text-4xl">search_off</span>
        </div>
        <h1 className="text-3xl font-black text-[#142B4A] mb-2 font-headline">{isHindi ? 'पृष्ठ नहीं मिला' : 'Page Not Found'}</h1>
        <p className="text-sm text-[#5A6B82] mb-8 leading-relaxed">
          {isHindi ? 'आप जिस पृष्ठ या उत्पाद की तलाश कर रहे हैं वह मौजूद नहीं है या हटा दिया गया है।' : 'The aisle or product page you are looking for does not exist or has been moved.'}
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-[#142B4A] hover:bg-[#1B385D] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">home</span>
          {isHindi ? 'एग्रीमार्ट होम पर वापस जाएं' : 'Back to AgriMart Home'}
        </Link>
      </div>
      <Footer />
    </div>
  );
}
