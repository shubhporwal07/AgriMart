'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Footer() {
  const [contact, setContact] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!contact) return;
    setSubscribed(true);
    setContact('');
    setTimeout(() => setSubscribed(false), 5000);
  };

  return (
    <footer className="w-full bg-[#EDF2F7] text-[#263449] mt-12 pt-12 pb-6 border-t border-[#CBD5E1]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-[#CBD5E1]/40">
          {/* Brand Info */}
          <div className="flex flex-col items-start gap-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#142B4A] flex items-center justify-center text-[#FF9F43] shadow-sm">
                <span className="material-symbols-outlined text-[24px]">potted_plant</span>
              </div>
              <span className="font-headline text-2xl text-[#142B4A] font-extrabold">
                Agri<span className="text-[#FF9F43]">Mart</span>
              </span>
            </Link>
            <p className="text-sm text-[#5A6B82] leading-relaxed">
              High-Yield Seeds, Certified Fertilizers & Farm Inputs. Empowering Indian agriculture with lab-verified inputs direct to your farm gate.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1 bg-white text-[#142B4A] px-3 py-1 rounded-full text-xs font-bold shadow-sm border border-[#CBD5E1]/30">
                <span className="material-symbols-outlined text-[16px] text-[#FF9F43]">verified</span>
                Seed Act 1966 Certified
              </span>
              <span className="inline-flex items-center gap-1 bg-white text-[#A74E00] px-3 py-1 rounded-full text-xs font-bold shadow-sm border border-[#CBD5E1]/30">
                <span className="material-symbols-outlined text-[16px]">eco</span>
                FCO 1985 Compliant
              </span>
            </div>

            <div className="flex flex-col gap-1.5 text-[#5A6B82] text-xs pt-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#142B4A]">call</span>
                <span className="font-semibold">1800-AGRI-MART (Toll-Free Kisan Help)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#142B4A]">mail</span>
                <span>advisory@agrimart.farm</span>
              </div>
            </div>
          </div>

          {/* Kisan Advisory & Services */}
          <div>
            <h4 className="font-headline text-base text-[#142B4A] font-extrabold mb-4">
              Kisan Advisory & Services
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm text-[#5A6B82]">
              <li className="hover:text-[#142B4A] transition-colors">
                <Link href="/about-us">Consult Crop Agronomist</Link>
              </li>
              <li className="hover:text-[#142B4A] transition-colors">
                <Link href="/dashboard?category=soil-kits">Soil Health Card Diagnostic</Link>
              </li>
              <li className="hover:text-[#142B4A] transition-colors">
                <Link href="/dashboard?category=chemical-npk">Fertilizer Dosage Calculator</Link>
              </li>
              <li className="hover:text-[#142B4A] transition-colors">
                <Link href="/about-us">FPO & Bulk Mandi Supply</Link>
              </li>
              <li className="hover:text-[#142B4A] transition-colors">
                <Link href="/dashboard?category=bio-pesticides">Seasonal Pest & Crop Guide</Link>
              </li>
              <li className="hover:text-[#142B4A] transition-colors">
                <Link href="/about-us">Our Agritech Mission</Link>
              </li>
            </ul>
          </div>

          {/* Customer & Village Care */}
          <div>
            <h4 className="font-headline text-base text-[#142B4A] font-extrabold mb-4">
              Customer & Village Care
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm text-[#5A6B82]">
              <li className="hover:text-[#142B4A] transition-colors">
                <Link href="/orders">Track Dispatch & Logistics</Link>
              </li>
              <li className="hover:text-[#142B4A] transition-colors">
                <Link href="/return-policy">Return & Seed Replacement Policy</Link>
              </li>
              <li className="hover:text-[#142B4A] transition-colors">
                <Link href="/privacy-policy">Privacy & Farmer Data Security</Link>
              </li>
              <li className="hover:text-[#142B4A] transition-colors">
                <Link href="/terms-of-service">Terms & FCO Conditions</Link>
              </li>
              <li className="hover:text-[#142B4A] transition-colors">
                <Link href="/about-us">Rural & Farm Delivery Centers</Link>
              </li>
            </ul>
          </div>

          {/* Kisan App & Payments */}
          <div className="flex flex-col gap-4">
            <h4 className="font-headline text-base text-[#142B4A] font-extrabold">
              Download AgriMart Kisan App
            </h4>
            <div className="p-3 bg-white rounded-2xl border border-[#CBD5E1]/50 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFE8D6] text-[#E27B12] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">smartphone</span>
              </div>
              <div>
                <p className="text-xs font-bold text-[#142B4A]">AgriMart Kisan Mobile App</p>
                <p className="text-[11px] text-[#5A6B82]">Mandi prices, dosage guide & quick reorder</p>
              </div>
            </div>

            {/* Newsletter */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-[#263449]">Receive Weekly Mandi Rates & Offers</span>
              {subscribed ? (
                <div className="bg-emerald-50 text-emerald-700 text-xs p-2 rounded-lg font-semibold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>Subscription confirmed! Weekly alerts enabled.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-1.5">
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="Enter mobile or email"
                    required
                    className="bg-white border border-[#CBD5E1] px-3 py-1.5 rounded-lg text-xs text-[#263449] outline-none w-full focus:border-[#142B4A]"
                  />
                  <button
                    type="submit"
                    className="bg-[#142B4A] hover:bg-[#1B385D] text-white text-xs px-3 py-1.5 rounded-lg font-bold shrink-0 transition-colors shadow-sm"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>

            {/* Accepted Payments */}
            <div>
              <span className="text-[10px] text-[#5A6B82] block mb-1 uppercase font-bold tracking-wider">
                Accepted Kisan Payment Modes
              </span>
              <div className="flex flex-wrap gap-1 text-[11px] text-[#5A6B82]">
                <span className="bg-white px-2 py-0.5 rounded shadow-sm border border-[#CBD5E1]/40 font-semibold">
                  Kisan Credit Card (KCC)
                </span>
                <span className="bg-white px-2 py-0.5 rounded shadow-sm border border-[#CBD5E1]/40 font-semibold">UPI</span>
                <span className="bg-white px-2 py-0.5 rounded shadow-sm border border-[#CBD5E1]/40 font-semibold">RuPay</span>
                <span className="bg-white px-2 py-0.5 rounded shadow-sm border border-[#CBD5E1]/40 font-semibold">NetBanking</span>
                <span className="bg-white px-2 py-0.5 rounded shadow-sm border border-[#CBD5E1]/40 font-semibold">
                  Cash on Delivery
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-2 text-[#5A6B82] text-xs">
          <p>© 2025 AgriMart Agritech Solutions Pvt Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-[#142B4A]">verified</span>
              Seed License No: AGRI/SEED/DL-8841
            </span>
            <span>FCO Registration: FCO/CR/2021/409</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
