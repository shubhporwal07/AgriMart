'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts } from '../contexts/ProductContext';
import { useAuth } from '../contexts/AuthContext';
import { useLocationContext } from '../contexts/LocationContext';
import Navbar from '../components/Navbar';
import UnserviceableNotice from '../components/UnserviceableNotice';
import SidebarFilters from '../components/SidebarFilters';
import ProductGrid from '../components/ProductGrid';
import ProductDetailsModal from '../components/ProductDetailsModal';
import AdminAddProductModal from '../components/AdminAddProductModal';
import Footer from '../components/Footer';

export default function DashboardPage() {
  const { isAdmin } = useAuth();
  const searchParams = useSearchParams();
  const {
    location: userLocation,
    isServiceable,
    deliveryTime,
    setLocationModalOpen,
  } = useLocationContext();

  const {
    applyNavCategorySlug,
    cartCount,
    cartTotal,
    filteredProducts,
    filters,
    updateFilter,
    deleteProduct,
  } = useProducts();

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    if (!searchParams.has('category')) return;
    applyNavCategorySlug(searchParams.get('category') || 'all');
  }, [searchParams, applyNavCategorySlug]);

  useEffect(() => {
    document.body.style.overflow = filtersOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [filtersOpen]);

  const handleEditProduct = (p) => {
    setEditingProduct(p);
    setShowAddModal(true);
  };

  const handleDeleteProduct = async (id) => {
    try {
      await deleteProduct(id);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#263449] font-sans antialiased">
      <Navbar />

      {/* Blinkit-style unserviceable banner when user location is > 10 km from Phagwara hub */}
      <UnserviceableNotice />

      <main className="w-full">
        {/* KISAN200 Coupon Banner */}
        {!bannerDismissed && (
          <div className="w-full bg-[#FFE8D6]/80 border-b border-[#FFDCC2]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#E27B12] text-white shadow-sm">
                  <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    spa
                  </span>
                </span>
                <span className="text-xs text-[#263449]">
                  <strong className="font-extrabold text-[#A74E00]">KISAN200 Active:</strong> Extra ₹200 subsidy savings on certified seeds and organic bio-fertilizers above ₹999
                </span>
                <span className="hidden sm:inline-flex items-center text-[#5A6B82] text-xs">
                  • Direct dispatch from accredited research centers
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] bg-white px-2.5 py-0.5 rounded shadow-sm text-[#A74E00] font-bold tracking-wider border border-[#FFDCC2]">
                  KISAN200
                </span>
                <button
                  onClick={() => setBannerDismissed(true)}
                  className="text-xs text-[#142B4A] hover:text-[#E27B12] font-bold underline transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Breadcrumbs & Header Summary */}
        <section className="w-full bg-white shadow-sm border-b border-[#CBD5E1]/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-xs text-[#5A6B82] mb-3 font-semibold">
              <Link href="/" className="hover:text-[#142B4A] transition-colors flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">home</span>
                <span>Home</span>
              </Link>
              <span className="material-symbols-outlined text-[14px] text-slate-400">chevron_right</span>
              <span className="hover:text-[#142B4A] transition-colors">Agri Inputs</span>
              <span className="material-symbols-outlined text-[14px] text-slate-400">chevron_right</span>
              <span className="font-bold text-[#142B4A]">
                {filters.category?.length > 0 ? filters.category.join(', ') : 'Seeds & Fertilizers'}
              </span>
            </nav>

            {/* Title & Live Meta Info */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="font-headline text-2xl sm:text-3xl text-[#142B4A] font-extrabold tracking-tight">
                    {filters.category?.length > 0 ? filters.category[0] : 'Seeds, Plant Nutrients & Fertilizers'}
                  </h1>
                  <span className="bg-[#D5E3FF] text-[#142B4A] text-xs px-2.5 py-1 rounded-full font-bold">
                    {filteredProducts.length} Certified Inputs
                  </span>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setEditingProduct(null);
                        setShowAddModal(true);
                      }}
                      className="bg-[#142B4A] text-white text-xs px-3 py-1 rounded-full font-bold hover:bg-[#1B385D] flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                      <span>Add Agri Product</span>
                    </button>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-[#5A6B82] mt-1 max-w-2xl leading-relaxed">
                  Certified high-yield hybrid seeds, pure organic vermicompost, water-soluble NPK fertilizers, bio-fungicides, and foliar crop stimulants shipped straight to your farmland.
                </p>
              </div>

              {/* Delivery Context Badge */}
              <button
                type="button"
                onClick={() => setLocationModalOpen(true)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl shadow-sm self-start lg:self-auto border text-left transition-all hover:scale-[1.01] ${
                  isServiceable
                    ? 'bg-[#EDF2F7] hover:bg-[#ECEEF1] border-[#CBD5E1]/40'
                    : 'bg-rose-50 hover:bg-rose-100 border-rose-200'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isServiceable ? 'bg-[#142B4A] text-[#FF9F43]' : 'bg-rose-600 text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isServiceable ? 'local_shipping' : 'location_off'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] text-[#5A6B82] leading-tight font-semibold">
                    {isServiceable ? 'Farm Delivery to' : 'Selected Hub'}
                  </span>
                  <span
                    className={`text-xs font-extrabold flex items-center gap-1 ${
                      isServiceable ? 'text-[#142B4A]' : 'text-rose-700'
                    }`}
                  >
                    {userLocation?.name || 'Phagwara Hub'}{' '}
                    <span
                      className={`font-bold ${
                        isServiceable ? 'text-[#E27B12]' : 'text-rose-600 text-[11px]'
                      }`}
                    >
                      ({isServiceable ? 'Direct Dispatch' : 'Outside Reach'})
                    </span>
                  </span>
                </div>
                <span className="material-symbols-outlined text-slate-400 text-[16px] ml-1">
                  edit
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Main Body: Sidebar + Products Zone */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Mobile Filter Toggle */}
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-xs font-bold text-[#142B4A] shadow-sm lg:hidden"
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
            <span>Filter &amp; Sort Seeds &amp; Fertilizers</span>
          </button>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Desktop Left Sidebar Filters */}
            <aside className="hidden lg:block">
              <SidebarFilters />
            </aside>

            {/* Mobile Filters Drawer */}
            <AnimatePresence>
              {filtersOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setFiltersOpen(false)}
                    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
                  />
                  <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'tween', duration: 0.25 }}
                    className="fixed inset-y-0 right-0 z-50 w-full max-w-sm overflow-y-auto bg-white shadow-2xl p-5 lg:hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                        <span className="font-headline font-bold text-base text-[#142B4A]">
                          Filters
                        </span>
                        <button
                          onClick={() => setFiltersOpen(false)}
                          className="p-1 rounded-full text-slate-500 hover:bg-slate-100"
                        >
                          <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                      </div>
                      <SidebarFilters className="border-0 shadow-none p-0" />
                    </div>
                    <div className="pt-4 border-t border-slate-100">
                      <button
                        onClick={() => setFiltersOpen(false)}
                        className="w-full bg-[#142B4A] text-white py-3 rounded-xl text-xs font-bold hover:bg-[#1B385D]"
                      >
                        View {filteredProducts.length} Results
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Right Product Grid */}
            <ProductGrid
              onViewDetails={(p) => setSelectedProduct(p)}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              isAdmin={isAdmin}
            />
          </div>
        </section>

        {/* Floating Quick Cart Bar */}
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
                <span className="material-symbols-outlined text-[22px] text-[#FF9F43]">shopping_bag</span>
                <span className="font-headline text-xs font-bold">
                  {cartCount === 1 ? '1 Item in Cart' : `${cartCount} Items in Cart`}
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

      {/* Admin Add/Edit Modal */}
      {showAddModal && (
        <AdminAddProductModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setEditingProduct(null);
          }}
          editProduct={editingProduct}
          onSaved={() => {
            setShowAddModal(false);
            setEditingProduct(null);
          }}
        />
      )}

      <Footer />
    </div>
  );
}
