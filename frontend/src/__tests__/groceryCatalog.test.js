import { describe, it, expect } from 'vitest';
import { DEFAULT_AGRI_PRODUCTS } from '../data/defaultProducts';

describe('AgriMart Seed & Fertilizer Catalog Schema & Integrity', () => {
  it('should contain default agricultural catalog items', () => {
    expect(DEFAULT_AGRI_PRODUCTS).toBeDefined();
    expect(DEFAULT_AGRI_PRODUCTS.length).toBeGreaterThan(0);
  });

  it('every product must have standard seed/fertilizer specifications', () => {
    DEFAULT_AGRI_PRODUCTS.forEach((product) => {
      // Identity & Pricing
      expect(product.id).toBeDefined();
      expect(product.name).toBeTruthy();
      expect(typeof product.price).toBe('number');
      expect(product.price).toBeGreaterThan(0);
      expect(typeof product.mrp).toBe('number');
      expect(product.mrp).toBeGreaterThanOrEqual(product.price);

      // Pack size / unit & Agricultural category
      expect(product.unit || product.packSize).toBeTruthy();
      expect(product.category).toBeTruthy();

      // Express dispatch tag
      expect(product.deliveryTime || product.deliverySlot).toBeTruthy();

      // Shelf life & Viability instructions
      expect(product.shelfLife).toBeTruthy();
      expect(product.storageInstructions).toBeTruthy();

      // Compliance & Statutory License (Seed Act 1966 / FCO 1985)
      expect(product.fssaiLicence).toBeTruthy();
      expect(product.origin).toBeTruthy();

      // Agronomic facts / guaranteed analysis
      expect(product.nutritionalFacts).toBeDefined();
      expect(Object.keys(product.nutritionalFacts).length).toBeGreaterThan(0);
    });
  });

  it('should accurately calculate or format discount percentage where applicable', () => {
    DEFAULT_AGRI_PRODUCTS.forEach((product) => {
      if (product.discount && product.discount.includes('% OFF')) {
        const expectedPercent = Math.round(((product.mrp - product.price) / product.mrp) * 100);
        const parsedPercent = parseInt(product.discount, 10);
        expect(Math.abs(parsedPercent - expectedPercent)).toBeLessThanOrEqual(2);
      }
    });
  });

  it('should include core agricultural categories', () => {
    const categories = DEFAULT_AGRI_PRODUCTS.map(p => p.category);
    expect(categories).toContain('Vegetable Seeds');
    expect(categories).toContain('Grain & Crop Seeds');
    expect(categories).toContain('Organic Manure & Compost');
    expect(categories).toContain('NPK & Water Soluble');
  });
});
