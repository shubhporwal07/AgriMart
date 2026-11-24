'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts } from '../contexts/ProductContext';
import { useAuth } from '../contexts/AuthContext';
import { useLocationContext } from '../contexts/LocationContext';
import { useLanguage } from '../contexts/LanguageContext';
import Navbar from '../components/Navbar';
import UnserviceableNotice from '../components/UnserviceableNotice';
import SidebarFilters from '../components/SidebarFilters';
import ProductGrid from '../components/ProductGrid';
import ProductDetailsModal from '../components/ProductDetailsModal';
import AdminAddProductModal from '../components/AdminAddProductModal';
import ConfirmDialog from '../components/ConfirmDialog';
import Footer from '../components/Footer';
import {
  accordionVariants,
  backdropVariants,
  drawerRightVariants,
  floatingBarVariants,
  buttonTap,
  iconTap,
} from '../utils/motion';

export default function DashboardPage() {
  const { isAdmin } = useAuth();
  const searchParams = useSearchParams();
  const {
    location: userLocation,
    isServiceable,
    deliveryTime,
    setLocationModalOpen,
  } = useLocationContext();
  const { t, isHindi } = useLanguage();

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
  const [productToDelete, setProductToDelete] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const categoryParam = searchParams.get('category');

  useEffect(() => {
    if (categoryParam === null) return;
    applyNavCategorySlug(categoryParam || 'all');
  }, [categoryParam, applyNavCategorySlug]);

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

  const handleDeleteProduct = (prodOrId) => {
    if (!prodOrId) return;
    const prod =
      typeof prodOrId === 'object'
        ? prodOrId
        : products.find((p) => p.id === prodOrId) || { id: prodOrId, name: 'this product' };
    setProductToDelete(prod);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct(productToDelete.id);
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setProductToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF5EB] text-[#263449] font-sans antialiased">
      <Navbar />

      {/* Blinkit-style unserviceable banner when user location is > 10 km from Phagwara hub */}
      <UnserviceableNotice />

      <main className="w-full">
        {/* KISAN200 Coupon Banner */}
        <AnimatePresence>
          {!bannerDismissed && (
            <motion.div
              key="kisan-banner"
              variants={accordionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full overflow-hidden bg-[#FFE8D6]/80 border-b border-[#FFDCC2]"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#E27B12] text-white shadow-sm">
                    <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      spa
                    </span>
                  </span>
                  <span className="text-xs text-[#263449]">
                    <strong className="font-extrabold text-[#A74E00]">{isHindi ? 'KISAN200 सक्रिय:' : 'KISAN200 Active:'}</strong> {isHindi ? '₹999 से अधिक के प्रमाणित बीज एवं जैविक उर्वरकों पर ₹200 की अतिरिक्त बचत' : 'Extra ₹200 subsidy savings on certified seeds and organic bio-fertilizers above ₹999'}
                  </span>
                  <span className="hidden sm:inline-flex items-center text-[#5A6B82] text-xs">
                    {isHindi ? '• मान्यता प्राप्त अनुसंधान केंद्रों से सीधा प्रेषण' : '• Direct dispatch from accredited research centers'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] bg-white px-2.5 py-0.5 rounded shadow-sm text-[#A74E00] font-bold tracking-wider border border-[#FFDCC2]">
                    KISAN200
                  </span>
                  <motion.button
                    type="button"
                    whileTap={buttonTap}
                    onClick={() => setBannerDismissed(true)}
                    className="text-xs text-[#142B4A] hover:text-[#E27B12] font-bold underline transition-colors duration-150"
                  >
                    {isHindi ? 'हटाएं' : 'Dismiss'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Breadcrumbs & Header Summary */}
        <section className="w-full bg-white shadow-sm border-b border-[#CBD5E1]/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-xs text-[#5A6B82] mb-3 font-semibold">
              <Link href="/" className="hover:text-[#142B4A] transition-colors flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">home</span>
                <span>{isHindi ? 'होम' : 'Home'}</span>
              </Link>
              <span className="material-symbols-outlined text-[14px] text-slate-400">chevron_right</span>
              <span className="hover:text-[#142B4A] transition-colors">{isHindi ? 'कृषि इनपुट्स' : 'Agri Inputs'}</span>
              <span className="material-symbols-outlined text-[14px] text-slate-400">chevron_right</span>
              <span className="font-bold text-[#142B4A]">
                {filters.category?.length > 0 ? filters.category.join(', ') : (isHindi ? 'बीज एवं उर्वरक' : 'Seeds & Fertilizers')}
              </span>
            </nav>

            {/* Title & Live Meta Info */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="font-headline text-2xl sm:text-3xl text-[#142B4A] font-extrabold tracking-tight">
                    {filters.category?.length > 0 ? filters.category[0] : (isHindi ? 'बीज, पौध पोषण एवं उर्वरक' : 'Seeds, Plant Nutrients & Fertilizers')}
                  </h1>
                  <span className="bg-[#D5E3FF] text-[#142B4A] text-xs px-2.5 py-1 rounded-full font-bold">
                    {isHindi ? `${filteredProducts.length} प्रमाणित इनपुट्स` : `${filteredProducts.length} Certified Inputs`}
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
                  {isHindi ? 'प्रमाणित उच्च-उत्पादन हाइब्रिड बीज, शुद्ध जैविक वर्मीकम्पोस्ट, घुलनशील एनपीके उर्वरक, जैव-कवकनाशी और फसल वर्धक सीधे आपके खेत तक पहुंचाए जाते हैं।' : 'Certified high-yield hybrid seeds, pure organic vermicompost, water-soluble NPK fertilizers, bio-fungicides, and foliar crop stimulants shipped straight to your farmland.'}
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
                    {isServiceable ? (isHindi ? 'खेत डिलीवरी गंतव्य' : 'Farm Delivery to') : (isHindi ? 'चयनित केंद्र' : 'Selected Hub')}
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
                      ({isServiceable ? (isHindi ? 'सीधा प्रेषण' : 'Direct Dispatch') : (isHindi ? 'पहुंच से बाहर' : 'Outside Reach')})
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
        <section className="w-full max-w-7xl mx-auto px-2.5 sm:px-6 py-4 sm:py-8">
          {/* Mobile Filter Toggle */}
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="mb-4 sm:mb-6 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 sm:py-3 text-xs font-bold text-[#142B4A] shadow-sm lg:hidden"
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
            <span>{isHindi ? 'बीज और उर्वरक फ़िल्टर एवं क्रमबद्ध करें' : 'Filter & Sort Seeds & Fertilizers'}</span>
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
                    variants={backdropVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    onClick={() => setFiltersOpen(false)}
                    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
                  />
                  <motion.div
                    variants={drawerRightVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="fixed inset-y-0 right-0 z-50 w-full max-w-sm overflow-y-auto bg-white shadow-2xl p-5 lg:hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                        <span className="font-headline font-bold text-base text-[#142B4A]">
                          {isHindi ? 'फ़िल्टर' : 'Filters'}
                        </span>
                        <motion.button
                          type="button"
                          whileTap={iconTap}
                          onClick={() => setFiltersOpen(false)}
                          className="p-1 rounded-full text-slate-500 hover:bg-slate-100 transition-colors duration-150"
                        >
                          <span className="material-symbols-outlined text-[20px]">close</span>
                        </motion.button>
                      </div>
                      <SidebarFilters className="border-0 shadow-none p-0" />
                    </div>
                    <div className="pt-4 border-t border-slate-100">
                      <motion.button
                        type="button"
                        whileTap={buttonTap}
                        onClick={() => setFiltersOpen(false)}
                        className="w-full bg-[#142B4A] text-white py-3 rounded-xl text-xs font-bold hover:bg-[#1B385D] transition-colors duration-150"
                      >
                        {isHindi ? `${filteredProducts.length} परिणाम देखें` : `View ${filteredProducts.length} Results`}
                      </motion.button>
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
        <AnimatePresence>
          {cartCount > 0 && (
            <motion.div
              key="dashboard-floating-cart"
              variants={floatingBarVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="fixed bottom-6 right-6 z-40"
            >
              <Link
                href="/cart"
                className="flex items-center gap-3 bg-[#0B1B30] hover:bg-[#152B48] text-white px-5 py-3 rounded-full shadow-2xl cursor-pointer transform hover:scale-[1.03] active:scale-[0.97] group transition-all duration-150 border border-white/20"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[22px] text-[#FF9F43]">shopping_bag</span>
                  <span className="font-headline text-xs font-bold">
                    {cartCount === 1 ? (isHindi ? '1 उत्पाद कार्ट में' : '1 Item in Cart') : (isHindi ? `${cartCount} उत्पाद कार्ट में` : `${cartCount} Items in Cart`)}
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

      {/* Admin Add/Edit Modal */}
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

      {/* Admin Product Deletion Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!productToDelete}
        title="Delete Product?"
        message={`Are you sure you want to remove "${productToDelete?.name}" from AgriMart? This action cannot be undone.`}
        confirmText="Delete Product"
        cancelText="Cancel"
        isDangerous={true}
        onConfirm={confirmDeleteProduct}
        onCancel={() => setProductToDelete(null)}
      />

      <Footer />
    </div>
  );
}
