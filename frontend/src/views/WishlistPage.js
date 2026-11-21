'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductDetailsModal from '../components/ProductDetailsModal';
import { useProducts } from '../contexts/ProductContext';
import { wishlistItemVariants, buttonTap, iconTap, DURATION, EASE } from '../utils/motion';

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist, addToCart, storageHydrated } = useProducts();
  const [addedIds, setAddedIds] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    setAddedIds((prev) => (prev.includes(product.id) ? prev : [...prev, product.id]));
    setTimeout(() => {
      setAddedIds((prev) => prev.filter((id) => id !== product.id));
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#FAF5EB] flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-[#5A6B82] hover:text-[#142B4A] transition-colors duration-150 font-medium group"
          >
            <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform duration-150">arrow_back</span>
            Continue Shopping
          </Link>
        </div>

        <h1 className="font-headline text-2xl font-extrabold text-[#142B4A] mb-1">
          My Wishlist
        </h1>
        <p className="text-sm text-[#5A6B82] mb-6">
          {wishlistItems.length} saved {wishlistItems.length === 1 ? 'item' : 'items'}
        </p>

        <AnimatePresence mode="wait">
          {!storageHydrated ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-10 h-10 rounded-full border-3 border-[#142B4A] border-t-transparent animate-spin mb-4" />
              <p className="text-sm font-bold text-[#5A6B82]">Loading your wishlist...</p>
            </div>
          ) : wishlistItems.length === 0 ? (
            /* Empty State */
            <motion.div
              key="wishlist-empty"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: DURATION.normal, ease: EASE.out }}
              className="flex flex-col items-center justify-center py-24 px-4 text-center bg-white rounded-3xl border border-slate-200 shadow-sm"
            >
              <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-[40px] text-rose-300">favorite</span>
              </div>
              <h2 className="font-headline text-xl font-bold text-[#142B4A] mb-2">
                Your wishlist is empty
              </h2>
              <p className="text-sm text-[#5A6B82] max-w-xs mb-6">
                Save your favourite seeds, fertilizers and farm inputs here for easy access later.
              </p>
              <Link
                href="/dashboard"
                className="bg-[#142B4A] hover:bg-[#1B385D] text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all duration-150 active:scale-[0.97] shadow-sm"
              >
                Browse Products
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="wishlist-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5"
            >
              <AnimatePresence mode="popLayout">
                {wishlistItems.map((product) => {
                  const displayImage =
                    (Array.isArray(product.imageDatas) && product.imageDatas[0]) ||
                    product.imageData ||
                    product.imageUrl ||
                    '/images/products/hybrid-tomato-seeds.png';

                  const discountPercent =
                    product.mrp && product.mrp > product.price
                      ? `${Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF`
                      : typeof product.discount === 'string'
                      ? product.discount
                      : '';

                  const isAdded = addedIds.includes(product.id);

                  return (
                    <motion.div
                      key={product.id}
                      layout="position"
                      variants={wishlistItemVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      whileHover={{ y: -2 }}
                      transition={{
                        layout: { duration: 0.22, ease: EASE.out },
                        y: { duration: 0.18, ease: EASE.out },
                      }}
                      className="group bg-white rounded-xl sm:rounded-2xl border border-[#CBD5E1]/50 hover:border-[#CBD5E1] shadow-sm hover:shadow-lg transition-shadow duration-200 flex flex-col p-2.5 sm:p-3.5"
                    >
                      {/* Remove button */}
                      <div className="flex items-center justify-between mb-2">
                        {discountPercent ? (
                          <span className="bg-[#FFE8D6] text-[#A74E00] font-headline text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider">
                            {discountPercent}
                          </span>
                        ) : (
                          <span className="bg-[#EDF2F7] text-[#142B4A] text-[10px] px-2 py-0.5 rounded-full font-bold">
                            Fresh
                          </span>
                        )}
                        <motion.button
                          type="button"
                          whileTap={iconTap}
                          onClick={() => removeFromWishlist(product.id)}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-rose-500 hover:text-rose-600 transition-colors duration-150 hover:bg-rose-50 shrink-0"
                          aria-label="Remove from wishlist"
                          title="Remove from Wishlist"
                        >
                          <span
                            className="material-symbols-outlined text-[18px] flex items-center justify-center leading-none"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            favorite
                          </span>
                        </motion.button>
                      </div>

                      {/* Product Image */}
                      <div
                        onClick={() => setSelectedProduct(product)}
                        className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#EDF2F7] mb-3 cursor-pointer"
                      >
                        <img
                          src={displayImage}
                          alt={product.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300 ease-out"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://via.placeholder.com/400x400?text=AgriMart';
                          }}
                        />
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-1 text-xs mb-1">
                        <span
                          className="material-symbols-outlined text-[14px] text-[#FF9F43]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          star
                        </span>
                        <span className="font-bold text-[#263449]">{product.rating ? Number(product.rating).toFixed(1) : '5.0'}</span>
                        {Boolean(product.reviewCount) && (
                          <span className="text-[#74777E] text-[11px]">({product.reviewCount})</span>
                        )}
                      </div>

                      {/* Name */}
                      <h3
                        onClick={() => setSelectedProduct(product)}
                        className="font-headline text-[13px] font-bold text-[#142B4A] group-hover:text-[#E27B12] transition-colors duration-150 line-clamp-2 leading-snug min-h-[34px] cursor-pointer"
                      >
                        {product.name}
                      </h3>
                      <p className="text-[11px] text-[#5A6B82] mt-0.5 truncate">
                        {product.brand || 'AgriMart Select'} • {product.unit || '1 unit'}
                      </p>

                      {/* Pricing & CTA */}
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                        <div className="flex flex-col">
                          <span className="font-price text-base font-extrabold text-[#142B4A] leading-tight">
                            ₹{product.price}
                          </span>
                          {product.mrp && product.mrp > product.price ? (
                            <span className="text-[11px] text-[#74777E] line-through leading-tight">
                              ₹{product.mrp}
                            </span>
                          ) : null}
                        </div>

                        <motion.button
                          type="button"
                          whileTap={buttonTap}
                          onClick={() => handleAddToCart(product)}
                          className={`font-headline text-xs px-3.5 py-1.5 rounded-lg font-bold transition-colors duration-150 shadow-sm ${
                            isAdded
                              ? 'bg-emerald-600 text-white border-2 border-emerald-600'
                              : 'bg-white border-2 border-[#142B4A] text-[#142B4A] hover:bg-[#142B4A] hover:text-white'
                          }`}
                        >
                          <AnimatePresence mode="wait" initial={false}>
                            <motion.span
                              key={isAdded ? 'added' : 'add'}
                              initial={{ opacity: 0, y: 3 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -3 }}
                              transition={{ duration: 0.12 }}
                              className="inline-block"
                            >
                              {isAdded ? '✓ ADDED' : 'ADD'}
                            </motion.span>
                          </AnimatePresence>
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
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
