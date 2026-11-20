import { describe, it, expect } from 'vitest';
import { DEFAULT_COUPONS } from '../contexts/CouponContext';

describe('Admin Coupon & Price Band Discount System', () => {
  // Helper validation logic mirroring CouponContext
  const validateCoupon = (coupons, inputCode, orderSubtotal) => {
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

    if (match.isActive === false) {
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
  };

  it('contains valid default coupons with codes, percentage discounts, and price bands', () => {
    expect(DEFAULT_COUPONS.length).toBeGreaterThanOrEqual(4);

    const kisan200 = DEFAULT_COUPONS.find((c) => c.code === 'KISAN200');
    expect(kisan200).toBeDefined();
    expect(kisan200.discountPercentage).toBe(15);
    expect(kisan200.minOrderValue).toBe(999);
    expect(kisan200.maxDiscountAmount).toBe(200);
    expect(kisan200.isActive).toBe(true);

    const mega20 = DEFAULT_COUPONS.find((c) => c.code === 'MEGA20');
    expect(mega20).toBeDefined();
    expect(mega20.discountPercentage).toBe(20);
    expect(mega20.minOrderValue).toBe(1500);
  });

  it('rejects coupon redemption if the order subtotal is below the price band', () => {
    // KISAN200 requires minimum order of ₹999
    const resultBelowBand = validateCoupon(DEFAULT_COUPONS, 'KISAN200', 500);
    expect(resultBelowBand.valid).toBe(false);
    expect(resultBelowBand.error).toContain('Price band requirement not met');
    expect(resultBelowBand.diff).toBe(499);
  });

  it('successfully applies percentage discount when order meets or exceeds the price band', () => {
    // AGRI10: 10% on orders >= ₹500
    const result = validateCoupon(DEFAULT_COUPONS, 'AGRI10', 800);
    expect(result.valid).toBe(true);
    expect(result.discountAmount).toBe(80); // 10% of 800 = 80
  });

  it('caps the discount at maxDiscountAmount when specified', () => {
    // KISAN200: 15% on orders >= ₹999, max cap ₹200
    // 15% of 2000 is ₹300, capped at ₹200
    const result = validateCoupon(DEFAULT_COUPONS, 'KISAN200', 2000);
    expect(result.valid).toBe(true);
    expect(result.discountAmount).toBe(200);
  });

  it('correctly handles case-insensitivity and whitespace when typing coupon codes', () => {
    const result = validateCoupon(DEFAULT_COUPONS, '  kisan200  ', 1200);
    expect(result.valid).toBe(true);
    expect(result.coupon.code).toBe('KISAN200');
  });

  it('rejects nonexistent or inactive coupons', () => {
    const invalidResult = validateCoupon(DEFAULT_COUPONS, 'FAKECODE99', 2000);
    expect(invalidResult.valid).toBe(false);
    expect(invalidResult.error).toContain('is invalid');

    const inactiveCoupons = [
      {
        id: 'coupon_inactive',
        code: 'EXPIRED10',
        discountPercentage: 10,
        minOrderValue: 200,
        isActive: false,
      },
    ];
    const inactiveResult = validateCoupon(inactiveCoupons, 'EXPIRED10', 500);
    expect(inactiveResult.valid).toBe(false);
    expect(inactiveResult.error).toContain('inactive');
  });

  it('accurately calculates grand total with subtotal, coupon discount, and delivery fee', () => {
    const subtotal = 1200;
    const couponValidation = validateCoupon(DEFAULT_COUPONS, 'MEGA20', subtotal); // Min order 1500, fails on 1200
    expect(couponValidation.valid).toBe(false);

    // KISAN200: 15% of 1200 = 180 (under 200 cap)
    const kisanVal = validateCoupon(DEFAULT_COUPONS, 'KISAN200', subtotal);
    expect(kisanVal.valid).toBe(true);
    expect(kisanVal.discountAmount).toBe(180);

    const deliveryFee = 0; // Free delivery >= 1000 standard
    const handlingFee = 4;
    const grandTotal = subtotal - kisanVal.discountAmount + deliveryFee + handlingFee;
    expect(grandTotal).toBe(1200 - 180 + 0 + 4);
    expect(grandTotal).toBe(1024);
  });
});
