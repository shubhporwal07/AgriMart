'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Dark Store Hub Definitions
export const LPU_HUB = {
  id: 'hub-lpu',
  name: 'AgriMart Kisan Hub @ LPU',
  area: 'Lovely Professional University (LPU), Phagwara - 144411',
  pincode: '144411',
  lat: 31.2536,
  lng: 75.7037,
  maxRadiusKm: 30, // Serviceable up to 30 km radius
};

// Aliases for compatibility across codebase
export const PHAGWARA_HUB = LPU_HUB;

export const ETAWAH_HUB = {
  id: 'hub-etawah',
  name: 'AgriMart Kisan Hub #02',
  area: 'Civil Lines, Etawah (Uttar Pradesh)',
  pincode: '206001',
  lat: 26.7769,
  lng: 79.0238,
  maxRadiusKm: 30,
};

// Haversine formula to compute distance in kilometers
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
    return null;
  }
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Preset locations for quick selection relative to LPU Central Hub
export const PRESET_LOCATIONS = [
  {
    id: 'lpu-main-gate',
    name: 'LPU Campus / Law Gate (Hub Location)',
    area: 'Lovely Professional University, Phagwara - 144411',
    lat: 31.2536,
    lng: 75.7037,
    tag: '⚡ Express (0.1 km)',
  },
  {
    id: 'phagwara-gt-road',
    name: 'Central Bus Stand & GT Road',
    area: 'Central Bus Stand, GT Road, Phagwara - 144401',
    lat: 31.2272,
    lng: 75.7680,
    tag: '⚡ Express (6.8 km)',
  },
  {
    id: 'phagwara-sugarmill',
    name: 'Sugar Mill Road, Phagwara',
    area: 'Sugar Mill Colony, Phagwara - 144401',
    lat: 31.2150,
    lng: 75.7620,
    tag: '⚡ Express (7.0 km)',
  },
  {
    id: 'phagwara-chahalnagar',
    name: 'Chahal Nagar, Phagwara',
    area: 'Chahal Nagar, Phagwara - 144402',
    lat: 31.2380,
    lng: 75.7820,
    tag: '⚡ Express (7.6 km)',
  },
  {
    id: 'phagwara-modeltown',
    name: 'Model Town, Phagwara',
    area: 'Model Town, Phagwara, Kapurthala - 144401',
    lat: 31.2205,
    lng: 75.7750,
    tag: '⚡ Express (7.7 km)',
  },
  {
    id: 'jalandhar-cantt',
    name: 'Jalandhar Cantt (Rama Mandi)',
    area: 'Rama Mandi, Jalandhar Cantt - 144005',
    lat: 31.2789,
    lng: 75.6190,
    tag: '⚡ Express (8.5 km)',
  },
  {
    id: 'jalandhar-city',
    name: 'Jalandhar City Center (Over 10 km)',
    area: 'Civil Lines, Jalandhar - 144001',
    lat: 31.3260,
    lng: 75.5762,
    tag: '🚚 Standard (14.5 km)',
  },
  {
    id: 'kartarpur-gt-road',
    name: 'Kartarpur Sub-Hub (Over 15 km)',
    area: 'GT Road, Kartarpur, Jalandhar - 144801',
    lat: 31.4410,
    lng: 75.5000,
    tag: '🚚 Standard (28.4 km)',
  },
  {
    id: 'kapurthala-center',
    name: 'Kapurthala City Center (Outside 30 km)',
    area: 'Sultanpur Road, Kapurthala - 144601',
    lat: 31.3800,
    lng: 75.3800,
    tag: '🚫 34 km away (Unserviceable)',
  },
  {
    id: 'delhi-cp',
    name: 'Connaught Place, New Delhi',
    area: 'Connaught Place, New Delhi - 110001',
    lat: 28.6315,
    lng: 77.2167,
    tag: '🚫 326 km away',
  },
];

/**
 * Calculates delivery fee based on delivery type ('express' | 'standard'), distance in km from LPU hub, and cart item total.
 * 
 * Rules:
 * - Distance > 30 km: Delivery not available (returns null).
 * - Express Delivery:
 *   - Available ONLY for distance <= 10.0 km.
 *   - <= 5.0 km radius: ₹50 extra.
 *   - 5.1 to 7.5 km radius: ₹100 extra.
 *   - 7.6 to 10.0 km radius: ₹150 extra.
 * - Standard / Normal Delivery:
 *   - Available for all serviceable distances up to 30.0 km.
 *   - Order total >= ₹1,000: FREE base fee (₹0).
 *   - Order total < ₹1,000: ₹20 base fee.
 *   - Distance surcharge if distance > 15 km: ₹50 extra for every 10 km bracket beyond 15 km.
 *     (e.g., 15.1–25.0 km: +₹50; 25.1–30.0 km: +₹100).
 * - Dispatch Timing: Daily 8:00 PM evening delivery vehicle dispatch.
 */
export function calculateDeliveryFee(deliveryType = 'express', distanceKm = 0.5, itemTotal = 0) {
  if (itemTotal === 0) return 0;
  const km = Number(distanceKm) || 0;

  // Over 30 km is unserviceable
  if (km > 30.0) {
    return null;
  }

  // Express delivery: strictly available under 10 km
  if (deliveryType === 'express') {
    if (km > 10.0) {
      // Fallback to standard fee if distance exceeds 10 km
      return calculateDeliveryFee('standard', km, itemTotal);
    }
    if (km <= 5.0) {
      return 50;
    } else if (km <= 7.5) {
      return 100;
    } else {
      return 150;
    }
  }

  // Standard delivery base fee
  const baseFee = itemTotal >= 1000 ? 0 : 20;

  // Surcharge for distance > 15 km (+₹50 per 10 km bracket beyond 15 km)
  let distanceSurcharge = 0;
  if (km > 15.0) {
    const extraKm = km - 15.0;
    const brackets = Math.ceil(extraKm / 10.0);
    distanceSurcharge = brackets * 50;
  }

  return baseFee + distanceSurcharge;
}

const LOCATION_STORAGE_KEY = 'agrimart_delivery_location_v3';
const LOCATION_PROMPTED_KEY = 'agrimart_location_prompted_v3';

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
  // Default to LPU Campus / Law Gate (hub location, 0.1 km)
  const [location, setLocationState] = useState(() => {
    const defaultLoc = PRESET_LOCATIONS[0];
    const dist = calculateDistanceKm(
      defaultLoc.lat,
      defaultLoc.lng,
      LPU_HUB.lat,
      LPU_HUB.lng
    );
    return {
      id: defaultLoc.id,
      name: defaultLoc.name,
      area: defaultLoc.area,
      lat: defaultLoc.lat,
      lng: defaultLoc.lng,
      distanceKm: dist,
      isServiceable: dist <= LPU_HUB.maxRadiusKm,
      deliveryTime: '⚡ Express & Standard',
      isDetected: false,
    };
  });

  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [calculatingGPS, setCalculatingGPS] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const [mounted, setMounted] = useState(false);

  // Helper to evaluate serviceability against LPU (primary) and Etawah (secondary)
  const evaluateLocation = useCallback((lat, lng, name, area, isDetected = false) => {
    const distToLPU = calculateDistanceKm(lat, lng, LPU_HUB.lat, LPU_HUB.lng);
    const distToEtawah = calculateDistanceKm(lat, lng, ETAWAH_HUB.lat, ETAWAH_HUB.lng);

    let isServiceable = false;
    let distanceKm = distToLPU;
    let activeHub = LPU_HUB;

    if (distToLPU !== null && distToLPU <= LPU_HUB.maxRadiusKm) {
      isServiceable = true;
      distanceKm = distToLPU;
      activeHub = LPU_HUB;
    } else if (distToEtawah !== null && distToEtawah <= ETAWAH_HUB.maxRadiusKm) {
      isServiceable = true;
      distanceKm = distToEtawah;
      activeHub = ETAWAH_HUB;
    } else {
      isServiceable = false;
      // Show distance to primary LPU hub
      distanceKm = distToLPU;
    }

    return {
      name,
      area,
      lat,
      lng,
      distanceKm,
      isServiceable,
      deliveryTime: isServiceable
        ? (distanceKm <= 10.0 ? '⚡ Express & Standard' : '🚚 Standard 8 PM')
        : 'Not Available (>30 km)',
      activeHubName: activeHub.name,
      isDetected,
    };
  }, []);

  // Set explicit location
  const selectLocation = useCallback(
    (loc) => {
      const evaluated = evaluateLocation(loc.lat, loc.lng, loc.name, loc.area, !!loc.isDetected);
      setLocationState(evaluated);
      try {
        localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(evaluated));
      } catch {
        // ignore
      }
      setLocationModalOpen(false);
    },
    [evaluateLocation]
  );

  // GPS HTML5 Geolocation detection
  const detectGPSLocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setCalculatingGPS(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // Check distance to Phagwara
        const dist = calculateDistanceKm(
          latitude,
          longitude,
          PHAGWARA_HUB.lat,
          PHAGWARA_HUB.lng
        );

        let areaName = 'My Current Location';
        if (dist <= 10) {
          areaName = 'Current Location (Phagwara Express Zone)';
        } else {
          areaName = `Current Location (${dist} km away)`;
        }

        const evaluated = evaluateLocation(
          latitude,
          longitude,
          'Current Location',
          `${areaName} • Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`,
          true
        );

        setLocationState(evaluated);
        try {
          localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(evaluated));
        } catch {
          // ignore
        }
        setCalculatingGPS(false);
        setLocationModalOpen(false);
      },
      (err) => {
        setCalculatingGPS(false);
        let msg = 'Unable to retrieve location.';
        if (err.code === 1) msg = 'Location permission denied. Please select your area manually.';
        else if (err.code === 2) msg = 'Location position unavailable. Please choose from the list.';
        else if (err.code === 3) msg = 'Location request timed out. Please try again.';
        setGpsError(msg);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  }, [evaluateLocation]);

  // Initial load from storage and initial entry prompt check
  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(LOCATION_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setLocationState(parsed);
      }

      // Check if first-time user has been prompted for location
      const hasPrompted = sessionStorage.getItem(LOCATION_PROMPTED_KEY);
      if (!hasPrompted) {
        sessionStorage.setItem(LOCATION_PROMPTED_KEY, 'true');
        // Trigger location prompt as soon as person enters site
        setLocationModalOpen(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const value = {
    location,
    isServiceable: location.isServiceable,
    distanceKm: location.distanceKm,
    deliveryTime: location.deliveryTime,
    locationModalOpen,
    setLocationModalOpen,
    selectLocation,
    detectGPSLocation,
    calculatingGPS,
    gpsError,
    calculateDeliveryFee: (type, total) => calculateDeliveryFee(type, location.distanceKm, total),
    primaryHub: PHAGWARA_HUB,
    secondaryHub: ETAWAH_HUB,
    presetLocations: PRESET_LOCATIONS,
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocationContext() {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    return {
      location: PRESET_LOCATIONS[0],
      isServiceable: true,
      deliveryTime: '⚡ Express Delivery',
      locationModalOpen: false,
      setLocationModalOpen: () => {},
      updateLocation: () => {},
      calculateDistance: () => 0,
      detectLiveLocation: () => {},
      detectingGPS: false,
      calculateDeliveryFee: (type, total) => calculateDeliveryFee(type, 1.8, total),
      presetLocations: PRESET_LOCATIONS,
    };
  }
  return ctx;
}
