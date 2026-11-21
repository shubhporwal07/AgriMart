import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProductDetailsModal from '../components/ProductDetailsModal';

// Mock contexts
vi.mock('../contexts/ProductContext', () => ({
  useProducts: () => ({
    products: [],
    getItemQuantity: vi.fn(() => 0),
    addToCart: vi.fn(),
    updateCartQuantity: vi.fn(),
    removeFromCart: vi.fn(),
    isInWishlist: vi.fn(() => false),
    toggleWishlist: vi.fn(),
  }),
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
  }),
}));

vi.mock('../config/firebase', () => ({
  realtimeDb: {},
}));

vi.mock('firebase/database', () => ({
  ref: vi.fn(),
  get: vi.fn().mockResolvedValue({ exists: () => false }),
}));

describe('ProductDetailsModal Image Deduplication & Gallery', () => {
  it('deduplicates duplicate copies of the same image (no duplicate thumbnails)', () => {
    // Product where imageUrl and imageDatas contain the same URL
    const productWithDuplicates = {
      id: 'agri-dap-granular-fertilizer',
      name: 'DAP Enriched Granular Fertilizer 5kg',
      category: 'NPK & Water Soluble',
      price: 290,
      mrp: 355,
      imageUrl: '/images/products/dap-fertilizer-5kg.png',
      imageDatas: [
        '/images/products/dap-fertilizer-5kg.png',
        // Also contains the accidental red chilli placeholder that must be filtered
        'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=600&q=80',
      ],
      highlights: ['High phosphate'],
    };

    const { container } = render(
      <ProductDetailsModal
        product={productWithDuplicates}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    // Primary image is rendered
    const images = container.querySelectorAll('img');
    // Only 1 image is in the gallery, so no thumbnail buttons should exist
    const thumbnailButtons = container.querySelectorAll('.w-16.h-16.rounded-xl');
    expect(thumbnailButtons.length).toBe(0);

    // The single displayed image must be the authentic DAP fertilizer image
    const mainImg = container.querySelector('.aspect-square img');
    expect(mainImg).toHaveAttribute('src', '/images/products/dap-fertilizer-5kg.png');
  });

  it('renders distinct thumbnails when product actually has multiple unique images', () => {
    const productWithMultipleUnique = {
      id: 'agri-knapsack-sprayer-16l',
      name: 'Battery Knapsack Sprayer 16L',
      category: 'Farm Sprayers & Agri Tools',
      price: 1850,
      mrp: 2400,
      imageUrl: '/images/products/knapsack-1.png',
      imageDatas: [
        '/images/products/knapsack-1.png',
        '/images/products/knapsack-2-nozzle.png',
        '/images/products/knapsack-3-battery.png',
      ],
      highlights: ['16L capacity'],
    };

    const { container } = render(
      <ProductDetailsModal
        product={productWithMultipleUnique}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    // Exactly 3 unique thumbnail buttons (no duplicate of knapsack-1)
    const thumbnailButtons = container.querySelectorAll('.w-16.h-16.rounded-xl');
    expect(thumbnailButtons.length).toBe(3);
  });
});
