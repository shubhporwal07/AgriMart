import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProductCard from '../components/ProductCard';

// Mock ProductContext
vi.mock('../contexts/ProductContext', () => ({
  useProducts: () => ({
    getItemQuantity: vi.fn(() => 0),
    addToCart: vi.fn(),
    updateCartQuantity: vi.fn(),
    removeFromCart: vi.fn(),
  }),
}));

describe('ProductCard Component', () => {
  const sampleProduct = {
    id: 'prod-seed-1',
    name: 'Hybrid F1 Royal Red Tomato Seeds',
    packSize: '10g Pouch (~3,000 seeds)',
    price: 145,
    mrp: 180,
    discount: '19% OFF',
    deliveryTime: '⚡ Fast Dispatch',
    rating: 4.8,
    reviewsCount: 1420,
    inStock: true,
    isOrganic: true,
    imageUrl: '/images/products/hybrid-tomato-seeds.png',
  };

  it('renders agri product name, pack size, price, and MRP strikethrough', () => {
    render(<ProductCard product={sampleProduct} onSelectProduct={vi.fn()} />);

    expect(screen.getByText('Hybrid F1 Royal Red Tomato Seeds')).toBeInTheDocument();
    expect(screen.getByText('10g Pouch (~3,000 seeds)')).toBeInTheDocument();
    expect(screen.getByText('₹145')).toBeInTheDocument();
    expect(screen.getByText('₹180')).toBeInTheDocument();
  });

  it('displays the express delivery badge and discount tag', () => {
    render(<ProductCard product={sampleProduct} onSelectProduct={vi.fn()} />);

    expect(screen.getByText('⚡ Fast Dispatch')).toBeInTheDocument();
    expect(screen.getByText('19% OFF')).toBeInTheDocument();
  });

  it('renders the ADD action button', () => {
    render(<ProductCard product={sampleProduct} onSelectProduct={vi.fn()} />);

    const addButton = screen.getByRole('button', { name: /add to cart/i });
    expect(addButton).toBeInTheDocument();
  });
});
