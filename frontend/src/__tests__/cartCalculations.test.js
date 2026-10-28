import { describe, it, expect } from 'vitest';

describe('Gupta Mart Quick-Commerce Cart & Bill Breakdown Calculations', () => {
  const calculateCartBill = (items) => {
    const itemTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const mrpTotal = items.reduce((sum, item) => sum + (item.mrp || item.price * 1.2) * item.quantity, 0);
    const savings = Math.max(0, mrpTotal - itemTotal);
    const freeDeliveryThreshold = 299;
    const deliveryFee = itemTotal >= freeDeliveryThreshold || itemTotal === 0 ? 0 : 25;
    const handlingFee = itemTotal > 0 ? 4 : 0;
    const grandTotal = itemTotal + deliveryFee + handlingFee;

    return {
      itemTotal,
      mrpTotal,
      savings,
      deliveryFee,
      handlingFee,
      grandTotal,
    };
  };

  it('calculates total for empty cart correctly', () => {
    const bill = calculateCartBill([]);
    expect(bill.itemTotal).toBe(0);
    expect(bill.deliveryFee).toBe(0);
    expect(bill.handlingFee).toBe(0);
    expect(bill.grandTotal).toBe(0);
    expect(bill.savings).toBe(0);
  });

  it('adds ₹25 express delivery partner fee if subtotal is below ₹299', () => {
    const items = [
      { id: 'item-1', name: 'Farm Milk', price: 42, mrp: 45, quantity: 2 }, // ₹84
    ];
    const bill = calculateCartBill(items);
    expect(bill.itemTotal).toBe(84);
    expect(bill.mrpTotal).toBe(90);
    expect(bill.savings).toBe(6);
    expect(bill.deliveryFee).toBe(25);
    expect(bill.handlingFee).toBe(4);
    expect(bill.grandTotal).toBe(84 + 25 + 4); // ₹113
  });

  it('awards FREE express delivery when subtotal meets or exceeds ₹299', () => {
    const items = [
      { id: 'item-1', name: 'Cold Pressed Mustard Oil', price: 215, mrp: 260, quantity: 1 },
      { id: 'item-2', name: 'Chakki Fresh Atta 5kg', price: 245, mrp: 295, quantity: 1 },
    ];
    const bill = calculateCartBill(items);
    expect(bill.itemTotal).toBe(460); // 460 >= 299
    expect(bill.deliveryFee).toBe(0);
    expect(bill.handlingFee).toBe(4);
    expect(bill.grandTotal).toBe(464);
    expect(bill.savings).toBe((260 + 295) - 460); // ₹95 savings
  });
});
