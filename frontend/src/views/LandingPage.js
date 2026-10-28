'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import UnserviceableNotice from '../components/UnserviceableNotice';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import ProductDetailsModal from '../components/ProductDetailsModal';
import { useProducts } from '../contexts/ProductContext';

export default function LandingPage() {
  const router = useRouter();
  const { products, cartCount, cartTotal, addToCart } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Live countdown timer state for today's kisan sowing deals
  const [timeLeft, setTimeLeft] = useState({ hours: 6, minutes: 42, seconds: 19 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 8, minutes: 0, seconds: 0 };
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Agri category tiles matching stitch design
  const categoryTiles = [
    { name: 'Vegetable Seeds', icon: 'psychiatry', count: '320+ Varieties', slug: 'vegetable-seeds', bg: 'bg-[#EDF2F7]', text: 'text-[#142B4A]' },
    { name: 'Grain & Crop Seeds', icon: 'grain', count: '140+ Crops', slug: 'field-crop-seeds', bg: 'bg-[#FFF6E5]', text: 'text-[#A74E00]' },
    { name: 'Organic Manure & Compost', icon: 'compost', count: '85+ Bio Blends', slug: 'organic-fertilizers', bg: 'bg-[#F5EEDB]', text: 'text-[#8F4E00]' },
    { name: 'NPK & Water Soluble', icon: 'science', count: '110+ Formulations', slug: 'chemical-npk', bg: 'bg-[#FFF0D4]', text: 'text-[#A74E00]' },
    { name: 'Micronutrients & Growth', icon: 'energy_savings_leaf', count: '90+ Tonics', slug: 'micronutrients', bg: 'bg-[#FEECEB]', text: 'text-rose-700' },
    { name: 'Bio-Pesticides & Fungicides', icon: 'shield', count: '65+ Bio Solutions', slug: 'bio-pesticides', bg: 'bg-[#FEF6DC]', text: 'text-[#A74E00]' },
    { name: 'Farm Tools & Sprayers', icon: 'handyman', count: '130+ Equipments', slug: 'sprayers-tools', bg: 'bg-[#ECEEF1]', text: 'text-[#142B4A]' },
    { name: 'Soil Health Kits', icon: 'biotech', count: 'Testing & pH Kits', slug: 'soil-kits', bg: 'bg-[#EBF3FF]', text: 'text-[#142B4A]' },
  ];

  // Flash deals products (first 6 items)
  const flashProducts = products.slice(0, 6);

  // Soil Nutrition Corner products (organic and soil items)
  const soilProducts = products
    .filter((p) => p.category === 'Organic Manure & Compost' || p.category === 'Soil Health Kits' || p.isOrganic)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#263449] font-sans antialiased">
      <Navbar />

      {/* Serviceability / hub notice */}
      <UnserviceableNotice />

      <main className="w-full">
        {/* SECTION 1: HERO SHOWCASE */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Hero Banner (8 Cols) */}
            <div className="lg:col-span-8 relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#10233D] via-[#142B4A] to-[#1B385D] shadow-xl flex flex-col justify-between p-6 sm:p-10 text-white min-h-[460px]">
              {/* Background Ambient Image with Gradient Scrim */}
              <div
                className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-30 transform hover:scale-105 transition-transform duration-700 ease-out"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBahlrUreOlUzjIg7_ygEmDwzARf19wN-sTtxyU4ylIVqcJ02TkzVKgp2yQzg2v1C9JCGRjcSQl3w1FIq23w4qjLssR_Uxw2x1pb93-ASCub4EDQWq3ZVurSvjR5Ubf97ekgOYQL3TowagehbiDXg8A9tRumbjXiAfi7ckImnXUwrhyvWR9MyYbHqqLZETDqOBwrNq5P2VDZ451nSORGwvmSd2HmpS9daeIf_ZNs3SW_8qX7qVaVY60')",
                }}
              />
              <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-blue-400/15 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-[#FF9F43]/15 blur-2xl pointer-events-none" />

              {/* Upper Tag & Live Indicator */}
              <div className="relative z-10 flex items-center justify-between gap-2 flex-wrap">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full text-slate-100 border border-white/10 text-xs">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#FF9F43] animate-ping" />
                  <span className="uppercase tracking-wider font-bold">Kharif & Rabi Seed Batches In Stock</span>
                </div>
                <span className="font-mono text-xs text-slate-300 hidden sm:inline-block">
                  CERTIFIED_SEED_ACT_1966 • FCO_COMPLIANT
                </span>
              </div>

              {/* Center Typography */}
              <div className="relative z-10 my-6 max-w-xl">
                <p className="text-xs uppercase tracking-widest text-[#FF9F43] font-extrabold mb-2">
                  High-Yield Seeds, Certified Fertilizers & Farm Inputs
                </p>
                <h1 className="font-headline text-3xl sm:text-5xl text-white leading-tight font-extrabold tracking-tight">
                  Certified Seeds & High-Grade Fertilizers, Delivered Direct to Your Farm
                </h1>
                <p className="text-sm sm:text-base text-slate-200 mt-3 leading-relaxed max-w-lg">
                  Government-certified hybrid seeds, organic compost, NPK blends, and soil nutrition solutions trusted by 250,000+ farmers across India.
                </p>

                {/* CTAs */}
                <div className="flex flex-wrap items-center gap-3 mt-6">
                  <button
                    onClick={() => router.push('/dashboard?category=vegetable-seeds')}
                    className="bg-[#FF9F43] text-[#142B4A] hover:bg-[#ffb067] text-sm px-6 py-3 rounded-full transition-all flex items-center gap-1.5 shadow-lg font-headline font-extrabold transform active:scale-95 group"
                  >
                    <span>Shop High-Yield Seeds</span>
                    <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </button>
                  <a
                    href="#flash-deals"
                    className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white text-sm px-5 py-3 rounded-full transition-all border border-white/15 font-semibold"
                  >
                    <span>Explore Fertilizers</span>
                    <span className="bg-[#FF9F43] text-[#142B4A] text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      Subsidized & Bulk
                    </span>
                  </a>
                </div>
              </div>

              {/* Trust Badges Bar */}
              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-white/15 text-xs">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#FF9F43] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    verified
                  </span>
                  <span className="text-slate-100 font-semibold">95%+ Certified Germination</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#FF9F43] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    local_shipping
                  </span>
                  <span className="text-slate-100 font-semibold">Direct Doorstep Farm Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#FF9F43] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    support_agent
                  </span>
                  <span className="text-slate-100 font-semibold">Free Agronomist Advisory</span>
                </div>
              </div>
            </div>

            {/* Right Promotional Deal Cards (4 Cols Stacked) */}
            <div className="lg:col-span-4 flex flex-col justify-between gap-4">
              {/* Promo Card 1: Kisan Sowing Starter Kit */}
              <div className="relative rounded-3xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all p-5 flex-1 flex flex-col justify-between group border border-[#CBD5E1]/40">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="bg-[#FF9F43] text-[#142B4A] font-headline text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider font-extrabold shadow-sm">
                    30% SEASON DISCOUNT
                  </span>
                  <span className="font-mono text-xs text-[#A74E00] font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">local_fire_department</span>
                    High Demand
                  </span>
                </div>
                <div className="flex items-center gap-4 my-auto">
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-[#EDF2F7] shrink-0">
                    <img
                      src="https://lh3.googleusercontent.com/aida/AEtjO1WJFWo1syzEULlX4Tc3FuI-bDU_hiIWHm5K9CrNRI1NM4UCSzfTPoiImgYr5_GXGbQ_ORc2hfkSiaRLk7_sCWDqrXuhBhgaChnZiXlUlOgstchVupe-lNt4MwGEmvMcM77cgky8XPoP3Ec-CMOmZHu9uqmfuWhqO1qGY_4TPQCQcigDlx-b7LxhdpQ5yUBl9DN-sv5qs-lLJ12Ey0nfEFvEq4TyHpgllSEqu3p1e59PjiLgVDQULC2PNDo"
                      alt="Kisan Sowing Starter Kit"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-[#5A6B82] uppercase tracking-wider">
                      All-in-One Sowing Kit
                    </span>
                    <h3 className="font-headline text-base font-bold text-[#142B4A] leading-tight mt-0.5">
                      Kisan Sowing Starter Kit
                    </h3>
                    <p className="text-xs text-[#5A6B82] mt-1 line-clamp-1">
                      5 hybrid seed packs + bio-fungicide + seed primer
                    </p>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="font-price text-lg font-extrabold text-[#142B4A]">₹649</span>
                      <span className="text-xs text-slate-400 line-through">₹920</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const kit = products.find((p) => p.id === 'agri-kisan-starter-kit') || {
                      id: 'agri-kisan-starter-kit',
                      name: 'Kisan Sowing Starter Kit (Combo)',
                      price: 649,
                      unit: '5 Hybrid Seed Packs + Bio-Booster',
                      imageUrl: 'https://lh3.googleusercontent.com/aida/AEtjO1WJFWo1syzEULlX4Tc3FuI-bDU_hiIWHm5K9CrNRI1NM4UCSzfTPoiImgYr5_GXGbQ_ORc2hfkSiaRLk7_sCWDqrXuhBhgaChnZiXlUlOgstchVupe-lNt4MwGEmvMcM77cgky8XPoP3Ec-CMOmZHu9uqmfuWhqO1qGY_4TPQCQcigDlx-b7LxhdpQ5yUBl9DN-sv5qs-lLJ12Ey0nfEFvEq4TyHpgllSEqu3p1e59PjiLgVDQULC2PNDo',
                    };
                    addToCart(kit, 1);
                  }}
                  className="w-full mt-3 bg-[#142B4A] hover:bg-[#1B385D] text-white text-xs py-2.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[17px]">add_shopping_cart</span>
                  <span>Quick Order Kit</span>
                </button>
              </div>

              {/* Promo Card 2: Organic Soil Booster Combo */}
              <div className="relative rounded-3xl overflow-hidden bg-[#EDF2F7] shadow-md hover:shadow-xl transition-all p-5 flex-1 flex flex-col justify-between group border border-[#CBD5E1]/40">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="bg-[#142B4A] text-white font-headline text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider font-extrabold">
                    Save ₹220
                  </span>
                  <span className="text-xs text-[#142B4A] font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">eco</span>
                    100% Organic
                  </span>
                </div>
                <div className="flex items-center gap-4 my-auto">
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-white shrink-0">
                    <img
                      src="https://lh3.googleusercontent.com/aida/AEtjO1W8CJzuxUiUG8CGznqprVoPmajgZKaBFnRrVTqrUfOAf2g87nYttcc60NzobmhLL5XpCf-kd2bDOuF--0_ALOnyva_5dY8TGDwF1h2yB1zz43Oyk2EdzMJ0PzfNvfdSmHqTjOz1H17ewO_dM0zo_HTH0AUaANKjxCHuvQfTbooB8eieiKPNMP4WQJRS3sCTYESURNhe2Qy4Sa573KTrJd8O0YmEvwHBhgsjMGDGv4qvQsKVq6yt-1TJx-g"
                      alt="Organic Soil Booster Combo"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-[#5A6B82] uppercase tracking-wider">
                      Soil Regeneration
                    </span>
                    <h3 className="font-headline text-base font-bold text-[#142B4A] leading-tight mt-0.5">
                      Organic Soil Booster Combo
                    </h3>
                    <p className="text-xs text-[#5A6B82] mt-1 line-clamp-1">
                      20kg Vermicompost + 1L Humic Fulvic Extract
                    </p>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="font-price text-lg font-extrabold text-[#142B4A]">₹790</span>
                      <span className="text-xs text-slate-400 line-through">₹1,010</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const combo = products.find((p) => p.id === 'agri-soil-booster-combo') || {
                      id: 'agri-soil-booster-combo',
                      name: 'Organic Soil Booster Combo (20kg + 1L)',
                      price: 790,
                      unit: '20kg Vermicompost + 1L Humic Extract',
                      imageUrl: 'https://lh3.googleusercontent.com/aida/AEtjO1W8CJzuxUiUG8CGznqprVoPmajgZKaBFnRrVTqrUfOAf2g87nYttcc60NzobmhLL5XpCf-kd2bDOuF--0_ALOnyva_5dY8TGDwF1h2yB1zz43Oyk2EdzMJ0PzfNvfdSmHqTjOz1H17ewO_dM0zo_HTH0AUaANKjxCHuvQfTbooB8eieiKPNMP4WQJRS3sCTYESURNhe2Qy4Sa573KTrJd8O0YmEvwHBhgsjMGDGv4qvQsKVq6yt-1TJx-g',
                    };
                    addToCart(combo, 1);
                  }}
                  className="w-full mt-3 bg-white hover:bg-[#142B4A] hover:text-white text-[#142B4A] border border-[#142B4A]/30 text-xs py-2.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[17px]">add_shopping_cart</span>
                  <span>Quick Order Combo</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: EXPLORE BY CATEGORY */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-2">
            <div>
              <div className="flex items-center gap-2 text-[#142B4A] text-xs font-bold uppercase tracking-wider">
                <span className="w-5 h-0.5 bg-[#142B4A]" />
                <span>Crop Input Catalog</span>
              </div>
              <h2 className="font-headline text-2xl sm:text-3xl font-extrabold text-[#142B4A] mt-1">
                Explore by Category
              </h2>
            </div>
            <Link
              href="/dashboard?category=all"
              className="text-xs font-bold text-[#142B4A] hover:text-[#E27B12] flex items-center gap-1 group"
            >
              <span>View all 1,200+ farm inputs</span>
              <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                east
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
            {categoryTiles.map((tile) => (
              <Link
                key={tile.name}
                href={`/dashboard?category=${tile.slug}`}
                className={`group flex flex-col items-center text-center p-4 rounded-2xl ${tile.bg} hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-[#CBD5E1]/30`}
              >
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-2 shadow-inner group-hover:scale-110 transition-transform">
                  <span className={`material-symbols-outlined ${tile.text} text-[28px]`}>
                    {tile.icon}
                  </span>
                </div>
                <h4 className="font-headline text-xs font-bold text-[#142B4A] leading-tight">
                  {tile.name}
                </h4>
                <span className="text-[10px] text-[#5A6B82] mt-0.5">{tile.count}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* SECTION 3: TODAY'S KISAN SOWING DEALS */}
        <section id="flash-deals" className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
          {/* Header with Countdown */}
          <div className="bg-white rounded-3xl p-6 shadow-sm mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-[#CBD5E1]/40">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FFE8D6] flex items-center justify-center text-[#E27B12]">
                <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  timer
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-headline text-xl sm:text-2xl font-extrabold text-[#142B4A]">
                    Today's Kisan Sowing Deals
                  </h2>
                  <span className="bg-[#FF9F43] text-[#142B4A] text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">
                    Live
                  </span>
                </div>
                <p className="text-xs text-[#5A6B82] mt-0.5">Subsidized direct-to-farm inputs with batch lab reports</p>
              </div>
            </div>

            {/* Countdown Display */}
            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
              <div className="flex items-center gap-1.5 font-mono text-center">
                <span className="text-xs text-[#5A6B82] uppercase mr-1 font-sans font-semibold">
                  Batch Closes In:
                </span>
                <div className="bg-[#142B4A] text-white px-2.5 py-1 rounded-lg shadow-sm">
                  <span className="text-xs font-bold text-white">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] text-slate-300 block uppercase font-sans">hrs</span>
                </div>
                <span className="font-bold text-[#142B4A]">:</span>
                <div className="bg-[#142B4A] text-white px-2.5 py-1 rounded-lg shadow-sm">
                  <span className="text-xs font-bold text-white">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] text-slate-300 block uppercase font-sans">min</span>
                </div>
                <span className="font-bold text-[#142B4A]">:</span>
                <div className="bg-[#142B4A] text-white px-2.5 py-1 rounded-lg shadow-sm">
                  <span className="text-xs font-bold text-[#FF9F43]">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] text-slate-300 block uppercase font-sans">sec</span>
                </div>
              </div>

              <Link
                href="/dashboard?category=all"
                className="hidden sm:flex items-center gap-1 text-xs text-[#142B4A] hover:text-[#E27B12] font-bold"
              >
                <span>View All 58 Farm Deals</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* Flash Deals Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {flashProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onViewDetails={(item) => setSelectedProduct(item)}
              />
            ))}
          </div>
        </section>

        {/* SECTION 4: CURATED SOIL NUTRITION CORNER */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
          <div className="rounded-3xl bg-gradient-to-br from-[#142B4A] via-[#10233D] to-[#0B1728] text-white p-6 sm:p-10 relative overflow-hidden shadow-2xl border border-white/10">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#94B3FD_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-[#FF9F43]/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-white/15">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-1.5 bg-[#FF9F43] text-[#142B4A] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 shadow-sm">
                  <span>⭐</span> Government Tested Soil Nutrition Lab
                </div>
                <h2 className="font-headline text-2xl sm:text-3xl text-white font-extrabold tracking-tight">
                  Certified Organic & Government Tested Soil Nutrition
                </h2>
                <p className="text-sm text-slate-200 mt-2 leading-relaxed">
                  Direct access to bio-fertilizers, mycorrhizal root inoculants, steamed bone meal, and certified hybrid field seeds with 100% verified germination rates and batch purity reports.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl flex items-center gap-3 border border-white/15">
                <span className="material-symbols-outlined text-[#FF9F43] text-[32px]">biotech</span>
                <div>
                  <span className="text-[10px] text-[#FF9F43] uppercase tracking-wider block font-bold">
                    FCO Approved
                  </span>
                  <span className="text-xs text-white font-bold">Zero Adulteration Guarantee</span>
                </div>
              </div>
            </div>

            {/* 4 Hero Soil Nutrition Items */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
              {soilProducts.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedProduct(item)}
                  className="bg-white text-[#263449] rounded-2xl p-4 shadow-lg flex flex-col justify-between group border border-[#CBD5E1]/30 cursor-pointer"
                >
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#EDF2F7] mb-3">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-2 left-2 bg-[#142B4A] text-white text-[9px] px-2 py-0.5 rounded font-bold uppercase">
                      FCO Certified
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#5A6B82]">{item.unit}</span>
                    <h4 className="font-headline text-sm font-bold text-[#142B4A] mt-0.5 line-clamp-1">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-[#74777E] line-clamp-1">{item.description}</p>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-2 border-t border-slate-100">
                    <span className="font-price text-base font-extrabold text-[#142B4A]">
                      ₹{item.price}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(item, 1);
                      }}
                      className="bg-[#142B4A] hover:bg-[#1B385D] text-white p-2 rounded-xl transition-colors shadow-sm"
                      title="Add to Farm Cart"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 5: WHY OVER 250,000+ FARMERS TRUST AGRIMART */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 w-full">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs uppercase tracking-widest text-[#142B4A] font-extrabold">
              Uncompromising Quality & Trust
            </span>
            <h2 className="font-headline text-2xl sm:text-3xl text-[#142B4A] font-extrabold mt-1">
              Why Over 250,000+ Farmers Trust AgriMart
            </h2>
            <p className="text-sm text-[#5A6B82] mt-2">
              Eliminating fake seeds, spurious chemicals, and predatory mandi middle-commissions with certified farm inputs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Value Prop 1 */}
            <div className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between border border-[#CBD5E1]/40">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#EDF2F7] flex items-center justify-center text-[#142B4A] mb-4">
                  <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    biotech
                  </span>
                </div>
                <h3 className="font-headline text-base font-bold text-[#142B4A]">95%+ Lab Germination</h3>
                <p className="text-xs text-[#5A6B82] mt-2 leading-relaxed">
                  Every seed batch undergoes seed moisture and vigor analysis in accredited ICAR labs before dispatch to guarantee stand uniformity.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[#142B4A] text-xs font-bold">
                <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
                <span>Seed Act 1966 Certified</span>
              </div>
            </div>

            {/* Value Prop 2 */}
            <div className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between border border-[#CBD5E1]/40">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#FFE8D6] flex items-center justify-center text-[#E27B12] mb-4">
                  <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    price_check
                  </span>
                </div>
                <h3 className="font-headline text-base font-bold text-[#142B4A]">Direct Factory Rates</h3>
                <p className="text-xs text-[#5A6B82] mt-2 leading-relaxed">
                  By bypassing regional distributors and sub-dealers, we provide wholesale manufacturer rates that save you 20-35% on every sowing acre.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[#A74E00] text-xs font-bold">
                <span className="material-symbols-outlined text-[16px]">savings</span>
                <span>Transparent MRP & Subsidies</span>
              </div>
            </div>

            {/* Value Prop 3 */}
            <div className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between border border-[#CBD5E1]/40">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#E2E8F0] flex items-center justify-center text-[#142B4A] mb-4">
                  <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    support_agent
                  </span>
                </div>
                <h3 className="font-headline text-base font-bold text-[#142B4A]">Agronomist on Call</h3>
                <p className="text-xs text-[#5A6B82] mt-2 leading-relaxed">
                  Have crop disease or pest questions? Free phone consultations with certified agricultural scientists for tailored dosage charts.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[#142B4A] text-xs font-bold">
                <span className="material-symbols-outlined text-[16px] text-emerald-600">call</span>
                <span>Toll-Free Kisan Advisory</span>
              </div>
            </div>

            {/* Value Prop 4 */}
            <div className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between border border-[#CBD5E1]/40">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-[#142B4A] mb-4">
                  <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    local_shipping
                  </span>
                </div>
                <h3 className="font-headline text-base font-bold text-[#142B4A]">Pan-India Village Delivery</h3>
                <p className="text-xs text-[#5A6B82] mt-2 leading-relaxed">
                  Reaching 18,000+ pin codes. Doorstep delivery directly to your farm gate, village gram panchayat point, or nearest taluka depot.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[#142B4A] text-xs font-bold">
                <span className="material-symbols-outlined text-[16px] text-emerald-600">route</span>
                <span>Safe In-Transit Insurance</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6: FARMER TESTIMONIALS & SOCIAL PROOF */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-2">
            <div>
              <span className="text-xs font-bold text-[#142B4A] uppercase tracking-wider">
                Field Verified Results
              </span>
              <h2 className="font-headline text-2xl sm:text-3xl font-extrabold text-[#142B4A] mt-1">
                Loved by Progressive Farmers
              </h2>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-[#CBD5E1]/40">
              <div className="flex text-[#FF9F43]">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    star
                  </span>
                ))}
              </div>
              <span className="font-price text-sm text-[#142B4A] font-extrabold ml-1">4.91 / 5</span>
              <span className="text-xs text-[#74777E]">from 62,000+ Kisan reviews</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Review 1 */}
            <div className="bg-white rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow border border-[#CBD5E1]/40">
              <div>
                <div className="flex text-[#FF9F43] mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      star
                    </span>
                  ))}
                </div>
                <p className="text-sm text-[#263449] leading-relaxed italic">
                  "Sowed the Abhinav tomato seeds across my 3 acres. Germination was near 98% with zero damping-off issues. The AgriMart agronomist guided me on foliar NPK sprays, and yield went up 28%."
                </p>
              </div>
              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-100">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 shrink-0">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrj4VqFPE9f7u-VPiSDdYoVEXhKaJG1917r88WWFg7UT97pUc-f2r_vStfZJ9jO9cFogc5DWYUz7NACyNV1CaGmntd23HcntUkq9pOVdSFfvZtsWyNNovrWlFoI-UzE6TKwil8mkMB656yhE-KgfTF260mpj_KSWyf7hxzS0YNrLtgJCxTkW3hYpCdziCNku1MCk_MJK_Vfc927nDAQWv2kbhXxEUI09RS7SpReisKXZcxGn1JHpgr"
                    alt="Rajinder Singh Cheema"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="font-headline text-xs font-bold text-[#142B4A]">Rajinder Singh Cheema</span>
                    <span className="material-symbols-outlined text-[14px] text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>
                      verified
                    </span>
                  </div>
                  <span className="text-[11px] text-[#5A6B82]">Wheat & Tomato Farmer • Ludhiana, PB</span>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-white rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow border border-[#CBD5E1]/40">
              <div>
                <div className="flex text-[#FF9F43] mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      star
                    </span>
                  ))}
                </div>
                <p className="text-sm text-[#263449] leading-relaxed italic">
                  "Earlier local dealers charged inflated rates with zero guarantee of genuine brands. With AgriMart, 50 bags of vermicompost and micronutrient tonics arrived straight to my farm in 48 hours."
                </p>
              </div>
              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-100">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 shrink-0">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMaWUyXY-reHQIqewftjiG-DhmtYOOz4KT1uukLe-JCPHrxt1MM5Dq-GKMHBhjL-RYMrIGcWYlLfCKJNAQTKzIhfCykrxLNwjLyI3JkybJPFqc2-nKy0eAUYwLcik-NSsT7O9yIMC7rQUm5mGrCjnC79BbZZV5Xqw08M1xbBvzrg7QYca08BZPZNSkIYwCsT-I0JXrSbhLI4BknT1DkoxWXuQd9ZoLOlBG9FEoqYUC9yXNc9_5umH4"
                    alt="Venkatesh Gowda"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="font-headline text-xs font-bold text-[#142B4A]">Venkatesh Gowda</span>
                    <span className="material-symbols-outlined text-[14px] text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>
                      verified
                    </span>
                  </div>
                  <span className="text-[11px] text-[#5A6B82]">Pomegranate & Chilli Grower • Chitradurga</span>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="bg-white rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow border border-[#CBD5E1]/40">
              <div>
                <div className="flex text-[#FF9F43] mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      star
                    </span>
                  ))}
                </div>
                <p className="text-sm text-[#263449] leading-relaxed italic">
                  "Their cold-pressed neem oil and bio-fungicides cleared our powdery mildew problem without any chemical burns on the crop. Genuine FCO approved products give real peace of mind."
                </p>
              </div>
              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-100">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 shrink-0">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDTNQZ4A8TohHYZPYDgyntaf83ruWxCWo1rcJMrj7jdqHRjiq4tQmZKjK-FfBJqyL2_EixaB2WyYX7-0a9vbUBnFdqyFV3eVNXhMKEu1TYkqUUbpBYdd3g8nLcX6UodsRs09hIgksujQ6I6IBy_bd9Q2WIYqQ-1PN1m9aSy4rOYa-S55xHMD2hUgkHxA-_9vTPK7TMq_wTnC3XYpgFLGg-50gGkp8QOn-aBqdrd1YXOPDQyCrAc9TEp"
                    alt="Sunita Devi"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="font-headline text-xs font-bold text-[#142B4A]">Sunita Devi</span>
                    <span className="material-symbols-outlined text-[14px] text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>
                      verified
                    </span>
                  </div>
                  <span className="text-[11px] text-[#5A6B82]">Polyhouse Floriculture • Nashik, MH</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7: FLOATING QUICK FARM CART BAR */}
        {cartCount > 0 && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed bottom-6 right-6 z-40"
          >
            <Link
              href="/cart"
              className="flex items-center gap-3 bg-[#142B4A] hover:bg-[#1B385D] text-white px-5 py-3 rounded-full shadow-2xl cursor-pointer transform hover:scale-105 active:scale-95 group transition-all border border-white/20"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[24px] text-[#FF9F43]">agriculture</span>
                <span className="font-headline text-xs font-bold">
                  {cartCount === 1 ? '1 Farm Input in Cart' : `${cartCount} Farm Inputs in Cart`}
                </span>
              </div>
              <span className="text-slate-400">|</span>
              <div className="flex items-center gap-2">
                <span className="font-price text-sm font-extrabold text-[#FF9F43]">₹{cartTotal}</span>
                <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                  east
                </span>
              </div>
            </Link>
          </motion.div>
        )}
      </main>

      {/* Product Details Modal */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSelectProduct={(p) => setSelectedProduct(p)}
        />
      )}

      <Footer />
    </div>
  );
}
