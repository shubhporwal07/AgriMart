import { describe, it, expect, vi } from 'vitest';

describe('Home Screen Showcase Configuration & Limits', () => {
  const HOME_SHOWCASE_LIMITS = {
    heroDeals: 2,
    flashDeals: 6,
  };

  const simulateAddToShowcase = (currentShowcase, section, newProductId) => {
    const limit = HOME_SHOWCASE_LIMITS[section];
    if (!limit) {
      throw new Error(`Invalid showcase section: ${section}`);
    }

    const currentList = currentShowcase[section] || [];
    if (currentList.includes(newProductId)) {
      throw new Error('This product is already featured in this home screen section.');
    }

    if (currentList.length >= limit) {
      throw new Error(`Limit reached! The ${section} section cannot exceed ${limit} products. Please remove an existing item first to make room.`);
    }

    return {
      ...currentShowcase,
      [section]: [...currentList, newProductId],
    };
  };

  const simulateRemoveFromShowcase = (currentShowcase, section, productId) => {
    return {
      ...currentShowcase,
      [section]: (currentShowcase[section] || []).filter((id) => id !== productId),
    };
  };

  it('enforces strict limit of 2 products for Hero Deals section', () => {
    const initialShowcase = {
      heroDeals: ['agri-kisan-starter-kit', 'agri-soil-booster-combo'],
      flashDeals: [],
    };

    expect(initialShowcase.heroDeals).toHaveLength(2);

    // Attempting to add a 3rd product MUST throw a rejection error
    expect(() => {
      simulateAddToShowcase(initialShowcase, 'heroDeals', 'agri-hybrid-tomato-seeds');
    }).toThrow(/Limit reached! The heroDeals section cannot exceed 2 products/);
  });

  it('enforces strict limit of 6 products for Flash Deals section', () => {
    const initialShowcase = {
      heroDeals: [],
      flashDeals: ['prod-1', 'prod-2', 'prod-3', 'prod-4', 'prod-5', 'prod-6'],
    };

    expect(initialShowcase.flashDeals).toHaveLength(6);

    // Attempting to add a 7th product MUST throw a rejection error
    expect(() => {
      simulateAddToShowcase(initialShowcase, 'flashDeals', 'prod-7');
    }).toThrow(/Limit reached! The flashDeals section cannot exceed 6 products/);
  });

  it('rejects adding duplicate products already present in the section', () => {
    const initialShowcase = {
      heroDeals: ['agri-kisan-starter-kit'],
      flashDeals: [],
    };

    expect(() => {
      simulateAddToShowcase(initialShowcase, 'heroDeals', 'agri-kisan-starter-kit');
    }).toThrow(/already featured/);
  });

  it('allows adding a new product once an existing slot is freed via removal', () => {
    let showcase = {
      heroDeals: ['agri-kisan-starter-kit', 'agri-soil-booster-combo'],
      flashDeals: [],
    };

    // Remove one product
    showcase = simulateRemoveFromShowcase(showcase, 'heroDeals', 'agri-soil-booster-combo');
    expect(showcase.heroDeals).toHaveLength(1);

    // Now adding a new product succeeds
    showcase = simulateAddToShowcase(showcase, 'heroDeals', 'agri-hybrid-tomato-seeds');
    expect(showcase.heroDeals).toHaveLength(2);
    expect(showcase.heroDeals).toContain('agri-hybrid-tomato-seeds');
  });
});
