import { describe, it, expect } from 'vitest';
import { calculateDeliveryFee } from '../contexts/LocationContext';

describe('AgriMart Delivery Tier & Bill Breakdown Calculations (Hub: LPU)', () => {
  const calculateCartBill = (items, deliveryType = 'express', distanceKm = 0.5) => {
    const itemTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const mrpTotal = items.reduce((sum, item) => sum + (item.mrp || item.price * 1.2) * item.quantity, 0);
    const savings = Math.max(0, mrpTotal - itemTotal);
    const deliveryFee = calculateDeliveryFee(deliveryType, distanceKm, itemTotal);
    const handlingFee = itemTotal > 0 ? 4 : 0;
    const grandTotal = deliveryFee !== null ? itemTotal + deliveryFee + handlingFee : null;

    return {
      itemTotal,
      mrpTotal,
      savings,
      deliveryFee,
      handlingFee,
      grandTotal,
    };
  };

  it('calculates total for empty cart correctly (₹0 delivery fee)', () => {
    const bill = calculateCartBill([]);
    expect(bill.itemTotal).toBe(0);
    expect(bill.deliveryFee).toBe(0);
    expect(bill.handlingFee).toBe(0);
    expect(bill.grandTotal).toBe(0);
  });

  describe('Express Delivery Pricing (Available <= 10 km from LPU)', () => {
    it('charges ₹50 for express delivery within 5 km radius of LPU', () => {
      const items = [{ id: '1', name: 'Seeds', price: 400, mrp: 500, quantity: 1 }];
      const bill = calculateCartBill(items, 'express', 2.5); // 2.5 km <= 5 km
      expect(bill.deliveryFee).toBe(50);
      expect(bill.grandTotal).toBe(400 + 50 + 4); // ₹454
    });

    it('charges ₹100 for express delivery between 5.1 km and 7.5 km radius', () => {
      const items = [{ id: '1', name: 'Seeds', price: 400, mrp: 500, quantity: 1 }];
      const bill = calculateCartBill(items, 'express', 6.8); // 6.8 km (e.g. GT Road Phagwara)
      expect(bill.deliveryFee).toBe(100);
      expect(bill.grandTotal).toBe(400 + 100 + 4); // ₹504
    });

    it('charges ₹150 for express delivery between 7.6 km and 10 km radius', () => {
      const items = [{ id: '1', name: 'Seeds', price: 400, mrp: 500, quantity: 1 }];
      const bill = calculateCartBill(items, 'express', 8.5); // 8.5 km (e.g. Rama Mandi)
      expect(bill.deliveryFee).toBe(150);
      expect(bill.grandTotal).toBe(400 + 150 + 4); // ₹554
    });
  });

  describe('Standard / Normal Delivery Pricing (Available <= 30 km)', () => {
    it('charges ₹20 base fee for standard delivery under 15 km if order < ₹1,000', () => {
      const items = [{ id: '1', name: 'Organic Fertilizer', price: 650, mrp: 800, quantity: 1 }];
      const bill = calculateCartBill(items, 'standard', 12.0); // 12 km <= 15 km
      expect(bill.itemTotal).toBe(650);
      expect(bill.deliveryFee).toBe(20);
      expect(bill.grandTotal).toBe(650 + 20 + 4); // ₹674
    });

    it('awards FREE standard base delivery if order is ₹1,000 or greater within 15 km', () => {
      const items = [
        { id: '1', name: 'Solar Trap', price: 750, mrp: 950, quantity: 1 },
        { id: '2', name: 'Bio Fungicide', price: 350, mrp: 450, quantity: 1 },
      ]; // Total = ₹1,100
      const bill = calculateCartBill(items, 'standard', 8.0);
      expect(bill.itemTotal).toBe(1100);
      expect(bill.deliveryFee).toBe(0); // FREE
      expect(bill.grandTotal).toBe(1100 + 0 + 4); // ₹1104
    });

    it('adds +₹50 distance surcharge for delivery between 15.1 km and 25.0 km', () => {
      const items = [{ id: '1', name: 'Fertilizer', price: 500, mrp: 600, quantity: 1 }];
      const bill = calculateCartBill(items, 'standard', 20.0); // 20 km > 15 km
      expect(bill.deliveryFee).toBe(20 + 50); // ₹70 (₹20 base + ₹50 surcharge)
      expect(bill.grandTotal).toBe(500 + 70 + 4); // ₹574
    });

    it('adds +₹100 distance surcharge for delivery between 25.1 km and 30.0 km', () => {
      const items = [{ id: '1', name: 'Basmati Seeds', price: 1200, mrp: 1500, quantity: 1 }]; // >= 1000, base FREE
      const bill = calculateCartBill(items, 'standard', 28.4); // Kartarpur ~28.4 km
      expect(bill.itemTotal).toBe(1200);
      expect(bill.deliveryFee).toBe(0 + 100); // Base ₹0 + ₹100 surcharge
      expect(bill.grandTotal).toBe(1200 + 100 + 4); // ₹1304
    });

    it('returns null (unserviceable) for distances beyond 30 km', () => {
      const items = [{ id: '1', name: 'Seeds', price: 500, mrp: 600, quantity: 1 }];
      const bill = calculateCartBill(items, 'standard', 33.8); // Kapurthala ~34 km
      expect(bill.deliveryFee).toBeNull();
      expect(bill.grandTotal).toBeNull();
    });
  });
});
