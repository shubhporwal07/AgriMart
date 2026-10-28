'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useProducts } from '../contexts/ProductContext';
import { useLocationContext } from '../contexts/LocationContext';
import LocationSelectorModal from './LocationSelectorModal';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { cartCount, cartTotal, filters, updateFilter, setSearchQuery } = useProducts();
  const {
    location: userLocation,
    isServiceable,
    deliveryTime,
    setLocationModalOpen,
  } = useLocationContext();

  const router = useRouter();
  const pathname = usePathname();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.searchQuery || '');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    if (pathname !== '/dashboard') {
      router.push('/dashboard');
    }
  };

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
    setSearchQuery(e.target.value);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const categories = [
    { label: 'Vegetable Seeds', slug: 'vegetable-seeds' },
    { label: 'Grain & Crop Seeds', slug: 'field-crop-seeds' },
    { label: 'Organic Manure & Compost', slug: 'organic-fertilizers' },
    { label: 'NPK & Water Soluble', slug: 'chemical-npk' },
    { label: 'Micronutrients & Growth', slug: 'micronutrients' },
    { label: 'Bio-Pesticides & Fungicides', slug: 'bio-pesticides' },
    { label: 'Farm Tools & Sprayers', slug: 'sprayers-tools' },
    { label: 'Soil Health Kits', slug: 'soil-kits' },
  ];

  return (
    <>
      <header className="sticky top-0 left-0 right-0 z-50 bg-[#FFFFFF]/95 backdrop-blur-md shadow-[0_1px_8px_rgba(20,43,74,0.06)] border-b border-[#E2E8F0]">
      {/* Top Kisan Notice Bar */}
      <div className="bg-[#142B4A] text-white text-[11px] font-semibold">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-[#FF9F43]">local_shipping</span>
            <span>
              Express Farm Delivery & Certified Inputs | Flat ₹200 OFF on orders above ₹999 | Code:{' '}
              <span className="font-bold tracking-wider text-[#FF9F43] bg-white/10 px-1.5 py-0.5 rounded">
                KISAN200
              </span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-slate-200">
            <a href="tel:18002474627" className="hover:text-white transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-[#FF9F43]">support_agent</span>
              Kisan Helpline: 1800-AGRI-MART
            </a>
            <span className="opacity-30">|</span>
            <Link href="/about-us" className="hover:text-white transition-colors">
              Dealer & FPO Inquiries
            </Link>
            <span className="opacity-30">|</span>
            <Link href="/dashboard?category=soil-kits" className="hover:text-white transition-colors">
              Soil Testing Lab
            </Link>
          </div>
        </div>
      </div>

      {/* Main Brand & Actions Header */}
      <div className="h-20 max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-4 shrink-0">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#142B4A] flex items-center justify-center text-[#FF9F43] shadow-sm">
              <span className="material-symbols-outlined text-[24px]">potted_plant</span>
            </div>
            <span className="font-headline text-xl sm:text-2xl text-[#142B4A] tracking-tight font-extrabold flex items-center">
              Agri<span className="text-[#FF9F43]">Mart</span>
            </span>
          </Link>

          {/* Location Delivery Context Pill */}
          <button
            onClick={() => setLocationModalOpen(true)}
            className={`hidden xl:flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition-all border text-left ${
              isServiceable
                ? 'bg-[#EDF2F7] hover:bg-[#ECEEF1] border-[#CBD5E1]/50'
                : 'bg-rose-50 hover:bg-rose-100 border-rose-200'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[20px] ${
                isServiceable ? 'text-[#142B4A]' : 'text-rose-600'
              }`}
            >
              pin_drop
            </span>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-[#5A6B82]">Farm Dispatch to</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isServiceable
                      ? 'bg-[#142B4A] text-[#FF9F43]'
                      : 'bg-rose-600 text-white'
                  }`}
                >
                  {isServiceable ? '⚡ Rural Express' : 'Outside Reach'}
                </span>
              </div>
              <span className="text-[13px] text-[#263449] font-bold max-w-[170px] truncate">
                {userLocation?.name || userLocation?.area || 'Phagwara Krishi Hub - 144401'}
              </span>
            </div>
            <span className="material-symbols-outlined text-[#74777E] text-[16px]">expand_more</span>
          </button>
        </div>

        {/* Global Live Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl lg:max-w-3xl px-2 hidden sm:block">
          <div className="relative flex items-center bg-[#EDF2F7] rounded-xl px-3.5 py-1.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#142B4A]/20 border border-[#CBD5E1]/60 transition-all">
            <span className="material-symbols-outlined text-[#74777E] mr-2 text-[20px] shrink-0">search</span>
            <input
              type="text"
              value={searchInput}
              onChange={handleSearchChange}
              placeholder="Search hybrid seeds, NPK fertilizers, vermicompost, bio-nutrients..."
              className="w-full bg-transparent border-none outline-none text-sm text-[#263449] placeholder:text-[#74777E] py-1 pr-20 font-sans"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setSearchQuery('');
                }}
                className="text-slate-400 hover:text-slate-700 mr-2 shrink-0"
                title="Clear search"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
            <button
              type="submit"
              className="text-xs bg-[#142B4A] text-white px-3.5 py-1.5 rounded-lg font-bold hover:bg-[#1B385D] transition-colors shrink-0 shadow-sm"
            >
              Search
            </button>
          </div>
        </form>

        {/* Right Navigation Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Wishlist / Favorites */}
          <Link
            href="/dashboard?category=all"
            className="hidden md:flex relative items-center justify-center p-2 text-[#5A6B82] hover:text-[#142B4A] transition-colors"
            title="Browse Catalog"
          >
            <span className="material-symbols-outlined text-[24px]">storefront</span>
          </Link>

          {/* User Account / Profile */}
          <div className="relative">
            {user ? (
              <div
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 cursor-pointer p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#142B4A] flex items-center justify-center text-white font-bold text-xs">
                  {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-[10px] text-[#5A6B82] leading-none">Welcome</span>
                  <span className="text-xs text-[#263449] font-bold flex items-center gap-0.5 truncate max-w-[90px]">
                    {user.displayName || user.email?.split('@')[0]}
                    <span className="material-symbols-outlined text-[14px]">expand_more</span>
                  </span>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 text-xs font-bold text-[#142B4A] hover:bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">account_circle</span>
                <span>Sign In</span>
              </Link>
            )}

            {/* Profile Dropdown */}
            <AnimatePresence>
              {userDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {user?.displayName || 'Gupta Mart Customer'}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  </div>
                  <Link
                    href="/orders"
                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                    <span>My Orders</span>
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin/panel"
                      className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50/60 hover:bg-indigo-100"
                    >
                      <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                      <span>Admin Dashboard</span>
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 text-left border-t border-slate-100"
                  >
                    <span className="material-symbols-outlined text-[16px]">logout</span>
                    <span>Logout</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Cart Pill */}
          <Link
            href="/cart"
            className="flex items-center gap-2.5 bg-[#142B4A] hover:bg-[#1B385D] text-white px-3.5 py-2 rounded-xl transition-all shadow-[0_2px_8px_rgba(20,43,74,0.18)]"
          >
            <div className="relative flex items-center">
              <span className="material-symbols-outlined text-[20px] text-white">shopping_bag</span>
              {cartCount > 0 && (
                <span className="absolute -top-2.5 -right-2.5 bg-[#FF9F43] text-[#142B4A] font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              )}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[10px] text-slate-300 leading-tight">
                {cartCount === 1 ? '1 item' : `${cartCount} items`}
              </span>
              <span className="font-price text-xs text-white leading-tight font-extrabold">
                ₹{cartTotal}
              </span>
            </div>
          </Link>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#142B4A] sm:hidden rounded-lg hover:bg-slate-100"
            aria-label="Toggle Navigation"
          >
            <span className="material-symbols-outlined text-[24px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Search Bar (Only visible on small phones) */}
      <div className="sm:hidden px-4 pb-3">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center bg-[#EDF2F7] rounded-xl px-3 py-1.5 border border-[#CBD5E1]/60">
          <span className="material-symbols-outlined text-[#74777E] mr-2 text-[18px] shrink-0">search</span>
          <input
            type="text"
            value={searchInput}
            onChange={handleSearchChange}
            placeholder="Search hybrid seeds, NPK, fertilizers..."
            className="w-full bg-transparent border-none outline-none text-xs text-[#263449] pr-16"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                setSearchQuery('');
              }}
              className="text-slate-400 hover:text-slate-700 mr-1.5 shrink-0"
              title="Clear search"
            >
              <span className="material-symbols-outlined text-[15px]">close</span>
            </button>
          )}
          <button
            type="submit"
            className="text-[11px] bg-[#142B4A] text-white px-2.5 py-1 rounded-md font-bold hover:bg-[#1B385D] transition-colors shrink-0 shadow-sm"
          >
            Search
          </button>
        </form>
      </div>

      {/* Aisle Category Navigation Bar */}
      <div className="bg-[#EDF2F7] border-t border-b border-[#CBD5E1]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-11 flex items-center justify-between">
          <nav className="flex items-center gap-4 overflow-x-auto no-scrollbar py-1">
            <Link
              href="/dashboard?category=all"
              className="flex items-center gap-1 text-xs font-extrabold text-[#142B4A] shrink-0 hover:text-[#E27B12] transition-colors"
            >
              <span className="material-symbols-outlined text-[17px]">grid_view</span>
              <span>All Agri Products</span>
            </Link>
            <span className="text-slate-300">|</span>

            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/dashboard?category=${cat.slug}`}
                className="text-xs font-semibold text-[#5A6B82] hover:text-[#142B4A] whitespace-nowrap transition-colors"
              >
                {cat.label}
              </Link>
            ))}
          </nav>

          <div className="hidden xl:flex items-center gap-2 shrink-0 pl-4">
            <Link
              href="/dashboard?category=sowing-season-deals"
              className="flex items-center gap-1 text-xs bg-[#FFE8D6] text-[#A74E00] px-3 py-1 rounded-full font-bold hover:bg-[#FFDCC2] transition-colors"
            >
              <span>🌾</span> Sowing Season Offers
            </Link>
            <Link
              href="/dashboard?category=soil-nutrition-corner"
              className="flex items-center gap-1 text-xs bg-[#E2E8F0] text-[#142B4A] px-3 py-1 rounded-full font-bold hover:bg-slate-300 transition-colors"
            >
              <span>🧪</span> Soil Nutrition Corner
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="sm:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-2 overflow-hidden shadow-lg"
          >
            <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setLocationModalOpen(true);
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-[#142B4A] bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg text-left"
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
                {isServiceable ? deliveryTime || '⚡ 10 Mins' : 'Outside 10km'}
              </span>
            </div>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/dashboard?category=${cat.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-sm font-medium text-slate-800 hover:text-primary"
              >
                {cat.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <Link
                href="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-sm text-slate-700 py-1"
              >
                <span className="material-symbols-outlined text-[18px]">package_2</span>
                <span>Track My Orders</span>
              </Link>
              <Link
                href="/about-us"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-sm text-slate-700 py-1"
              >
                <span className="material-symbols-outlined text-[18px]">info</span>
                <span>About AgriMart</span>
              </Link>
              {isAdmin && (
                <Link
                  href="/admin/panel"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-sm font-bold text-indigo-700 py-1"
                >
                  <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                  <span>Admin Panel</span>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>

    {/* Location Selector Modal */}
    <LocationSelectorModal />
    </>
  );
}
