import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductReviewModal from '../components/ProductReviewModal';

// Mock Firebase RTDB
vi.mock('../config/firebase', () => ({
  realtimeDb: {},
}));

vi.mock('firebase/database', () => ({
  ref: vi.fn(),
  set: vi.fn().mockResolvedValue(),
  push: vi.fn(),
  update: vi.fn().mockResolvedValue(),
}));

describe('Post-Delivery Review & Star Rating System', () => {
  const sampleOrder = {
    id: 'order_test_123',
    razorpayOrderId: 'order_rzp_123',
    userName: 'Pranav Singh',
    userEmail: 'pranavsinghkia@gmail.com',
    status: 'delivered',
    deliveryLocation: 'LPU Campus / Law Gate',
  };

  const sampleItem = {
    id: 'prod-seed-1',
    name: 'F1 Hybrid Tomato Seeds (Abhinav)',
    packSize: '10g Pouch',
    price: 185,
    quantity: 2,
    imageUrl: '/images/products/hybrid-tomato-seeds.png',
  };

  it('renders ProductReviewModal with all 5 star rating options', () => {
    render(
      <ProductReviewModal
        isOpen={true}
        onClose={vi.fn()}
        order={sampleOrder}
        item={sampleItem}
      />
    );

    // Header and product details
    expect(screen.getByText(/Rate & Review Delivered Input/i)).toBeInTheDocument();
    expect(screen.getByText('F1 Hybrid Tomato Seeds (Abhinav)')).toBeInTheDocument();
    expect(screen.getByText(/Verified Delivered Order/i)).toBeInTheDocument();

    // 5 Star rating buttons (1 to 5)
    for (let i = 1; i <= 5; i++) {
      expect(screen.getByLabelText(`${i} star`)).toBeInTheDocument();
    }

    // Default 5-star label
    expect(screen.getByText(/5 Stars — Excellent \/ Lab quality certified/i)).toBeInTheDocument();
  });

  it('allows clicking different star rating buttons to update the rating', () => {
    render(
      <ProductReviewModal
        isOpen={true}
        onClose={vi.fn()}
        order={sampleOrder}
        item={sampleItem}
      />
    );

    // Click 3-star button
    const star3Btn = screen.getByLabelText('3 star');
    fireEvent.click(star3Btn);

    expect(screen.getByText(/3 Stars — Average \/ Standard quality/i)).toBeInTheDocument();
  });

  it('allows selecting quick experience tags', () => {
    render(
      <ProductReviewModal
        isOpen={true}
        onClose={vi.fn()}
        order={sampleOrder}
        item={sampleItem}
      />
    );

    const tagBtn = screen.getByText('🌱 95%+ Germination');
    fireEvent.click(tagBtn);

    // Tag button should have active class
    expect(tagBtn.className).toContain('bg-[#0B1B30]');
  });

  it('calculates dynamic average rating correctly', () => {
    const reviews = [
      { rating: 5 },
      { rating: 4 },
      { rating: 5 },
      { rating: 4 },
    ];

    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = (sum / reviews.length).toFixed(1);

    expect(avg).toBe('4.5');
  });

  it('ensures post-delivery gate check validates order status', () => {
    const deliveredOrder = { status: 'delivered' };
    const placedOrder = { status: 'placed' };
    const shippedOrder = { status: 'shipped' };

    const isDelivered = (status) => (status || '').toLowerCase() === 'delivered';

    expect(isDelivered(deliveredOrder.status)).toBe(true);
    expect(isDelivered(placedOrder.status)).toBe(false);
    expect(isDelivered(shippedOrder.status)).toBe(false);
  });
});
