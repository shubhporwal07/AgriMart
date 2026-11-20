'use client';
import { Suspense, useEffect, forwardRef } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { AuthProvider } from '../contexts/AuthContext';
import { LocationProvider } from '../contexts/LocationContext';
import { ProductProvider, useProducts } from '../contexts/ProductContext';
import { CouponProvider } from '../contexts/CouponContext';
import { PageSkeletonLoader } from './SkeletonLoader';
import CartAddedPopup from './CartAddedPopup';
import { toastVariants, iconTap } from '../utils/motion';

const WishlistToast = forwardRef(function WishlistToast({ notice, onClose }, ref) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2200);
    return () => clearTimeout(timer);
  }, [notice.id, onClose]);

  const isAdded = notice.action === 'added';

  return (
    <motion.div
      ref={ref}
      layout
      variants={toastVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      role="status"
      aria-live="polite"
      className="pointer-events-auto w-full max-w-xs"
    >
      <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-[0_12px_30px_rgba(20,43,74,0.14)]">
        <span
          className={`material-symbols-outlined text-[18px] shrink-0 ${
            isAdded ? 'text-rose-500' : 'text-slate-400'
          }`}
          style={isAdded ? { fontVariationSettings: "'FILL' 1" } : {}}
        >
          favorite
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-[#142B4A] leading-tight">
            {isAdded ? 'Added to wishlist' : 'Removed from wishlist'}
          </p>
          {notice.name && (
            <p className="text-[11px] text-[#5A6B82] truncate mt-0.5">{notice.name}</p>
          )}
        </div>
        <motion.button
          type="button"
          whileTap={iconTap}
          onClick={onClose}
          className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors duration-150"
          aria-label="Close notification"
        >
          <X className="h-3.5 w-3.5" />
        </motion.button>
      </div>
    </motion.div>
  );
});

function NoticeRenderer() {
  const { cartNotice, clearCartNotice, wishlistNotice, clearWishlistNotice } = useProducts();

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[75] flex flex-col items-end gap-2.5 w-[calc(100%-2rem)] max-w-sm">
      <AnimatePresence mode="popLayout">
        {wishlistNotice && (
          <WishlistToast
            key={wishlistNotice.id}
            notice={wishlistNotice}
            onClose={clearWishlistNotice}
          />
        )}
        {cartNotice && (
          <CartAddedPopup
            key={cartNotice.id}
            productName={cartNotice.name}
            onClose={clearCartNotice}
            stacked
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ClientProviders({ children }) {
  return (
    <MotionConfig reducedMotion="user">
      <AuthProvider>
        <LocationProvider>
          <ProductProvider>
            <CouponProvider>
              <NoticeRenderer />
              <Suspense fallback={<PageSkeletonLoader />}>
                {children}
              </Suspense>
            </CouponProvider>
          </ProductProvider>
        </LocationProvider>
      </AuthProvider>
    </MotionConfig>
  );
}
