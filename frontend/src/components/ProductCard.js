'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts } from '../contexts/ProductContext';
import { useLocationContext } from '../contexts/LocationContext';
import { DURATION, EASE, buttonTap, iconTap, qtyNumberVariants } from '../utils/motion';

export default function ProductCard({
  product,
  onViewDetails,
  onEdit,
  onDelete,
  isAdmin = false,
  index = 0,
}) {
  const { addToCart, updateCartQuantity, getItemQuantity, wishlistItems, addToWishlist, removeFromWishlist } = useProducts();
  const { isServiceable, setLocationModalOpen } = useLocationContext();

  // Defer wishlist state to client-only to prevent SSR/localStorage hydration mismatch
  const [mounted, setMounted] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const imgRef = useRef(null);
  const addedTimerRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setImgLoaded(true);
    }
    return () => {
      if (addedTimerRef.current) clearTimeout(addedTimerRef.current);
    };
  }, []);

  // Only compute wishlist status after mount — renders false on server & first paint
  const isWishlisted = mounted && wishlistItems && wishlistItems.some((w) => w.id === product.id);

  const qty = mounted ? getItemQuantity(product.id) : 0;
  const isSoldOut = product.inStock === false;

  const handleCardClick = () => {
    if (onViewDetails) {
      onViewDetails(product);
    }
  };

  const handleAdd = (e) => {
    e.stopPropagation();
    if (isSoldOut) return;
    if (!isServiceable) {
      setLocationModalOpen(true);
      return;
    }
    addToCart(product, 1);
    setJustAdded(true);
    if (addedTimerRef.current) clearTimeout(addedTimerRef.current);
    addedTimerRef.current = setTimeout(() => setJustAdded(false), 550);
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    updateCartQuantity(product.id, qty + 1);
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    updateCartQuantity(product.id, qty - 1);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(product);
    }
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    if (onEdit) onEdit(product);
  };

  const discountPercent =
    typeof product.discount === 'string'
      ? product.discount
      : typeof product.discount === 'number' && product.discount > 0
      ? `${product.discount}% OFF`
      : (product.mrp && product.mrp > product.price
        ? `${Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF`
        : '');

  const displayImage =
    (product.imageUrl && !product.imageUrl.includes('lh3.googleusercontent.com') && product.imageUrl) ||
    (Array.isArray(product.imageDatas) && product.imageDatas[0] && !product.imageDatas[0].includes('lh3.googleusercontent.com') && product.imageDatas[0]) ||
    (product.imageData && !product.imageData.includes('lh3.googleusercontent.com') && product.imageData) ||
    product.imageUrl ||
    '/images/products/hybrid-tomato-seeds.png';

  const staggerDelay = Math.min(index * 0.03, 0.21);

  return (
    <motion.article
      layout="position"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.14, ease: EASE.in } }}
      whileHover={{ y: -2 }}
      transition={{
        opacity: { duration: DURATION.normal, delay: staggerDelay, ease: EASE.out },
        y: { duration: 0.18, ease: EASE.out },
        layout: { duration: 0.22, ease: EASE.out },
      }}
      onClick={handleCardClick}
      className={`group bg-white rounded-2xl p-3.5 shadow-sm hover:shadow-lg transition-shadow duration-200 ease-out flex flex-col justify-between relative border border-[#CBD5E1]/50 hover:border-[#CBD5E1] cursor-pointer ${
        isSoldOut ? 'opacity-65' : ''
      }`}
    >
      {/* Top Badges */}
      <div className="flex items-center justify-between gap-1 mb-2">
        {discountPercent ? (
          <span className="bg-[#FFE8D6] text-[#A74E00] font-headline text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider shadow-sm">
            {discountPercent}
          </span>
        ) : (
          <span className="bg-[#EDF2F7] text-[#142B4A] text-[10px] px-2 py-0.5 rounded-full font-bold">
            Fresh
          </span>
        )}

        {isAdmin ? (
          <div className="flex items-center gap-1 z-10" onClick={(e) => e.stopPropagation()}>
            <motion.button
              whileTap={buttonTap}
              onClick={handleEditClick}
              className="bg-[#142B4A] text-white text-[10px] px-2 py-0.5 rounded hover:bg-[#1B385D] transition-colors duration-150"
            >
              Edit
            </motion.button>
            <motion.button
              whileTap={buttonTap}
              onClick={handleDelete}
              className="bg-rose-600 text-white text-[10px] px-2 py-0.5 rounded hover:bg-rose-700 transition-colors duration-150"
            >
              Delete
            </motion.button>
          </div>
        ) : (
          <motion.button
            type="button"
            whileTap={iconTap}
            onClick={(e) => {
              e.stopPropagation();
              if (isWishlisted) {
                removeFromWishlist(product.id);
              } else {
                addToWishlist(product);
              }
            }}
            className={`transition-all duration-150 p-1.5 rounded-full shadow-xs border ${
              isWishlisted
                ? 'bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100'
                : 'bg-white/90 border-slate-200/80 text-slate-400 hover:text-rose-500 hover:bg-white'
            }`}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            title={isWishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
          >
            <motion.span
              key={isWishlisted ? 'filled' : 'outline'}
              initial={mounted ? { scale: 0.8, opacity: 0.7 } : false}
              animate={{ scale: isWishlisted ? [1, 1.22, 1] : 1, opacity: 1 }}
              transition={{ duration: 0.22, ease: EASE.out }}
              className="material-symbols-outlined text-[18px] block"
              style={isWishlisted ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              favorite
            </motion.span>
          </motion.button>
        )}
      </div>

      {/* Product Image */}
      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#EDF2F7] mb-3 flex items-center justify-center">
        <img
          ref={imgRef}
          src={displayImage}
          alt={product.name}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover group-hover:scale-[1.02] transition-all duration-300 ease-out ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://via.placeholder.com/400x400?text=Farm+Fresh';
            setImgLoaded(true);
          }}
        />

        {/* Delivery Serviceability Badge */}
        {isServiceable ? (
          <span className="absolute bottom-2 left-2 bg-white/95 text-[#142B4A] text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm border border-slate-100 transition-opacity duration-200">
            <span className="material-symbols-outlined text-[13px] text-[#FF9F43]">local_shipping</span>
            <span>{product.deliveryTime || '⚡ Fast Dispatch'}</span>
          </span>
        ) : (
          <span className="absolute bottom-2 left-2 bg-rose-600/95 text-white text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
            <span className="material-symbols-outlined text-[11px]">location_off</span>
            <span>Unavailable in Area</span>
          </span>
        )}

        {isSoldOut && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-white text-rose-600 font-extrabold text-xs px-3 py-1 rounded-md uppercase tracking-wider shadow-lg">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Meta: Rating and Unit */}
      <div className="flex items-center justify-between text-xs mb-1">
        <div className="flex items-center gap-1 text-[#FF9F43]">
          <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            star
          </span>
          <span className="font-bold text-[#263449]">{product.rating || '4.8'}</span>
          <span className="text-[#74777E] text-[11px]">({product.reviewCount || '120'})</span>
        </div>
        <span className="text-[11px] font-bold text-[#142B4A] bg-amber-50/80 border border-amber-200/60 px-2 py-0.5 rounded-md truncate max-w-[130px] flex items-center gap-1">
          <span>{String(product.unit || '').toLowerCase().includes('l') || String(product.unit || '').toLowerCase().includes('ml') ? '🧪' : '⚖️'}</span>
          <span>{product.packSize || product.unit || product.weight || '1 unit'}</span>
        </span>
      </div>

      {/* Product Title */}
      <h3 className="font-headline text-[14px] font-bold text-[#142B4A] group-hover:text-[#E27B12] transition-colors duration-150 line-clamp-2 min-h-[38px] leading-snug">
        {product.name}
      </h3>

      {/* Sourcing / Brand micro-label */}
      <p className="text-[11px] text-[#5A6B82] mt-0.5 truncate">
        {product.brand || 'AgriMart Select'} • {product.origin?.split(',')[0] || 'Certified Lot'}
      </p>

      {/* Bottom Pricing & Add / Stepper CTA */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
        <div className="flex flex-col">
          <span className="font-price text-base font-extrabold text-[#142B4A] leading-tight">
            ₹{product.price}
          </span>
          {product.mrp && product.mrp > product.price ? (
            <span className="text-[11px] text-[#74777E] line-through leading-tight">
              ₹{product.mrp}
            </span>
          ) : (
            <span className="text-[10px] text-[#5A6B82] uppercase leading-tight font-semibold">
              Standard MRP
            </span>
          )}
        </div>

        {/* Stepper / Add Button with smooth state transition */}
        <AnimatePresence mode="wait" initial={false}>
          {isSoldOut ? (
            <span
              key="soldout"
              className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1.5 rounded-lg cursor-not-allowed"
            >
              OUT OF STOCK
            </span>
          ) : justAdded ? (
            <motion.span
              key="added"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: DURATION.fast, ease: EASE.out }}
              className="bg-emerald-600 text-white font-headline text-xs px-3 py-1.5 rounded-lg font-bold shadow-sm inline-flex items-center gap-1"
            >
              <span>✓ ADDED</span>
            </motion.span>
          ) : qty > 0 ? (
            <motion.div
              key="stepper"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: DURATION.fast, ease: EASE.out }}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center bg-[#142B4A] text-white rounded-lg shadow-sm overflow-hidden"
            >
              <motion.button
                type="button"
                whileTap={iconTap}
                onClick={handleDecrement}
                className="px-2 py-1.5 hover:bg-[#1B385D] transition-colors duration-150 flex items-center justify-center"
                aria-label="Decrease quantity"
              >
                <span className="material-symbols-outlined text-[14px]">remove</span>
              </motion.button>
              <div className="min-w-[24px] flex items-center justify-center overflow-hidden">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={qty}
                    variants={qtyNumberVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="px-1 font-bold text-xs inline-block text-center"
                  >
                    {qty}
                  </motion.span>
                </AnimatePresence>
              </div>
              <motion.button
                type="button"
                whileTap={iconTap}
                onClick={handleIncrement}
                className="px-2 py-1.5 hover:bg-[#1B385D] transition-colors duration-150 flex items-center justify-center"
                aria-label="Increase quantity"
              >
                <span className="material-symbols-outlined text-[14px]">add</span>
              </motion.button>
            </motion.div>
          ) : !isServiceable ? (
            <motion.button
              key="unavailable"
              type="button"
              whileTap={buttonTap}
              onClick={handleAdd}
              aria-label="Not deliverable to selected area"
              className="bg-rose-50 border border-rose-300 text-rose-700 hover:bg-rose-100 font-headline text-[11px] px-2.5 py-1.5 rounded-lg font-bold transition-colors duration-150 shadow-sm flex items-center gap-1"
              title="Outside 10 km hub. Tap to change location."
            >
              <span>Unavailable</span>
              <span className="material-symbols-outlined text-[13px]">pin_drop</span>
            </motion.button>
          ) : (
            <motion.button
              key="add"
              type="button"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              whileTap={buttonTap}
              transition={{ duration: DURATION.fast, ease: EASE.out }}
              onClick={handleAdd}
              aria-label="Add to Cart"
              className="bg-white border-2 border-[#142B4A] text-[#142B4A] hover:bg-[#142B4A] hover:text-white font-headline text-xs px-3.5 py-1.5 rounded-lg font-bold transition-colors duration-150 shadow-sm"
            >
              ADD
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}
