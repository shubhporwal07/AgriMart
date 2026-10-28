import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SidebarFilters from '../components/SidebarFilters';

const mockUpdateFilter = vi.fn();
const mockClearAllFilters = vi.fn();

vi.mock('../contexts/ProductContext', () => ({
  useProducts: () => ({
    filters: {
      category: 'all',
      inStockOnly: false,
      organicOnly: false,
      priceRange: 'all',
      minRating: 0,
      sortBy: 'recommended',
    },
    updateFilter: mockUpdateFilter,
    clearAllFilters: mockClearAllFilters,
    filteredProducts: [],
    products: [
      { id: '1', category: 'Vegetable Seeds', inStock: true, price: 50 },
      { id: '2', category: 'Grain & Crop Seeds', inStock: true, price: 40 },
    ],
  }),
}));

describe('SidebarFilters Component Integration', () => {
  it('renders agri categories and in-stock toggle', () => {
    render(<SidebarFilters />);

    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('In Stock Only')).toBeInTheDocument();
    expect(screen.getByText('Aisles & Categories')).toBeInTheDocument();
  });

  it('triggers updateFilter when toggling an agri category checkbox', () => {
    render(<SidebarFilters />);

    const vegetableSeedsLabel = screen.getByText('Vegetable Seeds');
    fireEvent.click(vegetableSeedsLabel);
    expect(mockUpdateFilter).toHaveBeenCalledWith('category', 'Vegetable Seeds', true);
  });

  it('renders AgriMart Germination Shield guarantee banner', () => {
    render(<SidebarFilters />);

    expect(screen.getByText('AgriMart Germination Shield')).toBeInTheDocument();
    expect(screen.getByText(/guaranteed germination/i)).toBeInTheDocument();
  });

  it('triggers updateFilter when clicking the In Stock Only checkbox', () => {
    render(<SidebarFilters />);

    const inStockToggle = screen.getByRole('checkbox', { name: '' });
    fireEvent.click(inStockToggle);
    expect(mockUpdateFilter).toHaveBeenCalledWith('inStockOnly', null, true);
  });
});
