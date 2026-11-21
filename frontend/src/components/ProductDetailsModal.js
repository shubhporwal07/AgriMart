'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts } from '../contexts/ProductContext';
import { useLocationContext } from '../contexts/LocationContext';
import { realtimeDb } from '../config/firebase';
import { ref as rtdbRef, onValue } from 'firebase/database';
import {
  backdropVariants,
  modalVariants,
  tabContentVariants,
  qtyNumberVariants,
  buttonTap,
  iconTap,
  EASE,
} from '../utils/motion';

export default function ProductDetailsModal({ product, onClose, onSelectProduct }) {
  const {
    addToCart,
    updateCartQuantity,
    getItemQuantity,
    products,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
  } = useProducts();
  const { isServiceable, location: userLocation, setLocationModalOpen } = useLocationContext();

  const [activeTab, setActiveTab] = useState('highlights');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [productReviews, setProductReviews] = useState([]);

  useEffect(() => {
    if (!product?.id) {
      setProductReviews([]);
      return;
    }

    try {
      const pRevRef = rtdbRef(realtimeDb, `productReviews/${product.id}`);
      const unsub = onValue(pRevRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const list = Object.values(data).filter((r) => r && r.rating);
          list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          setProductReviews(list);
        } else {
          setProductReviews([]);
        }
      });
      return () => unsub();
    } catch {
      setProductReviews([]);
    }
  }, [product?.id]);

  const liveAvgRating =
    productReviews.length > 0
      ? (
          productReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) /
          productReviews.length
        ).toFixed(1)
      : typeof product?.rating === 'number'
      ? product.rating.toFixed(1)
      : '5.0';

  useEffect(() => {
    setCurrentImageIndex(0);
    setActiveTab('highlights');
  }, [product?.id]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!product) return null;

  const isWishlisted = isInWishlist(product.id);
  const qty = getItemQuantity(product.id);
  const isSoldOut = product.inStock === false;

  // Strictly collect, filter, and deduplicate images to eliminate any duplicate copies
  const rawImages = [
    product.imageUrl,
    ...(Array.isArray(product.imageDatas) ? product.imageDatas : []),
    product.imageData,
  ].filter(
    (img) => img && typeof img === 'string' && !img.includes('lh3.googleusercontent.com') && img.trim() !== ''
  );

  const productNameLower = (product.name || '').toLowerCase();
  const productIdLower = (product.id || '').toLowerCase();
  const isChilli = productIdLower.includes('chilli') || productNameLower.includes('chilli');
  const isWheat = productIdLower.includes('wheat') || productNameLower.includes('wheat');

  const filteredImages = rawImages.filter((img) => {
    if (img.includes('1588252303782-cb80119abd6d') && !isChilli) return false;
    if (img.includes('1574323347407-f5e1ad6d020b') && !isWheat) return false;
    return true;
  });

  const uniqueImages = Array.from(new Set(filteredImages.length > 0 ? filteredImages : rawImages));
  const allImages = uniqueImages.length > 0 ? uniqueImages : ['/images/products/hybrid-tomato-seeds.png'];

  const safeImageIndex = Math.min(Math.max(0, currentImageIndex), allImages.length - 1);
  const currentImage = allImages[safeImageIndex] || allImages[0];

  const discountVal =
    product.mrp && product.mrp > product.price ? product.mrp - product.price : 0;
  const discountPercent =
    product.discount ||
    (discountVal > 0 ? `${Math.round((discountVal / product.mrp) * 100)}% OFF` : '');

  // Related products from same category
  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <motion.div
      variants={backdropVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto no-scrollbar"
      onClick={onClose}
    >
      <motion.div
        variants={modalVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col border border-slate-100 my-auto"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#F7F9FC]">
          <div className="flex items-center gap-2">
            <span className="bg-[#142B4A] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              {product.category}
            </span>
            <span className="text-xs text-[#5A6B82] font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-[#FF9F43]">local_shipping</span>
              ⚡ Fast Farm Dispatch
            </span>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              type="button"
              whileTap={iconTap}
              onClick={() => {
                if (isWishlisted) {
                  removeFromWishlist(product.id);
                } else {
                  addToWishlist(product);
                }
              }}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-150 shadow-sm border ${
                isWishlisted
                  ? 'bg-rose-50 border-rose-200 text-rose-500'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-rose-500'
              }`}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              title={isWishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={isWishlisted ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                favorite
              </span>
            </motion.button>
            <motion.button
              type="button"
              whileTap={iconTap}
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors duration-150 shadow-sm border border-slate-200"
              aria-label="Close"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </motion.button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto no-scrollbar max-h-[calc(92vh-80px)]">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left Column: Images (5 Cols) */}
            <div className="md:col-span-5 flex flex-col gap-3">
              <div className="relative w-full aspect-square rounded-2xl bg-[#EDF2F7] overflow-hidden flex items-center justify-center border border-[#CBD5E1]/50">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.img
                    key={currentImage}
                    src={currentImage}
                    alt={product.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18, ease: EASE.out }}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>
                {discountPercent && (
                  <span className="absolute top-3 left-3 bg-[#FF9F43] text-[#142B4A] text-xs font-headline font-extrabold px-2.5 py-1 rounded-full shadow-md">
                    {discountPercent}
                  </span>
                )}
                {product.isOrganic && (
                  <span className="absolute bottom-3 left-3 bg-white/95 text-[#A74E00] text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm border border-orange-100">
                    <span className="material-symbols-outlined text-[15px]">eco</span>
                    Certified Organic
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto py-1">
                  {allImages.map((img, idx) => (
                    <motion.button
                      key={idx}
                      type="button"
                      whileTap={iconTap}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all duration-150 ${
                        currentImageIndex === idx
                          ? 'border-[#142B4A] shadow-md scale-[1.03]'
                          : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Trust Badges */}
              <div className="mt-2 bg-[#F7F9FC] rounded-2xl p-4 border border-[#CBD5E1]/40 space-y-2.5">
                <div className="flex items-center gap-2.5 text-xs text-[#263449]">
                  <span className="material-symbols-outlined text-[#FF9F43] text-[20px]">
                    verified
                  </span>
                  <div>
                    <span className="font-bold block">100% Farm Fresh Guarantee</span>
                    <span className="text-[11px] text-[#5A6B82]">
                      Direct from verified local cultivators
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#263449]">
                  <span className="material-symbols-outlined text-[#FF9F43] text-[20px]">
                    currency_exchange
                  </span>
                  <div>
                    <span className="font-bold block">Instant No-Questions Refund</span>
                    <span className="text-[11px] text-[#5A6B82]">
                      Not fresh? Tap for instant UPI refund
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Details & Tabs (7 Cols) */}
            <div className="md:col-span-7 flex flex-col">
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#E27B12]">
                {product.brand || 'AgriMart Select'}
              </span>
              <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-[#142B4A] mt-1 leading-snug">
                {product.name}
              </h1>
              <p className="text-sm text-[#5A6B82] font-semibold mt-1">
                Pack Size / Measurement: <span className="text-[#263449] font-bold">{product.unit}</span>
              </p>

              {/* Weight / Measurement indicator & packaging standards */}
              <div className="mt-2.5 p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#142B4A] mb-1.5">
                  <span>{String(product.unit || '').toLowerCase().includes('l') || String(product.unit || '').toLowerCase().includes('ml') ? '🧪' : '⚖️'}</span>
                  <span>Pack Size Measurement:</span>
                  <span className="text-emerald-700 font-extrabold ml-auto">{product.unit}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(String(product.unit || '').toLowerCase().includes('l') || String(product.unit || '').toLowerCase().includes('ml')
                    ? ['250 ml', '500 ml', '1 Litre', '5 Litres']
                    : ['500 g', '1 kg', '2 kg', '5 kg', '25 kg']
                  ).map((size) => (
                    <span
                      key={size}
                      className={`text-[10px] px-2 py-0.5 rounded-md font-bold border ${
                        String(product.unit || '').toLowerCase().includes(size.toLowerCase())
                          ? 'bg-[#142B4A] text-white border-[#142B4A]'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      {size}
                    </span>
                  ))}
                </div>
              </div>

              {/* Rating & Review */}
              <div className="flex items-center gap-2 mt-2">
                <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-lg text-xs font-bold">
                  <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    star
                  </span>
                  <span>{liveAvgRating}</span>
                </div>
                <span className="text-xs text-[#5A6B82]">
                  {productReviews.length > 0
                    ? `(${productReviews.length} verified review${productReviews.length !== 1 ? 's' : ''})`
                    : '(No reviews yet)'}
                </span>
              </div>

              {/* Price Block */}
              <div className="mt-4 p-4 rounded-2xl bg-[#EDF2F7] border border-[#CBD5E1]/60 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-price text-3xl font-extrabold text-[#142B4A]">
                      ₹{product.price}
                    </span>
                    {product.mrp && product.mrp > product.price && (
                      <span className="text-sm text-[#74777E] line-through">
                        ₹{product.mrp}
                      </span>
                    )}
                  </div>
                  {discountVal > 0 && (
                    <span className="text-xs font-bold text-emerald-700 block mt-0.5">
                      You save ₹{discountVal} ({discountPercent})
                    </span>
                  )}
                  <span className="text-[10px] text-[#5A6B82]">Inclusive of all taxes</span>
                </div>

                {/* Add / Stepper + Wishlist */}
                <div className="flex items-center gap-2">
                  <motion.button
                    type="button"
                    whileTap={buttonTap}
                    onClick={() => {
                      if (isWishlisted) {
                        removeFromWishlist(product.id);
                      } else {
                        addToWishlist(product);
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border font-bold text-xs transition-colors duration-150 shadow-sm ${
                      isWishlisted
                        ? 'bg-rose-50 border-rose-300 text-rose-600 hover:bg-rose-100'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-rose-600'
                    }`}
                    title={isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
                    aria-label={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  >
                    <span
                      className="material-symbols-outlined text-[18px]"
                      style={isWishlisted ? { fontVariationSettings: "'FILL' 1" } : {}}
                    >
                      favorite
                    </span>
                    <span className="hidden sm:inline">
                      {isWishlisted ? 'Saved' : 'Wishlist'}
                    </span>
                  </motion.button>

                  <AnimatePresence mode="wait" initial={false}>
                    {isSoldOut ? (
                      <span key="sold" className="bg-slate-200 text-slate-500 font-bold text-xs px-4 py-2.5 rounded-xl block">
                        Sold Out
                      </span>
                    ) : qty > 0 ? (
                      <motion.div
                        key="stepper"
                        initial={{ opacity: 0, scale: 0.94 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.94 }}
                        transition={{ duration: 0.14 }}
                        className="flex items-center bg-[#142B4A] text-white rounded-xl shadow-md overflow-hidden"
                      >
                        <motion.button
                          type="button"
                          whileTap={iconTap}
                          onClick={() => updateCartQuantity(product.id, qty - 1)}
                          className="px-3.5 py-2.5 hover:bg-[#1B385D] transition-colors duration-150"
                          aria-label="Decrease quantity"
                        >
                          <span className="material-symbols-outlined text-[18px]">remove</span>
                        </motion.button>
                        <div className="min-w-[36px] flex items-center justify-center overflow-hidden">
                          <AnimatePresence mode="popLayout" initial={false}>
                            <motion.span
                              key={qty}
                              variants={qtyNumberVariants}
                              initial="initial"
                              animate="animate"
                              exit="exit"
                              className="px-2 font-bold text-sm inline-block"
                            >
                              {qty}
                            </motion.span>
                          </AnimatePresence>
                        </div>
                        <motion.button
                          type="button"
                          whileTap={iconTap}
                          onClick={() => updateCartQuantity(product.id, qty + 1)}
                          className="px-3.5 py-2.5 hover:bg-[#1B385D] transition-colors duration-150"
                          aria-label="Increase quantity"
                        >
                          <span className="material-symbols-outlined text-[18px]">add</span>
                        </motion.button>
                      </motion.div>
                    ) : !isServiceable ? (
                      <motion.button
                        key="unserviceable"
                        type="button"
                        whileTap={buttonTap}
                        onClick={() => setLocationModalOpen(true)}
                        className="bg-rose-50 border border-rose-300 text-rose-700 hover:bg-rose-100 font-headline text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition-colors duration-150 flex items-center gap-1.5"
                        title="Outside 10 km Phagwara hub. Tap to change location."
                      >
                        <span className="material-symbols-outlined text-[18px]">location_off</span>
                        <span>Unavailable in Area</span>
                      </motion.button>
                    ) : (
                      <motion.button
                        key="add"
                        type="button"
                        initial={{ opacity: 0, scale: 0.94 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.94 }}
                        whileTap={buttonTap}
                        transition={{ duration: 0.14 }}
                        onClick={() => addToCart(product, 1)}
                        className="bg-[#142B4A] hover:bg-[#1B385D] text-white font-headline text-sm font-bold px-6 py-2.5 rounded-xl shadow-md transition-colors duration-150 flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          add_shopping_cart
                        </span>
                        <span>ADD TO CART</span>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Unserviceable Warning Banner */}
              {!isServiceable && (
                <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 text-rose-800">
                    <span className="material-symbols-outlined text-[20px] text-rose-600 shrink-0">
                      location_off
                    </span>
                    <div>
                      <span className="font-bold block">Delivery currently unavailable in {userLocation?.name || 'this area'}</span>
                      <span className="text-[11px] text-rose-600">AgriMart delivers within 10 km of our Central Kisan Dispatch Hub.</span>
                    </div>
                  </div>
                  <motion.button
                    type="button"
                    whileTap={buttonTap}
                    onClick={() => setLocationModalOpen(true)}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg shrink-0 shadow-sm transition-colors duration-150"
                  >
                    Change Area
                  </motion.button>
                </div>
              )}

              {/* Detailed Information Tabs */}
              <div className="mt-6">
                {/* Tab Headers with sliding active indicator */}
                <div className="flex border-b border-slate-200 gap-4 overflow-x-auto no-scrollbar">
                  {[
                    { key: 'highlights', label: 'Highlights' },
                    { key: 'nutrition', label: 'Agronomy & Nutrients' },
                    { key: 'storage', label: 'Sowing & Storage' },
                    { key: 'manufacturer', label: 'License & Standards' },
                    { key: 'reviews', label: `Reviews (${productReviews.length})` },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className={`pb-2.5 text-xs font-bold transition-colors duration-150 relative whitespace-nowrap ${
                        activeTab === tab.key
                          ? 'text-[#142B4A]'
                          : 'text-[#5A6B82] hover:text-[#142B4A]'
                      }`}
                    >
                      {tab.label}
                      {activeTab === tab.key && (
                        <motion.span
                          layoutId="productDetailsTabLine"
                          transition={{ duration: 0.2, ease: EASE.out }}
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#142B4A] rounded-full"
                        />
                      )}
                    </button>
                  ))}
                </div>

                {/* Animated Tab Content */}
                <AnimatePresence mode="wait" initial={false}>
                  {activeTab === 'highlights' && (
                    <motion.div
                      key="highlights"
                      variants={tabContentVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="py-4 space-y-3"
                    >
                      <p className="text-xs text-[#263449] leading-relaxed">
                        {product.description}
                      </p>
                      {Array.isArray(product.highlights) && product.highlights.length > 0 && (
                        <ul className="space-y-1.5">
                          {product.highlights.map((h, i) => (
                            <li key={i} className="text-xs text-[#5A6B82] flex items-start gap-2">
                              <span className="material-symbols-outlined text-[#FF9F43] text-[16px] shrink-0 mt-0.5">
                                check_circle
                              </span>
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'nutrition' && (
                    <motion.div
                      key="nutrition"
                      variants={tabContentVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="py-4"
                    >
                      <div className="bg-[#F7F9FC] rounded-xl border border-slate-200 overflow-hidden">
                        <table className="w-full text-xs text-left">
                          <thead>
                            <tr className="bg-slate-200/60 text-[#142B4A] font-bold">
                              <th className="p-2.5">Agri Parameter / Element</th>
                              <th className="p-2.5">Certified Standard</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {product.nutritionalFacts &&
                              Object.entries(product.nutritionalFacts).map(([key, val]) => (
                                <tr key={key} className="hover:bg-white transition-colors duration-150">
                                  <td className="p-2.5 font-medium text-[#263449]">{key}</td>
                                  <td className="p-2.5 text-[#5A6B82] font-semibold">{val}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                      <p className="text-[10px] text-[#74777E] mt-2 italic">
                        *Guaranteed laboratory analysis verified under Seed Act 1966 & Fertilizer Control Order (FCO) 1985.
                      </p>
                    </motion.div>
                  )}

                  {activeTab === 'storage' && (
                    <motion.div
                      key="storage"
                      variants={tabContentVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="py-4 space-y-3 text-xs"
                    >
                      <div className="bg-amber-50/60 border border-amber-200 p-3 rounded-xl">
                        <span className="font-bold text-amber-900 block mb-1">
                          Shelf Life & Viability
                        </span>
                        <p className="text-[#5A6B82]">
                          {product.shelfLife || '18 months from packaging date.'}
                        </p>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                        <span className="font-bold text-slate-900 block mb-1">
                          Farm Storage & Sowing Instructions
                        </span>
                        <p className="text-[#5A6B82]">
                          {product.storageInstructions ||
                            'Keep in cool, dry ventilated farm storehouse. Protect from moisture and direct sun.'}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'manufacturer' && (
                    <motion.div
                      key="manufacturer"
                      variants={tabContentVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="py-4 space-y-3 text-xs"
                    >
                      <div>
                        <span className="font-bold text-[#142B4A] block">Country of Origin</span>
                        <span className="text-[#5A6B82]">India</span>
                      </div>
                      <div>
                        <span className="font-bold text-[#142B4A] block">Research Center / Origin Hub</span>
                        <span className="text-[#5A6B82]">{product.origin}</span>
                      </div>
                      <div>
                        <span className="font-bold text-[#142B4A] block">Seed Act / FCO License Number</span>
                        <span className="font-mono text-[#5A6B82]">{product.fssaiLicence}</span>
                      </div>
                      <div>
                        <span className="font-bold text-[#142B4A] block">Packer & Seed Producer</span>
                        <span className="text-[#5A6B82]">{product.manufacturerDetails}</span>
                      </div>
                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-[11px] text-slate-500">
                          <strong>Kisan Agronomist Advisory:</strong> AgriMart Support & Soil Doctor, Toll-Free Kisan Helpline 1800-AGRI-MART or email advisory@agrimart.farm.
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'reviews' && (
                    <motion.div
                      key="reviews"
                      variants={tabContentVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="py-4 space-y-3"
                    >
                      {productReviews.length > 0 ? (
                        <div className="space-y-3">
                          <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200/80 flex items-center justify-between">
                            <div>
                              <span className="text-xs font-bold text-amber-900 block">
                                Verified Customer Rating
                              </span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="font-extrabold text-base text-amber-900">
                                  {liveAvgRating} / 5.0
                                </span>
                                <div className="flex text-amber-400">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <span
                                      key={s}
                                      className="material-symbols-outlined text-[16px]"
                                      style={{
                                        fontVariationSettings:
                                          s <= Math.round(Number(liveAvgRating))
                                            ? "'FILL' 1"
                                            : "'FILL' 0",
                                      }}
                                    >
                                      star
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <span className="text-xs font-semibold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-xl">
                              100% Post-Delivery Reviews
                            </span>
                          </div>

                          <div className="space-y-2.5">
                            {productReviews.map((rev) => (
                              <div
                                key={rev.id}
                                className="p-3.5 rounded-2xl bg-[#F7F9FC] border border-slate-200/80 space-y-1.5"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <div className="flex text-amber-400">
                                      {[1, 2, 3, 4, 5].map((s) => (
                                        <span
                                          key={s}
                                          className="material-symbols-outlined text-[14px]"
                                          style={{
                                            fontVariationSettings:
                                              s <= (rev.rating || 5)
                                                ? "'FILL' 1"
                                                : "'FILL' 0",
                                          }}
                                        >
                                          star
                                        </span>
                                      ))}
                                    </div>
                                    <span className="font-bold text-xs text-slate-900">
                                      {rev.rating}.0
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                    ✓ Verified Delivery
                                  </span>
                                </div>

                                {rev.title && (
                                  <p className="text-xs font-bold text-slate-900">
                                    {rev.title}
                                  </p>
                                )}

                                <p className="text-xs text-slate-700 leading-relaxed italic">
                                  &ldquo;{rev.comment}&rdquo;
                                </p>

                                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/50">
                                  <span className="font-semibold text-slate-800">
                                    {rev.authorName || 'Kisan Customer'} • {rev.location || 'India'}
                                  </span>
                                  <span>
                                    {rev.createdAt
                                      ? new Date(rev.createdAt).toLocaleDateString('en-IN', {
                                          day: 'numeric',
                                          month: 'short',
                                          year: 'numeric',
                                        })
                                      : ''}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="py-6 text-center bg-slate-50 rounded-2xl border border-slate-200/80 p-6">
                          <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#FF9F43] flex items-center justify-center mx-auto mb-2">
                            <span className="material-symbols-outlined text-[22px]">
                              rate_review
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-800">No customer reviews yet</p>
                          <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                            Reviews can only be submitted after verified farm delivery. Once you receive this input, rate it under My Orders!
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Related Products Section */}
          {related.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <h3 className="font-headline font-extrabold text-base text-[#142B4A] mb-4">
                Customers Also Bought from {product.category}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {related.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelectProduct?.(item)}
                    className="group bg-[#F7F9FC] rounded-2xl p-3 border border-slate-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ease-out cursor-pointer flex flex-col justify-between"
                  >
                    <div className="w-full aspect-square rounded-xl bg-white overflow-hidden mb-2">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300 ease-out"
                      />
                    </div>
                    <h4 className="text-xs font-bold text-[#142B4A] line-clamp-1 group-hover:text-[#E27B12] transition-colors duration-150">
                      {item.name}
                    </h4>
                    <span className="text-[10px] text-[#5A6B82]">{item.unit}</span>
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200">
                      <span className="font-price font-extrabold text-xs text-[#142B4A]">
                        ₹{item.price}
                      </span>
                      <motion.button
                        type="button"
                        whileTap={buttonTap}
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(item, 1);
                        }}
                        className="text-[10px] bg-white border border-[#142B4A] text-[#142B4A] px-2 py-0.5 rounded font-bold hover:bg-[#142B4A] hover:text-white transition-colors duration-150"
                      >
                        ADD
                      </motion.button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
