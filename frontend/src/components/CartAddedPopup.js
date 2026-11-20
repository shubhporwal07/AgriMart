'use client';
import { forwardRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ShoppingBag, X } from 'lucide-react';
import { toastVariants, iconTap } from '../utils/motion';

const CartAddedPopup = forwardRef(function CartAddedPopup({ productName, onClose, stacked = false }, ref) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2400);
    return () => clearTimeout(timer);
  }, [onClose, productName]);

  return (
    <motion.div
      ref={ref}
      layout
      variants={toastVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={
        stacked
          ? 'pointer-events-auto w-full max-w-sm'
          : 'pointer-events-auto fixed bottom-6 right-6 z-[70] w-[calc(100%-2rem)] max-w-sm'
      }
      role="status"
      aria-live="polite"
    >
      <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-white via-emerald-50 to-emerald-100 p-4 shadow-[0_22px_45px_rgba(16,185,129,0.22)]">
        <div className="absolute -right-7 -top-7 h-20 w-20 rounded-full bg-emerald-200/40" aria-hidden />

        <motion.button
          type="button"
          whileTap={iconTap}
          onClick={onClose}
          className="absolute right-2 top-2 rounded-md p-1 text-emerald-700 transition-colors duration-150 hover:bg-emerald-200/40"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </motion.button>

        <div className="relative flex items-start gap-3">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm shrink-0"
          >
            <ShoppingBag className="h-4 w-4" />
          </motion.div>
          <div className="min-w-0 pr-5">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-900">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Added to bag
            </p>
            <p className="mt-1 line-clamp-2 text-sm text-emerald-900/90">{productName}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default CartAddedPopup;
