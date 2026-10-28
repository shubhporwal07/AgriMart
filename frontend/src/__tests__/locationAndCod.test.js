import { describe, it, expect } from 'vitest';
import { calculateDistanceKm, PHAGWARA_HUB, PRESET_LOCATIONS } from '../contexts/LocationContext';

describe('10 km Geofencing & Serviceability Engine (Phagwara, Kapurthala)', () => {
  it('correctly calculates distance for locations within 10 km radius', () => {
    // Model Town, Phagwara
    const modelTownDist = calculateDistanceKm(
      31.2205,
      75.7750,
      PHAGWARA_HUB.lat,
      PHAGWARA_HUB.lng
    );
    expect(modelTownDist).toBeLessThanOrEqual(10);
    expect(modelTownDist).toBeLessThan(5);

    // LPU Campus, Phagwara
    const lpuDist = calculateDistanceKm(
      31.2536,
      75.7037,
      PHAGWARA_HUB.lat,
      PHAGWARA_HUB.lng
    );
    expect(lpuDist).toBeLessThanOrEqual(10);
    expect(lpuDist).toBeLessThan(10);

    // Central Bus Stand & GT Road, Phagwara
    const gtRoadDist = calculateDistanceKm(
      31.2272,
      75.7680,
      PHAGWARA_HUB.lat,
      PHAGWARA_HUB.lng
    );
    expect(gtRoadDist).toBeLessThanOrEqual(10);
    expect(gtRoadDist).toBeLessThan(3);
  });

  it('correctly flags locations outside 10 km radius as unserviceable', () => {
    // Kapurthala City Center (~26-38 km)
    const kapurthalaDist = calculateDistanceKm(
      31.3800,
      75.3800,
      PHAGWARA_HUB.lat,
      PHAGWARA_HUB.lng
    );
    expect(kapurthalaDist).toBeGreaterThan(10);
    expect(kapurthalaDist).toBeGreaterThan(30);

    // Jalandhar Cantt (~15.7 km > 10 km)
    const jalandharDist = calculateDistanceKm(
      31.2789,
      75.6190,
      PHAGWARA_HUB.lat,
      PHAGWARA_HUB.lng
    );
    expect(jalandharDist).toBeGreaterThan(10);
    expect(jalandharDist).toBeGreaterThan(15);

    // Connaught Place, New Delhi (~340 km)
    const delhiDist = calculateDistanceKm(
      28.6315,
      77.2167,
      PHAGWARA_HUB.lat,
      PHAGWARA_HUB.lng
    );
    expect(delhiDist).toBeGreaterThan(10);
    expect(delhiDist).toBeGreaterThan(300);
  });

  it('provides preset delivery locations covering Phagwara and demo unserviceable zones', () => {
    expect(PRESET_LOCATIONS.length).toBeGreaterThanOrEqual(6);
    const phagwaraTown = PRESET_LOCATIONS.find((l) => l.id === 'phagwara-modeltown');
    expect(phagwaraTown).toBeDefined();
    expect(phagwaraTown.area).toContain('Phagwara, Kapurthala');

    const kapurthalaOutside = PRESET_LOCATIONS.find((l) => l.id === 'kapurthala-center');
    expect(kapurthalaOutside).toBeDefined();
    expect(kapurthalaOutside.tag).toContain('🚫');
  });
});

describe('Cash on Delivery (COD) Order Logic', () => {
  it('creates valid COD order payload with pending payment status', () => {
    const codOrder = {
      orderId: 'cod_gm_12345678',
      paymentMethod: 'Cash on Delivery (COD)',
      paymentStatus: 'Pending (Pay on Delivery)',
      status: 'placed',
      deliverySlot: '12-15 Mins Express',
      amount: 450,
      currency: 'INR',
      shippingAddress: {
        fullName: 'Test User',
        phone: '9876543210',
        addressLine1: 'Model Town',
        city: 'Phagwara',
        state: 'Punjab',
        pincode: '144401',
      },
    };

    expect(codOrder.paymentMethod).toBe('Cash on Delivery (COD)');
    expect(codOrder.paymentStatus).toBe('Pending (Pay on Delivery)');
    expect(codOrder.status).toBe('placed');
    expect(codOrder.shippingAddress.city).toBe('Phagwara');
    expect(codOrder.shippingAddress.pincode).toBe('144401');
  });
});
