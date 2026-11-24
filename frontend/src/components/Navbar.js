'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useProducts } from '../contexts/ProductContext';
import { useLocationContext } from '../contexts/LocationContext';
import { useLanguage } from '../contexts/LanguageContext';
import LocationSelectorModal from './LocationSelectorModal';
import { ChevronDown } from 'lucide-react';
import { dropdownVariants, backdropVariants, EASE, buttonTap, iconTap } from '../utils/motion';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { cartCount, cartTotal, filters, setSearchQuery, wishlistCount, products, categories: contextCategories } = useProducts();
  const {
    location: userLocation,
    isServiceable,
    deliveryTime,
    setLocationModalOpen,
  } = useLocationContext();
  const { language, setLanguage, toggleLanguage, isHindi, t, translateCategory } = useLanguage();

  const router = useRouter();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.searchQuery || '');
  const [searchFocused, setSearchFocused] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    // Proactively prefetch common routes so user clicks navigate instantly
    const commonRoutes = ['/dashboard', '/cart', '/orders', '/wishlist', '/profile', '/login', '/about-us'];
    commonRoutes.forEach((route) => {
      try {
        router.prefetch(route);
      } catch {}
    });
  }, [router]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchSuggestions =
    searchFocused && searchInput.trim().length > 0
      ? products
          .filter((p) => {
            const q = searchInput.toLowerCase().trim();
            return (
              p.name?.toLowerCase().includes(q) ||
              p.category?.toLowerCase().includes(q) ||
              p.brand?.toLowerCase().includes(q)
            );
          })
          .slice(0, 5)
      : [];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setSearchFocused(false);
    if (pathname !== '/dashboard') {
      router.push('/dashboard');
    }
  };

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
    setSearchQuery(e.target.value);
  };

  const handleSuggestionSelect = (productName) => {
    setSearchInput(productName);
    setSearchQuery(productName);
    setSearchFocused(false);
    if (pathname !== '/dashboard') {
      router.push('/dashboard');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const defaultNavCategories = [
    { label: 'Vegetable Seeds', slug: 'vegetable-seeds' },
    { label: 'Grain & Crop Seeds', slug: 'field-crop-seeds' },
    { label: 'Organic Manure & Compost', slug: 'organic-fertilizers' },
    { label: 'NPK & Water Soluble', slug: 'chemical-npk' },
    { label: 'Micronutrients & Growth', slug: 'micronutrients' },
    { label: 'Bio-Pesticides & Fungicides', slug: 'bio-pesticides' },
    { label: 'Farm Tools & Sprayers', slug: 'sprayers-tools' },
    { label: 'Soil Health Kits', slug: 'soil-kits' },
  ];

  const categories = useMemo(() => {
    if (!contextCategories || contextCategories.length === 0) return defaultNavCategories;
    return contextCategories.map((cat) => {
      const name = typeof cat === 'string' ? cat : cat?.name;
      const matched = defaultNavCategories.find((d) => d.label.toLowerCase() === name.toLowerCase());
      if (matched) return matched;
      return {
        label: name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      };
    });
  }, [contextCategories]);

  const safeCartCount = mounted ? cartCount : 0;
  const safeCartTotal = mounted ? cartTotal : 0;
  const safeWishlistCount = mounted ? wishlistCount : 0;
  const isHomePage = pathname === '/';

  return (
    <>
      <header className="sticky top-0 left-0 right-0 z-50 bg-[#FFFFFF]/95 backdrop-blur-md shadow-[0_1px_8px_rgba(11,27,48,0.08)] border-b border-[#E2E8F0]">
        {/* Top Kisan Notice Bar - only displayed on home page */}
        {isHomePage && (
          <div className="bg-[#0B1B30] text-white text-[11px] font-semibold overflow-hidden">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 h-8 flex items-center justify-between min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 truncate">
                <span className="material-symbols-outlined text-[15px] sm:text-[16px] text-[#FF9F43] shrink-0">local_shipping</span>
                <span className="truncate">
                  <span className="hidden sm:inline">{isHindi ? 'एक्सप्रेस फ़ार्म डिलीवरी एवं प्रमाणित इनपुट्स | ' : 'Express Farm Delivery & Certified Inputs | '}</span>
                  {isHindi ? '₹999 से अधिक पर फ्लैट ₹200 की छूट | कोड: ' : 'Flat ₹200 OFF on orders > ₹999 | Code: '}
                  <span className="font-bold tracking-wider text-[#FF9F43] bg-white/10 px-1.5 py-0.5 rounded text-[10px]">
                    KISAN200
                  </span>
                </span>
              </div>
              <div className="hidden md:flex items-center gap-4 text-slate-200 shrink-0">
                <a href="tel:18002474627" className="hover:text-white transition-colors duration-150 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-[#FF9F43]">support_agent</span>
                  {t('nav.helpline', 'Kisan Helpline: 1800-AGRI-MART')}
                </a>
                <span className="opacity-30">|</span>
                <Link href="/about-us" className="hover:text-white transition-colors duration-150">
                  {t('nav.dealerInquiries', 'Dealer & FPO Inquiries')}
                </Link>
                <span className="opacity-30">|</span>
                <Link href="/dashboard?category=soil-kits" className="hover:text-white transition-colors duration-150">
                  {t('nav.soilLab', 'Soil Testing Lab')}
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Main Brand & Actions Header */}
        <div className="h-16 sm:h-20 max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 min-w-0 relative z-20">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Link href="/" prefetch={true} className="flex items-center gap-2 group">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#0B1B30] flex items-center justify-center text-[#FF9F43] shadow-sm transition-transform duration-150 ease-out group-hover:scale-[1.04]">
                <span className="material-symbols-outlined text-[20px] sm:text-[24px]">potted_plant</span>
              </div>
              <span className="font-headline text-lg sm:text-2xl text-[#0B1B30] tracking-tight font-extrabold flex items-center">
                Agri<span className="text-[#FF9F43]">Mart</span>
              </span>
            </Link>

            {/* Location Delivery Context Pill */}
            <motion.button
              type="button"
              whileTap={buttonTap}
              onClick={() => setLocationModalOpen(true)}
              className={`hidden xl:flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition-all duration-150 border text-left ${
                isServiceable
                  ? 'bg-[#EDF2F7] hover:bg-[#ECEEF1] border-[#CBD5E1]/50'
                  : 'bg-rose-50 hover:bg-rose-100 border-rose-200'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[20px] ${
                  isServiceable ? 'text-[#0B1B30]' : 'text-rose-600'
                }`}
              >
                pin_drop
              </span>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-[#5A6B82]">{t('nav.farmDispatchTo', 'Farm Dispatch to')}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isServiceable
                        ? 'bg-[#0B1B30] text-[#FF9F43]'
                        : 'bg-rose-600 text-white'
                    }`}
                  >
                    {isServiceable ? t('nav.ruralExpress', '⚡ Rural Express') : t('nav.outsideReach', 'Outside Reach')}
                  </span>
                </div>
                <span className="text-[13px] text-[#263449] font-bold max-w-[170px] truncate">
                  {userLocation?.name || userLocation?.area || 'Phagwara Krishi Hub - 144401'}
                </span>
              </div>
              <span className="material-symbols-outlined text-[#74777E] text-[16px]">expand_more</span>
            </motion.button>
          </div>

          {/* Global Live Search Bar with smooth Suggestions Dropdown */}
          <div ref={searchRef} className="relative flex-1 max-w-2xl lg:max-w-3xl px-2 hidden sm:block">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative flex items-center bg-[#EDF2F7] rounded-xl px-3.5 py-1.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0B1B30]/20 border border-[#CBD5E1]/60 focus-within:border-[#0B1B30]/40 transition-all duration-150">
                <span className="material-symbols-outlined text-[#74777E] mr-2 text-[20px] shrink-0">search</span>
                <input
                  type="text"
                  value={searchInput}
                  onFocus={() => setSearchFocused(true)}
                  onChange={handleSearchChange}
                  placeholder={t('nav.searchPlaceholder', 'Search hybrid seeds, NPK fertilizers, vermicompost, bio-nutrients...')}
                  className="w-full bg-transparent border-none outline-none text-sm text-[#263449] placeholder:text-[#74777E] py-1 pr-20 font-sans"
                />
                <AnimatePresence>
                  {searchInput && (
                    <motion.button
                      key="clear-search"
                      type="button"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      whileTap={iconTap}
                      transition={{ duration: 0.14 }}
                      onClick={() => {
                        setSearchInput('');
                        setSearchQuery('');
                      }}
                      className="text-slate-400 hover:text-slate-700 mr-2 shrink-0 transition-colors duration-150"
                      title="Clear search"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </motion.button>
                  )}
                </AnimatePresence>
                <motion.button
                  type="submit"
                  whileTap={buttonTap}
                  className="text-xs bg-[#0B1B30] text-white px-3.5 py-1.5 rounded-lg font-bold hover:bg-[#152B48] transition-colors duration-150 shrink-0 shadow-sm"
                >
                  {t('common.search', 'Search')}
                </motion.button>
              </div>
            </form>

            {/* Animated Search Suggestions */}
            <AnimatePresence>
              {searchSuggestions.length > 0 && (
                <motion.div
                  variants={dropdownVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="absolute left-2 right-2 mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200/80 py-1.5 z-50 overflow-hidden"
                >
                  {searchSuggestions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSuggestionSelect(item.name)}
                      className="w-full px-3.5 py-2 flex items-center justify-between gap-3 text-left hover:bg-[#FAF5EB] transition-colors duration-150"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="material-symbols-outlined text-[16px] text-slate-400 shrink-0">search</span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#0B1B30] truncate">{item.name}</p>
                          <p className="text-[10px] text-[#5A6B82] truncate">{item.category}</p>
                        </div>
                      </div>
                      <span className="font-price text-xs font-extrabold text-[#0B1B30] shrink-0">
                        ₹{item.price}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Navigation Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Language Switcher Button */}
            <motion.button
              type="button"
              whileTap={buttonTap}
              onClick={toggleLanguage}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl border border-[#CBD5E1]/60 hover:border-[#0B1B30]/30 bg-[#FAF5EB] hover:bg-[#F3ECE0] text-[#0B1B30] transition-all text-xs font-bold"
              title={isHindi ? 'Switch to English' : 'हिंदी में बदलें'}
              aria-label={isHindi ? 'Switch to English' : 'Switch to Hindi'}
            >
              <span className="material-symbols-outlined text-[16px] sm:text-[18px] text-[#FF9F43]">translate</span>
              <span className="font-extrabold text-[11px] sm:text-xs">{isHindi ? 'EN' : 'हिंदी'}</span>
            </motion.button>

            {/* Wishlist / Favorites */}
            <Link
              href="/wishlist"
              prefetch={true}
              className="flex relative items-center justify-center p-1.5 sm:p-2 text-[#5A6B82] hover:text-rose-500 transition-colors duration-150 rounded-xl hover:bg-slate-100/80 active:scale-[0.95]"
              title="My Wishlist"
              aria-label="My Wishlist"
            >
              <span
                className={`material-symbols-outlined text-[22px] sm:text-[24px] transition-colors duration-150 ${
                  safeWishlistCount > 0 ? 'text-rose-500' : ''
                }`}
                style={safeWishlistCount > 0 ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                favorite
              </span>
              <AnimatePresence>
                {safeWishlistCount > 0 && (
                  <motion.span
                    key={`wl-${safeWishlistCount}`}
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: [1, 1.2, 1], opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    transition={{ duration: 0.2, ease: EASE.out }}
                    className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] bg-rose-500 text-white text-[9px] sm:text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm"
                  >
                    {safeWishlistCount > 99 ? '99+' : safeWishlistCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {/* User Account / Profile */}
            <div ref={dropdownRef} className="relative">
              {user ? (
                <button
                  type="button"
                  aria-label="User Account Menu"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 cursor-pointer p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-100 transition-colors duration-150 active:scale-[0.97]"
                  aria-expanded={userDropdownOpen}
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0B1B30] flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs">
                    {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
                  </div>
                  <div className="hidden md:flex flex-col text-left min-w-0">
                    <span className="text-[10px] text-[#5A6B82] leading-none font-medium">Welcome</span>
                    <span className="text-xs text-[#263449] font-bold truncate max-w-[110px] lg:max-w-[130px]">
                      {user.displayName || user.email?.split('@')[0]}
                    </span>
                  </div>
                  <motion.span
                    animate={{ rotate: userDropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.18, ease: EASE.inOut }}
                    className="hidden sm:inline-flex items-center justify-center shrink-0 text-slate-500"
                  >
                    <ChevronDown className="w-4 h-4 stroke-[2.25]" />
                  </motion.span>
                </button>
              ) : (
                <Link
                  href="/login"
                  prefetch={true}
                  className="flex items-center gap-1 sm:gap-1.5 text-xs font-bold text-[#0B1B30] hover:bg-slate-100 p-1.5 sm:px-3 sm:py-2 rounded-xl sm:border sm:border-slate-200 transition-all duration-150 active:scale-[0.97]"
                  title="Sign In"
                >
                  <span className="material-symbols-outlined text-[20px] sm:text-[18px]">account_circle</span>
                  <span className="hidden sm:inline">{t('nav.login', 'Sign In')}</span>
                </Link>
              )}

              {/* Profile Dropdown */}
              <AnimatePresence>
                {userDropdownOpen && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-1.5 z-50 origin-top-right overflow-hidden ring-1 ring-black/5"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <Link
                      href="/profile"
                      prefetch={true}
                      className="block px-4 py-3 border-b border-slate-100 bg-[#FAF5EB]/60 hover:bg-[#FAF5EB] transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-900 truncate group-hover:text-[#16A34A] transition-colors">
                          {user?.displayName || 'AgriMart Customer'}
                        </p>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[11px]">verified</span>
                          Kisan
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{user?.email}</p>
                      <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                        <span>{t('profile.title', 'View Kisan Profile')}</span>
                        <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
                      </div>
                    </Link>
                    <div className="py-1">
                      <Link
                        href="/profile"
                        prefetch={true}
                        className="flex items-center justify-between px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#0B1B30] transition-colors duration-150"
                      >
                        <span className="flex items-center gap-2.5">
                          <span className="material-symbols-outlined text-[17px] text-[#16A34A]">badge</span>
                          <span>{t('profile.title', 'My Kisan Profile')}</span>
                        </span>
                        <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded">
                          ID
                        </span>
                      </Link>
                      <Link
                        href="/orders"
                        prefetch={true}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#0B1B30] transition-colors duration-150"
                      >
                        <span className="material-symbols-outlined text-[17px] text-[#5A6B82]">local_shipping</span>
                        <span>{t('nav.myOrders', 'My Orders')}</span>
                      </Link>
                      <Link
                        href="/wishlist"
                        prefetch={true}
                        className="flex items-center justify-between px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#0B1B30] transition-colors duration-150"
                      >
                        <span className="flex items-center gap-2.5">
                          <span className="material-symbols-outlined text-[17px] text-rose-500">favorite</span>
                          <span>My Wishlist</span>
                        </span>
                        {safeWishlistCount > 0 && (
                          <span className="text-[10px] bg-rose-50 text-rose-600 font-bold px-1.5 py-0.5 rounded-full">
                            {safeWishlistCount}
                          </span>
                        )}
                      </Link>
                      <Link
                        href="/about-us"
                        prefetch={true}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#0B1B30] transition-colors duration-150"
                      >
                        <span className="material-symbols-outlined text-[17px] text-[#5A6B82]">info</span>
                        <span>About AgriMart</span>
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin/panel"
                          prefetch={true}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50/60 hover:bg-indigo-100 transition-colors duration-150"
                        >
                          <span className="material-symbols-outlined text-[17px]">admin_panel_settings</span>
                          <span>Admin Dashboard</span>
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-slate-100 pt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 text-left transition-colors duration-150 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[17px] text-rose-500">logout</span>
                        <span>Log Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cart Pill */}
            <Link
              href="/cart"
              prefetch={true}
              className="flex items-center gap-1.5 sm:gap-2.5 bg-[#0B1B30] hover:bg-[#152B48] text-white px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl transition-all duration-150 active:scale-[0.97] shadow-[0_2px_8px_rgba(11,27,48,0.22)]"
            >
              <div className="relative flex items-center">
                <motion.span
                  key={`bag-${safeCartCount}`}
                  animate={safeCartCount > 0 ? { scale: [1, 1.12, 1] } : {}}
                  transition={{ duration: 0.2, ease: EASE.out }}
                  className="material-symbols-outlined text-[19px] sm:text-[20px] text-white"
                >
                  shopping_bag
                </motion.span>
                <AnimatePresence>
                  {safeCartCount > 0 && (
                    <motion.span
                      key={safeCartCount}
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: [1, 1.22, 1], opacity: 1 }}
                      exit={{ scale: 0.7, opacity: 0 }}
                      transition={{ duration: 0.22, ease: EASE.out }}
                      className="absolute -top-2 -right-2 bg-[#FF9F43] text-[#0B1B30] font-bold text-[9px] sm:text-[10px] min-w-[17px] h-[17px] sm:min-w-[20px] sm:h-[20px] rounded-full flex items-center justify-center px-0.5 shadow-sm"
                    >
                      {safeCartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-[10px] text-slate-300 leading-tight">
                  {safeCartCount === 1
                    ? (isHindi ? '1 उत्पाद' : '1 item')
                    : (isHindi ? `${safeCartCount} उत्पाद` : `${safeCartCount} items`)}
                </span>
                <span className="font-price text-xs text-white leading-tight font-extrabold">
                  ₹{safeCartTotal}
                </span>
              </div>
            </Link>

            {/* Mobile Menu Hamburger */}
            <motion.button
              type="button"
              whileTap={iconTap}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 sm:p-2 text-[#0B1B30] sm:hidden rounded-lg hover:bg-slate-100 transition-colors duration-150 shrink-0"
              aria-label="Toggle Navigation"
              aria-expanded={mobileMenuOpen}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={mobileMenuOpen ? 'close' : 'menu'}
                  initial={{ opacity: 0, rotate: -45, scale: 0.85 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 45, scale: 0.85 }}
                  transition={{ duration: 0.14, ease: EASE.out }}
                  className="material-symbols-outlined text-[22px] sm:text-[24px] block"
                >
                  {mobileMenuOpen ? 'close' : 'menu'}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile Search Bar (Only visible on small phones) */}
        <div className="sm:hidden px-4 pb-3">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center bg-[#EDF2F7] rounded-xl px-3 py-1.5 border border-[#CBD5E1]/60 focus-within:bg-white focus-within:border-[#0B1B30]/40 transition-all duration-150">
            <span className="material-symbols-outlined text-[#74777E] mr-2 text-[18px] shrink-0">search</span>
            <input
              type="text"
              value={searchInput}
              onChange={handleSearchChange}
              placeholder="Search hybrid seeds, NPK, fertilizers..."
              className="w-full bg-transparent border-none outline-none text-xs text-[#263449] pr-16"
            />
            <AnimatePresence>
              {searchInput && (
                <motion.button
                  key="mobile-clear"
                  type="button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.14 }}
                  onClick={() => {
                    setSearchInput('');
                    setSearchQuery('');
                  }}
                  className="text-slate-400 hover:text-slate-700 mr-1.5 shrink-0"
                  title="Clear search"
                >
                  <span className="material-symbols-outlined text-[15px]">close</span>
                </motion.button>
              )}
            </AnimatePresence>
            <motion.button
              type="submit"
              whileTap={buttonTap}
              className="text-[11px] bg-[#0B1B30] text-white px-2.5 py-1 rounded-md font-bold hover:bg-[#152B48] transition-colors duration-150 shrink-0 shadow-sm"
            >
              Search
            </motion.button>
          </form>
        </div>

        {/* Aisle Category Navigation Bar */}
        <div className="bg-[#EDF2F7] border-t border-b border-[#CBD5E1]/40 w-full relative z-10">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 h-10 sm:h-11 flex items-center justify-between min-w-0 w-full overflow-hidden">
            <nav className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar py-1 min-w-0 w-full">
              <Link
                href="/dashboard?category=all"
                prefetch={true}
                className="flex items-center gap-1 text-xs font-extrabold text-[#0B1B30] shrink-0 hover:text-[#E27B12] transition-colors duration-150"
              >
                <span className="material-symbols-outlined text-[17px]">grid_view</span>
                <span>{t('nav.allCategories', 'All Agri Products')}</span>
              </Link>
              <span className="text-slate-300">|</span>

              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/dashboard?category=${cat.slug}`}
                  prefetch={true}
                  className="text-xs font-semibold text-[#5A6B82] hover:text-[#0B1B30] whitespace-nowrap transition-colors duration-150 shrink-0"
                >
                  {translateCategory(cat.label)}
                </Link>
              ))}
            </nav>

            <div className="hidden xl:flex items-center gap-2 shrink-0 pl-4">
              <Link
                href="/dashboard?category=sowing-season-deals"
                prefetch={true}
                className="flex items-center gap-1 text-xs bg-[#FFE8D6] text-[#A74E00] px-3 py-1 rounded-full font-bold hover:bg-[#FFDCC2] transition-colors duration-150 active:scale-[0.97]"
              >
                <span>🌾</span> Sowing Season Offers
              </Link>
              <Link
                href="/dashboard?category=soil-nutrition-corner"
                prefetch={true}
                className="flex items-center gap-1 text-xs bg-[#E2E8F0] text-[#0B1B30] px-3 py-1 rounded-full font-bold hover:bg-slate-300 transition-colors duration-150 active:scale-[0.97]"
              >
                <span>🧪</span> Soil Nutrition Corner
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Drawer with Backdrop */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                variants={backdropVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-x-0 bottom-0 top-[148px] bg-black/30 backdrop-blur-[1px] sm:hidden z-40"
              />
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.24, ease: EASE.out }}
                className="relative z-50 sm:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-3 shadow-2xl max-h-[calc(100vh-140px)] overflow-y-auto no-scrollbar"
              >
                {/* User Account Bar in Mobile Drawer */}
                {user ? (
                  <div className="p-3 bg-[#FAF5EB] rounded-xl border border-[#E5DFD3] flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-[#0B1B30] text-[#FF9F43] font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                        {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#0B1B30] truncate">
                          {user.displayName || 'AgriMart Customer'}
                        </p>
                        <p className="text-[11px] text-[#5A6B82] truncate">{user.email}</p>
                      </div>
                    </div>
                    {isAdmin && (
                      <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full shrink-0">
                        Admin
                      </span>
                    )}
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 bg-[#0B1B30] text-white rounded-xl shadow-sm active:scale-[0.98] transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px] text-[#FF9F43]">account_circle</span>
                      <span className="text-xs font-bold">Sign In to AgriMart</span>
                    </div>
                    <span className="text-[11px] text-[#FF9F43] font-bold">Sign In &rarr;</span>
                  </Link>
                )}

                {/* Mobile Language Switcher */}
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#FF9F43]">translate</span>
                    <span className="text-xs font-bold text-[#0B1B30]">{t('nav.changeLanguage', 'Language / भाषा')}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setLanguage('en')}
                      className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                        !isHindi ? 'bg-[#0B1B30] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      EN
                    </button>
                    <button
                      type="button"
                      onClick={() => setLanguage('hi')}
                      className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                        isHindi ? 'bg-[#0B1B30] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      हिंदी
                    </button>
                  </div>
                </div>

                <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setLocationModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#0B1B30] bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg text-left transition-colors duration-150"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#E27B12]">location_on</span>
                    <span className="truncate max-w-[170px]">
                      {userLocation?.name || 'Set Delivery Area'}
                    </span>
                    <span className="material-symbols-outlined text-[14px]">expand_more</span>
                  </button>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isServiceable ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {isServiceable ? deliveryTime || '⚡ Express Delivery' : 'Outside 10km'}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#5A6B82] block px-1">{t('nav.allCategories', 'Agri Input Aisles')}</span>
                  {categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/dashboard?category=${cat.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-2 py-1.5 text-sm font-medium text-slate-800 hover:text-primary hover:bg-slate-50 rounded-lg transition-colors duration-150"
                    >
                      {translateCategory(cat.label)}
                    </Link>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between text-sm font-semibold text-slate-800 px-2 py-1.5 hover:text-primary hover:bg-slate-50 rounded-lg transition-colors duration-150"
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-[#16A34A]">badge</span>
                      <span>My Kisan Profile</span>
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      ID Card
                    </span>
                  </Link>
                  <Link
                    href="/wishlist"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between text-sm text-slate-700 px-2 py-1.5 hover:text-primary hover:bg-slate-50 rounded-lg transition-colors duration-150"
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-rose-500">favorite</span>
                      <span>My Wishlist</span>
                    </span>
                    {safeWishlistCount > 0 && (
                      <span className="text-[11px] bg-rose-50 text-rose-600 font-bold px-2 py-0.5 rounded-full">
                        {safeWishlistCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-sm text-slate-700 px-2 py-1.5 hover:text-primary hover:bg-slate-50 rounded-lg transition-colors duration-150"
                  >
                    <span className="material-symbols-outlined text-[18px]">package_2</span>
                    <span>Track My Orders</span>
                  </Link>
                  <Link
                    href="/about-us"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-sm text-slate-700 px-2 py-1.5 hover:text-primary hover:bg-slate-50 rounded-lg transition-colors duration-150"
                  >
                    <span className="material-symbols-outlined text-[18px]">info</span>
                    <span>About AgriMart</span>
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin/panel"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 text-sm font-bold text-indigo-700 px-2 py-1.5 hover:bg-indigo-50 rounded-lg"
                    >
                      <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                      <span>Admin Panel</span>
                    </Link>
                  )}
                </div>

                {/* Mobile Log Out Action */}
                {user && (
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs transition-colors duration-150 border border-rose-200/70 shadow-xs active:scale-[0.98] cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-rose-500">logout</span>
                        <span>Log Out of AgriMart</span>
                      </span>
                      <span className="text-[10px] text-rose-500 font-semibold">{user.email?.split('@')[0]}</span>
                    </button>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      {/* Location Selector Modal */}
      <LocationSelectorModal />
    </>
  );
}
