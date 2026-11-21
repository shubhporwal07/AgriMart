'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import UnserviceableNotice from '../components/UnserviceableNotice';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import ProductDetailsModal from '../components/ProductDetailsModal';
import { useProducts } from '../contexts/ProductContext';
import { floatingBarVariants, sectionRevealProps, buttonTap, iconTap } from '../utils/motion';
import { realtimeDb } from '../config/firebase';
import { ref as rtdbRef, onValue } from 'firebase/database';

export default function LandingPage() {
  const router = useRouter();
  const {
    products,
    cartCount,
    cartTotal,
    addToCart,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    homeShowcase,
  } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [verifiedReviews, setVerifiedReviews] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Subscribe to real verified reviews from Firebase Realtime Database
  useEffect(() => {
    try {
      const revRef = rtdbRef(realtimeDb, 'allReviews');
      const unsub = onValue(revRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const list = Object.values(data).filter((r) => r && r.rating);
          list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          setVerifiedReviews(list);
        } else {
          setVerifiedReviews([]);
        }
      });
      return () => unsub();
    } catch {
      setVerifiedReviews([]);
    }
  }, []);

  const avgRating = useMemo(() => {
    if (verifiedReviews.length === 0) return 0;
    const sum = verifiedReviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
    return (sum / verifiedReviews.length).toFixed(1);
  }, [verifiedReviews]);

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

  // Dynamic Hero Deal Products (strictly 2 slots configured by admin via Home Showcase Manager)
  // Note: Before client hydration completes, always use canonical defaults so server-rendered HTML and client initial DOM match 100%
  const heroDealProducts = useMemo(() => {
    const defaultIds = ['agri-kisan-starter-kit', 'agri-soil-booster-combo'];
    const ids = (mounted && homeShowcase?.heroDeals) || defaultIds;
    const matched = ids.map((id) => products.find((p) => p.id === id)).filter(Boolean);
    if (matched.length >= 2) return matched.slice(0, 2);
    // Fallback if some product not found
    const fallbackKits = products.filter(
      (p) => p.id === 'agri-kisan-starter-kit' || p.id === 'agri-soil-booster-combo'
    );
    const combined = [...matched, ...fallbackKits.filter((f) => !matched.some((m) => m.id === f.id)), ...products];
    return combined.slice(0, 2);
  }, [mounted, homeShowcase?.heroDeals, products]);

  // Flash deals products (curated by admin or first 6 items)
  const flashProducts = useMemo(() => {
    if (mounted && Array.isArray(homeShowcase?.flashDeals) && homeShowcase.flashDeals.length > 0) {
      const matched = homeShowcase.flashDeals.map((id) => products.find((p) => p.id === id)).filter(Boolean);
      if (matched.length > 0) return matched.slice(0, 6);
    }
    return products.slice(0, 6);
  }, [mounted, homeShowcase?.flashDeals, products]);

  // Soil Nutrition Corner products (organic and soil items)
  const soilProducts = products
    .filter((p) => p.category === 'Organic Manure & Compost' || p.category === 'Soil Health Kits' || p.isOrganic)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-[#FAF5EB] text-[#263449] font-sans antialiased">
      <Navbar />

      {/* Serviceability / hub notice */}
      <UnserviceableNotice />

      <main className="w-full">
        {/* SECTION 1: HERO SHOWCASE */}
        <section className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 w-full overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
            {/* Left Hero Banner (8 Cols) */}
            <div className="lg:col-span-8 relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#081526] via-[#0B1B30] to-[#132A4A] shadow-xl flex flex-col justify-between p-4 sm:p-10 text-white min-h-[420px] sm:min-h-[460px] isolate">
              {/* Background Ambient Image with Gradient Scrim */}
              <div
                className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-30 transform hover:scale-105 transition-transform duration-700 ease-out"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80')",
                }}
              />
              <div className="absolute -top-10 right-0 w-48 h-48 sm:w-80 sm:h-80 rounded-full bg-blue-400/15 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-[#FF9F43]/15 blur-2xl pointer-events-none" />

              {/* Upper Tag & Live Indicator */}
              <div className="relative z-10 flex items-center justify-between gap-2 flex-wrap">
                <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-md px-2.5 sm:px-3.5 py-1 rounded-full text-slate-100 border border-white/10 text-[10px] sm:text-xs max-w-full">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#FF9F43] animate-ping shrink-0" />
                  <span className="uppercase tracking-wider font-bold truncate">Kharif & Rabi Seed Batches In Stock</span>
                </div>
                <span className="font-mono text-xs text-slate-300 hidden sm:inline-block">
                  CERTIFIED_SEED_ACT_1966 • FCO_COMPLIANT
                </span>
              </div>

              {/* Center Typography */}
              <div className="relative z-10 my-4 sm:my-6 max-w-xl">
                <p className="text-[11px] sm:text-xs uppercase tracking-widest text-[#FF9F43] font-extrabold mb-1.5 sm:mb-2">
                  High-Yield Seeds, Certified Fertilizers & Farm Inputs
                </p>
                <h1 className="font-headline text-2xl sm:text-4xl lg:text-5xl text-white leading-tight font-extrabold tracking-tight">
                  Certified Seeds & High-Grade Fertilizers, Delivered Direct to Your Farm
                </h1>
                <p className="text-xs sm:text-base text-slate-200 mt-2 sm:mt-3 leading-relaxed max-w-lg">
                  Government-certified hybrid seeds, organic compost, NPK blends, and soil nutrition solutions trusted by 250,000+ farmers across India.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-5 sm:mt-6 w-full">
                  <Link
                    href="/dashboard?category=vegetable-seeds"
                    prefetch={true}
                    className="bg-[#FF9F43] text-[#142B4A] hover:bg-[#ffb067] text-xs sm:text-sm px-5 sm:px-6 py-2.5 sm:py-3 rounded-full transition-all flex items-center justify-center gap-1.5 shadow-lg font-headline font-extrabold transform active:scale-95 group text-center"
                  >
                    <span>Shop High-Yield Seeds</span>
                    <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </Link>
                  <a
                    href="#flash-deals"
                    className="inline-flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white text-xs sm:text-sm px-4 sm:px-5 py-2.5 sm:py-3 rounded-full transition-all border border-white/15 font-semibold text-center"
                  >
                    <span>Explore Fertilizers</span>
                    <span className="bg-[#FF9F43] text-[#142B4A] text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0">
                      Subsidized & Bulk
                    </span>
                  </a>
                </div>
              </div>

              {/* Trust Badges Bar */}
              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-white/15 text-xs">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#FF9F43] text-[18px] sm:text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    verified
                  </span>
                  <span className="text-slate-100 font-semibold">95%+ Certified Germination</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#FF9F43] text-[18px] sm:text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    local_shipping
                  </span>
                  <span className="text-slate-100 font-semibold">Direct Doorstep Farm Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#FF9F43] text-[18px] sm:text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    support_agent
                  </span>
                  <span className="text-slate-100 font-semibold">Free Agronomist Advisory</span>
                </div>
              </div>
            </div>

            {/* Right Promotional Deal Cards (2 Configurable Slots Managed in Admin Panel) */}
            <div className="lg:col-span-4 flex flex-col justify-between gap-4">
              {heroDealProducts.slice(0, 2).map((item, index) => {
                const isFirst = index === 0;
                const badgeText = item.dietaryTags?.[0] || (isFirst ? '30% SEASON DISCOUNT' : 'SAVE ₹220');
                const subTag = item.dietaryTags?.[1] || (isFirst ? 'High Demand' : '100% Organic');
                const bgClass = isFirst ? 'bg-white' : 'bg-[#EDF2F7]';
                const displayImg =
                  (item.imageUrl && !item.imageUrl.includes('lh3.googleusercontent.com') && item.imageUrl) ||
                  (Array.isArray(item.imageDatas) && item.imageDatas[0] && !item.imageDatas[0].includes('lh3.googleusercontent.com') && item.imageDatas[0]) ||
                  (isFirst ? '/images/products/hybrid-tomato-seeds.png' : '/images/products/vermicompost-25kg.png');

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedProduct(item)}
                    className={`relative rounded-3xl overflow-hidden ${bgClass} shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all p-5 flex-1 flex flex-col justify-between group border border-[#CBD5E1]/40 cursor-pointer`}
                    title={`Click to view details for ${item.name}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span
                        suppressHydrationWarning
                        className={`${isFirst ? 'bg-[#FF9F43] text-[#142B4A]' : 'bg-[#142B4A] text-white'} font-headline text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider font-extrabold shadow-sm`}
                      >
                        {badgeText}
                      </span>
                      <span
                        suppressHydrationWarning
                        className="font-mono text-xs text-[#A74E00] font-bold flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[15px]">{isFirst ? 'local_fire_department' : 'eco'}</span>
                        {subTag}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 my-auto">
                      <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-white shrink-0 border border-slate-200/60 shadow-xs">
                        <img
                          src={displayImg}
                          alt={item.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = isFirst ? '/images/products/hybrid-tomato-seeds.png' : '/images/products/vermicompost-25kg.png';
                          }}
                        />
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span
                          suppressHydrationWarning
                          className="text-[11px] font-bold text-[#5A6B82] uppercase tracking-wider truncate"
                        >
                          {item.category || (isFirst ? 'All-in-One Sowing Kit' : 'Soil Regeneration')}
                        </span>
                        <h3
                          suppressHydrationWarning
                          className="font-headline text-base font-bold text-[#142B4A] leading-tight mt-0.5 line-clamp-2 group-hover:text-[#E27B12] transition-colors"
                        >
                          {item.name}
                        </h3>
                        <p
                          suppressHydrationWarning
                          className="text-xs text-[#5A6B82] mt-1 line-clamp-1"
                        >
                          {item.unit || item.description || 'Certified farm input'}
                        </p>
                        <div className="flex items-baseline gap-2 mt-2">
                          <span
                            suppressHydrationWarning
                            className="font-price text-lg font-extrabold text-[#142B4A]"
                          >
                            ₹{item.price}
                          </span>
                          {item.mrp && item.mrp > item.price && (
                            <span
                              suppressHydrationWarning
                              className="text-xs text-slate-400 line-through"
                            >
                              ₹{item.mrp}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <motion.button
                        type="button"
                        whileTap={iconTap}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isInWishlist(item.id)) {
                            removeFromWishlist(item.id);
                          } else {
                            addToWishlist(item);
                          }
                        }}
                        className={`p-2 rounded-xl border transition-colors duration-150 shrink-0 ${
                          isInWishlist(item.id)
                            ? 'bg-rose-50 border-rose-300 text-rose-500'
                            : 'bg-white border-slate-200 text-slate-400 hover:text-rose-500'
                        }`}
                        title={isInWishlist(item.id) ? 'Remove from Wishlist' : 'Save to Wishlist'}
                        aria-label="Wishlist item"
                      >
                        <span
                          className="material-symbols-outlined text-[18px] block"
                          style={isInWishlist(item.id) ? { fontVariationSettings: "'FILL' 1" } : {}}
                        >
                          favorite
                        </span>
                      </motion.button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(item, 1);
                        }}
                        className={`flex-1 ${isFirst ? 'bg-[#142B4A] hover:bg-[#1B385D] text-white' : 'bg-white hover:bg-[#142B4A] hover:text-white text-[#142B4A] border border-[#142B4A]/30'} text-xs py-2.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm`}
                      >
                        <span className="material-symbols-outlined text-[17px]">add_shopping_cart</span>
                        <span>Quick Order {isFirst ? 'Kit' : 'Combo'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* SECTION 2: EXPLORE BY CATEGORY */}
        <motion.section {...sectionRevealProps} className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 w-full overflow-hidden">
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
                className={`group flex flex-col items-center text-center p-4 rounded-2xl ${tile.bg} hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 ease-out border border-[#CBD5E1]/30`}
              >
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-2 shadow-inner group-hover:scale-105 transition-transform duration-200 ease-out">
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
        </motion.section>

        {/* SECTION 3: TODAY'S KISAN SOWING DEALS */}
        <motion.section {...sectionRevealProps} id="flash-deals" className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 w-full overflow-hidden">
          {/* Header with Countdown */}
          <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-[#CBD5E1]/40">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#FFE8D6] flex items-center justify-center text-[#E27B12] shrink-0">
                <span className="material-symbols-outlined text-[24px] sm:text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  timer
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-headline text-lg sm:text-2xl font-extrabold text-[#142B4A] truncate">
                    Today's Kisan Sowing Deals
                  </h2>
                  <span className="bg-[#FF9F43] text-[#142B4A] text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse shrink-0">
                    Live
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-[#5A6B82] mt-0.5 truncate">Subsidized direct-to-farm inputs with batch lab reports</p>
              </div>
            </div>

            {/* Countdown Display */}
            <div className="flex items-center gap-2 sm:gap-4 w-full md:w-auto justify-between md:justify-end flex-wrap">
              <div className="flex items-center gap-1 sm:gap-1.5 font-mono text-center">
                <span className="text-[10px] sm:text-xs text-[#5A6B82] uppercase mr-1 font-sans font-semibold">
                  Closes In:
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
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4">
            {flashProducts.map((p, idx) => (
              <ProductCard
                key={p.id}
                product={p}
                index={idx}
                onViewDetails={(item) => setSelectedProduct(item)}
              />
            ))}
          </div>
        </motion.section>

        {/* SECTION 4: CURATED SOIL NUTRITION CORNER */}
        <motion.section {...sectionRevealProps} className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 w-full overflow-hidden">
          <div className="rounded-3xl bg-gradient-to-br from-[#0B1B30] via-[#081526] to-[#050E1A] text-white p-4 sm:p-10 relative overflow-hidden shadow-2xl border border-white/10 isolate">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#94B3FD_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="absolute right-0 bottom-0 w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-[#FF9F43]/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6 pb-6 border-b border-white/15">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-1.5 bg-[#FF9F43] text-[#142B4A] px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-2 shadow-sm">
                  <span>⭐</span> Government Tested Soil Nutrition Lab
                </div>
                <h2 className="font-headline text-xl sm:text-3xl text-white font-extrabold tracking-tight">
                  Certified Organic & Government Tested Soil Nutrition
                </h2>
                <p className="text-xs sm:text-sm text-slate-200 mt-2 leading-relaxed">
                  Direct access to bio-fertilizers, mycorrhizal root inoculants, steamed bone meal, and certified hybrid field seeds with 100% verified germination rates and batch purity reports.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl flex items-center gap-3 border border-white/15 shrink-0">
                <span className="material-symbols-outlined text-[#FF9F43] text-[28px] sm:text-[32px]">biotech</span>
                <div>
                  <span className="text-[10px] text-[#FF9F43] uppercase tracking-wider block font-bold">
                    FCO Approved
                  </span>
                  <span className="text-xs text-white font-bold">Zero Adulteration Guarantee</span>
                </div>
              </div>
            </div>

            {/* 4 Hero Soil Nutrition Items */}
            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 pt-6">
              {soilProducts.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedProduct(item)}
                  className="bg-white text-[#263449] rounded-xl sm:rounded-2xl p-2.5 sm:p-4 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 ease-out flex flex-col justify-between group border border-[#CBD5E1]/30 cursor-pointer min-w-0"
                >
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#EDF2F7] mb-3">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300 ease-out"
                    />
                    <span className="absolute top-2 left-2 bg-[#142B4A] text-white text-[9px] px-2 py-0.5 rounded font-bold uppercase">
                      FCO Certified
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#5A6B82]">{item.unit}</span>
                    <h4 className="font-headline text-sm font-bold text-[#142B4A] group-hover:text-[#E27B12] transition-colors duration-150 mt-0.5 line-clamp-1">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-[#74777E] line-clamp-1">{item.description}</p>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-2 border-t border-slate-100">
                    <span className="font-price text-base font-extrabold text-[#142B4A]">
                      ₹{item.price}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <motion.button
                        type="button"
                        whileTap={iconTap}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isInWishlist(item.id)) {
                            removeFromWishlist(item.id);
                          } else {
                            addToWishlist(item);
                          }
                        }}
                        className={`p-1.5 rounded-xl border transition-colors duration-150 ${
                          isInWishlist(item.id)
                            ? 'bg-rose-50 border-rose-300 text-rose-500'
                            : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-rose-500'
                        }`}
                        title={isInWishlist(item.id) ? 'Remove from Wishlist' : 'Save to Wishlist'}
                        aria-label={isInWishlist(item.id) ? 'Remove from Wishlist' : 'Save to Wishlist'}
                      >
                        <span
                          className="material-symbols-outlined text-[18px] block"
                          style={isInWishlist(item.id) ? { fontVariationSettings: "'FILL' 1" } : {}}
                        >
                          favorite
                        </span>
                      </motion.button>
                      <motion.button
                        type="button"
                        whileTap={iconTap}
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(item, 1);
                        }}
                        className="bg-[#142B4A] hover:bg-[#1B385D] text-white p-1.5 rounded-xl transition-colors duration-150 shadow-sm"
                        title="Add to Farm Cart"
                        aria-label="Add to Farm Cart"
                      >
                        <span className="material-symbols-outlined text-[18px] block">add</span>
                      </motion.button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* SECTION 5: WHY OVER 250,000+ FARMERS TRUST AGRIMART */}
        <motion.section {...sectionRevealProps} className="max-w-7xl mx-auto px-3 sm:px-6 py-8 sm:py-10 w-full overflow-hidden">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
            <span className="text-[11px] sm:text-xs uppercase tracking-widest text-[#142B4A] font-extrabold">
              Uncompromising Quality & Trust
            </span>
            <h2 className="font-headline text-xl sm:text-3xl text-[#142B4A] font-extrabold mt-1">
              Why Over 250,000+ Farmers Trust AgriMart
            </h2>
            <p className="text-xs sm:text-sm text-[#5A6B82] mt-2">
              Eliminating fake seeds, spurious chemicals, and predatory mandi middle-commissions with certified farm inputs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
        </motion.section>

        {/* SECTION 6: VERIFIED FARMER REVIEWS OR AUTHENTIC PROMISE */}
        <motion.section {...sectionRevealProps} className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 w-full overflow-hidden">
          {verifiedReviews.length > 0 ? (
            <div>
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-2">
                <div>
                  <span className="text-xs font-bold text-[#142B4A] uppercase tracking-wider">
                    Field Verified Results
                  </span>
                  <h2 className="font-headline text-2xl sm:text-3xl font-extrabold text-[#142B4A] mt-1">
                    Verified Kisan Reviews
                  </h2>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-[#CBD5E1]/40">
                  <div className="flex text-[#FF9F43]">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span
                        key={s}
                        className="material-symbols-outlined text-[18px]"
                        style={{ fontVariationSettings: s <= Math.round(Number(avgRating)) ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        star
                      </span>
                    ))}
                  </div>
                  <span className="font-price text-sm text-[#142B4A] font-extrabold ml-1">{avgRating} / 5</span>
                  <span className="text-xs text-[#74777E]">from {verifiedReviews.length} verified review{verifiedReviews.length !== 1 ? 's' : ''}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {verifiedReviews.slice(0, 6).map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-white rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow border border-[#CBD5E1]/40"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <span
                              key={s}
                              className="material-symbols-outlined text-[16px]"
                              style={{ fontVariationSettings: s <= (rev.rating || 5) ? "'FILL' 1" : "'FILL' 0" }}
                            >
                              star
                            </span>
                          ))}
                        </div>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px] text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>
                            verified
                          </span>
                          Delivered
                        </span>
                      </div>
                      {rev.title && (
                        <p className="text-xs font-bold text-slate-900 mb-1 leading-snug">
                          {rev.title}
                        </p>
                      )}
                      <p className="text-xs text-[#263449] leading-relaxed italic">
                        &ldquo;{rev.comment}&rdquo;
                      </p>
                      {rev.productName && (
                        <p className="text-[11px] font-semibold text-slate-500 mt-2 truncate">
                          Item: <strong className="text-slate-800">{rev.productName}</strong>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-5 pt-3.5 border-t border-slate-100">
                      <div className="w-9 h-9 rounded-full bg-[#0B1B30] text-[#FF9F43] font-black text-xs flex items-center justify-center shrink-0">
                        {(rev.authorName || 'K')[0].toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-headline text-xs font-bold text-[#142B4A] truncate">
                          {rev.authorName || 'Verified Farmer'}
                        </span>
                        <span className="text-[11px] text-[#5A6B82] truncate">
                          {rev.location || 'AgriMart Kisan Hub'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white/90 border border-slate-200/90 rounded-3xl p-8 sm:p-10 text-center max-w-2xl mx-auto shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#FF9F43] flex items-center justify-center mx-auto mb-3 shadow-xs">
                <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified
                </span>
              </div>
              <h3 className="font-headline text-lg sm:text-xl font-bold text-slate-900">
                100% Genuine, Post-Delivery Reviews
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed max-w-lg mx-auto">
                AgriMart only features authentic feedback submitted by farmers after verified farm-gate order delivery. No fake or auto-generated testimonials.
              </p>
              <div className="mt-5 flex items-center justify-center gap-3">
                <Link
                  href="/orders"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B1B30] hover:bg-[#152B48] text-white text-xs font-bold transition-all shadow-xs"
                >
                  <span>Rate Your Delivered Orders</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          )}
        </motion.section>

        {/* SECTION 7: FLOATING QUICK FARM CART BAR */}
        <AnimatePresence>
          {cartCount > 0 && (
            <motion.div
              key="landing-floating-cart"
              variants={floatingBarVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 max-w-[calc(100vw-2rem)] z-40"
            >
              <Link
                href="/cart"
                className="flex items-center gap-3 bg-[#0B1B30] hover:bg-[#152B48] text-white px-5 py-3 rounded-full shadow-2xl cursor-pointer transform hover:scale-[1.03] active:scale-[0.97] group transition-all duration-150 border border-white/20"
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
                  <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform duration-150">
                    east
                  </span>
                </div>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Product Details Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductDetailsModal
            key={selectedProduct.id}
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onSelectProduct={(p) => setSelectedProduct(p)}
          />
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
