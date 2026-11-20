'use client';
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { realtimeDb } from '../config/firebase';
import { ref as rtdbRef, onValue, set, update, remove, get } from 'firebase/database';

export const DEFAULT_COUPONS = [
  {
    id: 'coupon_kisan200',
    code: 'KISAN200',
    discountPercentage: 15,
    minOrderValue: 999,
    maxDiscountAmount: 200,
    description: 'Extra 15% subsidy savings up to ₹200 on certified seeds and fertilizers above ₹999',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'coupon_agri10',
    code: 'AGRI10',
    discountPercentage: 10,
    minOrderValue: 500,
    maxDiscountAmount: 150,
    description: '10% instant discount on orders above ₹500 across all certified farm inputs',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'coupon_mega20',
    code: 'MEGA20',
    discountPercentage: 20,
    minOrderValue: 1500,
    maxDiscountAmount: 500,
    description: '20% bumper harvest savings on orders above ₹1,500',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'coupon_bumper25',
    code: 'BUMPER25',
    discountPercentage: 25,
    minOrderValue: 2000,
    maxDiscountAmount: 750,
    description: '25% wholesale discount on high-volume farm orders above ₹2,000',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

const COUPONS_STORAGE_KEY = 'agrimart_coupons_v1';

const CouponContext = createContext(null);

export function CouponProvider({ children }) {
  const [coupons, setCoupons] = useState(DEFAULT_COUPONS);
  const [loading, setLoading] = useState(true);

  // Sync from localStorage and Firebase RTDB
  useEffect(() => {
    // 1. Initial local load
    if (typeof window !== 'undefined') {
      try {
        const local = localStorage.getItem(COUPONS_STORAGE_KEY);
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCoupons(parsed);
          }
        }
      } catch (err) {
        console.warn('Failed to load local coupons:', err);
      }
    }

    // 2. Real-time Firebase RTDB listener
    let unsubscribe = null;
    try {
      const couponsRef = rtdbRef(realtimeDb, 'coupons');
      unsubscribe = onValue(
        couponsRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const list = Object.keys(data).map((key) => ({
              id: key,
              ...data[key],
            }));
            // Sort by createdAt descending
            list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            setCoupons(list);
            if (typeof window !== 'undefined') {
              localStorage.setItem(COUPONS_STORAGE_KEY, JSON.stringify(list));
            }
          } else {
            // Seed initial default coupons into Firebase RTDB if empty
            DEFAULT_COUPONS.forEach((c) => {
              set(rtdbRef(realtimeDb, `coupons/${c.id}`), c).catch(() => {});
            });
            setCoupons(DEFAULT_COUPONS);
            if (typeof window !== 'undefined') {
              localStorage.setItem(COUPONS_STORAGE_KEY, JSON.stringify(DEFAULT_COUPONS));
            }
          }
          setLoading(false);
        },
        (error) => {
          console.warn('Firebase RTDB coupons listener fallback:', error.message);
          setLoading(false);
        }
      );
    } catch (e) {
      console.warn('Could not initialize Firebase RTDB coupons:', e);
      setLoading(false);
    }

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const saveCouponsLocally = (updatedList) => {
    setCoupons(updatedList);
    if (typeof window !== 'undefined') {
      localStorage.setItem(COUPONS_STORAGE_KEY, JSON.stringify(updatedList));
    }
  };

  /**
   * Add a new coupon
   */
  const addCoupon = useCallback(
    async ({ code, discountPercentage, minOrderValue, maxDiscountAmount = null, description = '' }) => {
      const cleanCode = String(code || '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
      if (!cleanCode) {
        throw new Error('Coupon code is required.');
      }

      const percent = Number(discountPercentage);
      if (isNaN(percent) || percent <= 0 || percent > 90) {
        throw new Error('Discount percentage must be between 1% and 90%.');
      }

      const minOrder = Number(minOrderValue) || 0;
      if (minOrder < 0) {
        throw new Error('Price band minimum order cannot be negative.');
      }

      // Check for duplicate code
      const exists = coupons.some((c) => c.code.toUpperCase() === cleanCode);
      if (exists) {
        throw new Error(`A coupon with code "${cleanCode}" already exists.`);
      }

      const id = `coupon_${cleanCode.toLowerCase()}_${Date.now()}`;
      const newCoupon = {
        id,
        code: cleanCode,
        discountPercentage: percent,
        minOrderValue: minOrder,
        maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
        description: description.trim() || `Get ${percent}% off on orders above ₹${minOrder.toLocaleString('en-IN')}`,
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      const updated = [newCoupon, ...coupons];
      saveCouponsLocally(updated);

      // Persist to Firebase RTDB
      try {
        await set(rtdbRef(realtimeDb, `coupons/${id}`), newCoupon);
      } catch (err) {
        console.warn('Firebase write failed, saved locally:', err.message);
      }

      return newCoupon;
    },
    [coupons]
  );

  /**
   * Delete a coupon
   */
  const deleteCoupon = useCallback(
    async (couponId) => {
      const updated = coupons.filter((c) => c.id !== couponId);
      saveCouponsLocally(updated);

      try {
        await remove(rtdbRef(realtimeDb, `coupons/${couponId}`));
      } catch (err) {
        console.warn('Firebase delete failed, removed locally:', err.message);
      }
    },
    [coupons]
  );

  /**
   * Toggle coupon active/inactive status
   */
  const toggleCouponStatus = useCallback(
    async (couponId) => {
      const target = coupons.find((c) => c.id === couponId);
      if (!target) return;

      const newStatus = !target.isActive;
      const updated = coupons.map((c) => (c.id === couponId ? { ...c, isActive: newStatus } : c));
      saveCouponsLocally(updated);

      try {
        await update(rtdbRef(realtimeDb, `coupons/${couponId}`), { isActive: newStatus });
      } catch (err) {
        console.warn('Firebase update failed, toggled locally:', err.message);
      }
    },
    [coupons]
  );

  /**
   * Validate a coupon against an order subtotal
   */
  const validateCoupon = useCallback(
    (inputCode, orderSubtotal) => {
      const subtotal = Number(orderSubtotal) || 0;
      const cleanInput = String(inputCode || '').trim().toUpperCase();

      if (!cleanInput) {
        return { valid: false, error: 'Please enter a coupon code.' };
      }

      const match = coupons.find((c) => c.code.toUpperCase() === cleanInput);
      if (!match) {
        return {
          valid: false,
          error: `Coupon "${cleanInput}" is invalid. Please check the code or select from available coupons.`,
        };
      }

      if (!match.isActive) {
        return {
          valid: false,
          error: `Coupon "${match.code}" is currently expired or inactive.`,
        };
      }

      // Check price band (minOrderValue)
      if (subtotal < match.minOrderValue) {
        const diff = match.minOrderValue - subtotal;
        return {
          valid: false,
          error: `Price band requirement not met: Coupon ${match.code} is valid only on orders of ₹${match.minOrderValue.toLocaleString('en-IN')} or more. Add ₹${diff.toLocaleString('en-IN')} more to unlock!`,
          diff,
          minOrderValue: match.minOrderValue,
        };
      }

      // Calculate discount amount
      let discountAmount = Math.round((subtotal * match.discountPercentage) / 100);
      if (match.maxDiscountAmount && discountAmount > match.maxDiscountAmount) {
        discountAmount = match.maxDiscountAmount;
      }

      return {
        valid: true,
        coupon: match,
        discountAmount,
        savingsPercent: match.discountPercentage,
      };
    },
    [coupons]
  );

  /**
   * Active coupons list for display in checkout
   */
  const activeCoupons = useMemo(() => {
    return coupons.filter((c) => c.isActive !== false);
  }, [coupons]);

  const value = {
    coupons,
    activeCoupons,
    loading,
    addCoupon,
    deleteCoupon,
    toggleCouponStatus,
    validateCoupon,
  };

  return <CouponContext.Provider value={value}>{children}</CouponContext.Provider>;
}

export function useCoupons() {
  const context = useContext(CouponContext);
  if (!context) {
    throw new Error('useCoupons must be used within a CouponProvider');
  }
  return context;
}
