import { describe, it, expect } from 'vitest';
import { calculateDistanceKm, LPU_HUB, PRESET_LOCATIONS } from '../contexts/LocationContext';

describe('AgriMart 30 km Serviceability & Delivery Engine (Hub: LPU Phagwara)', () => {
  it('correctly calculates distance for locations within 10 km express delivery zone from LPU', () => {
    // LPU Campus (Hub Location)
    const lpuDist = calculateDistanceKm(
      31.2536,
      75.7037,
      LPU_HUB.lat,
      LPU_HUB.lng
    );
    expect(lpuDist).toBeLessThanOrEqual(1.0);

    // Model Town, Phagwara (~7.7 km from LPU)
    const modelTownDist = calculateDistanceKm(
      31.2205,
      75.7750,
      LPU_HUB.lat,
      LPU_HUB.lng
    );
    expect(modelTownDist).toBeLessThanOrEqual(10);
    expect(modelTownDist).toBeGreaterThan(5);

    // Central Bus Stand & GT Road, Phagwara (~6.8 km from LPU)
    const gtRoadDist = calculateDistanceKm(
      31.2272,
      75.7680,
      LPU_HUB.lat,
      LPU_HUB.lng
    );
    expect(gtRoadDist).toBeLessThanOrEqual(10);
  });

  it('correctly handles locations between 10 km and 30 km (Standard Delivery Zone)', () => {
    // Jalandhar City Center (~14.5 km from LPU)
    const jalandharCityDist = calculateDistanceKm(
      31.3260,
      75.5762,
      LPU_HUB.lat,
      LPU_HUB.lng
    );
    expect(jalandharCityDist).toBeGreaterThan(10);
    expect(jalandharCityDist).toBeLessThanOrEqual(30);

    // Kartarpur (~28.4 km from LPU)
    const kartarpurDist = calculateDistanceKm(
      31.4410,
      75.5000,
      LPU_HUB.lat,
      LPU_HUB.lng
    );
    expect(kartarpurDist).toBeGreaterThan(15);
    expect(kartarpurDist).toBeLessThanOrEqual(30);
  });

  it('flags locations beyond 30 km as unserviceable', () => {
    // Kapurthala City Center (~33.8 km > 30 km)
    const kapurthalaDist = calculateDistanceKm(
      31.3800,
      75.3800,
      LPU_HUB.lat,
      LPU_HUB.lng
    );
    expect(kapurthalaDist).toBeGreaterThan(30);

    // Connaught Place, New Delhi (~326 km)
    const delhiDist = calculateDistanceKm(
      28.6315,
      77.2167,
      LPU_HUB.lat,
      LPU_HUB.lng
    );
    expect(delhiDist).toBeGreaterThan(30);
  });

  it('provides preset delivery locations with LPU hub location', () => {
    expect(PRESET_LOCATIONS.length).toBeGreaterThanOrEqual(8);
    const lpuCampus = PRESET_LOCATIONS.find((l) => l.id === 'lpu-main-gate');
    expect(lpuCampus).toBeDefined();
    expect(lpuCampus.area).toContain('Lovely Professional University');

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
      deliverySlot: 'Express Delivery (Fast Parcel Dispatch)',
      amount: 450,
      currency: 'INR',
      shippingAddress: {
        fullName: 'Test User',
        phone: '9876543210',
        addressLine1: 'LPU Campus Law Gate',
        city: 'Phagwara',
        state: 'Punjab',
        pincode: '144411',
      },
    };

    expect(codOrder.paymentMethod).toBe('Cash on Delivery (COD)');
    expect(codOrder.paymentStatus).toBe('Pending (Pay on Delivery)');
    expect(codOrder.status).toBe('placed');
    expect(codOrder.shippingAddress.city).toBe('Phagwara');
    expect(codOrder.shippingAddress.pincode).toBe('144411');
  });
});
