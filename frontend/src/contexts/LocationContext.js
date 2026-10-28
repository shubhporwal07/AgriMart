'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Dark Store Hub Definitions
export const PHAGWARA_HUB = {
  id: 'hub-phagwara',
  name: 'AgriMart Kisan Hub #01',
  area: 'Phagwara, Kapurthala (Punjab)',
  pincode: '144401',
  lat: 31.2240,
  lng: 75.7708,
  maxRadiusKm: 10,
};

export const ETAWAH_HUB = {
  id: 'hub-etawah',
  name: 'AgriMart Kisan Hub #02',
  area: 'Etawah (Uttar Pradesh)',
  pincode: '206001',
  lat: 26.7769,
  lng: 79.0238,
  maxRadiusKm: 10,
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

// Preset locations for quick selection and easy testing of both states
export const PRESET_LOCATIONS = [
  {
    id: 'phagwara-modeltown',
    name: 'Model Town, Phagwara',
    area: 'Model Town, Phagwara, Kapurthala - 144401',
    lat: 31.2205,
    lng: 75.7750,
    tag: '⚡ 10 mins (1.8 km)',
  },
  {
    id: 'phagwara-lpu',
    name: 'LPU Campus / Law Gate',
    area: 'Lovely Professional University, Phagwara - 144411',
    lat: 31.2536,
    lng: 75.7037,
    tag: '⚡ 14 mins (5.2 km)',
  },
  {
    id: 'phagwara-gt-road',
    name: 'GT Road & Bus Stand',
    area: 'Central Bus Stand, GT Road, Phagwara - 144401',
    lat: 31.2272,
    lng: 75.7680,
    tag: '⚡ 9 mins (1.2 km)',
  },
  {
    id: 'phagwara-sugarmill',
    name: 'Sugar Mill Road, Phagwara',
    area: 'Sugar Mill Colony, Phagwara - 144401',
    lat: 31.2150,
    lng: 75.7620,
    tag: '⚡ 11 mins (2.5 km)',
  },
  {
    id: 'phagwara-chahalnagar',
    name: 'Chahal Nagar, Phagwara',
    area: 'Chahal Nagar, Phagwara - 144402',
    lat: 31.2380,
    lng: 75.7820,
    tag: '⚡ 12 mins (3.1 km)',
  },
  {
    id: 'etawah-hub',
    name: 'Civil Lines, Etawah (Secondary Hub)',
    area: 'Civil Lines, Etawah, UP - 206001',
    lat: 26.7769,
    lng: 79.0238,
    tag: '⚡ 12 mins (Etawah Pod)',
  },
  {
    id: 'jalandhar-cantt',
    name: 'Jalandhar Cantt (Outside 10 km)',
    area: 'Jalandhar Cantt, Punjab - 144005',
    lat: 31.2789,
    lng: 75.6190,
    tag: '🚫 22 km away',
  },
  {
    id: 'kapurthala-center',
    name: 'Kapurthala City Center (Outside 10 km)',
    area: 'Sultanpur Road, Kapurthala - 144601',
    lat: 31.3800,
    lng: 75.3800,
    tag: '🚫 38 km away',
  },
  {
    id: 'delhi-cp',
    name: 'Connaught Place, New Delhi',
    area: 'Connaught Place, New Delhi - 110001',
    lat: 28.6315,
    lng: 77.2167,
    tag: '🚫 340 km away',
  },
];

const LOCATION_STORAGE_KEY = 'gupta_mart_delivery_location_v2';
const LOCATION_PROMPTED_KEY = 'gupta_mart_location_prompted_v2';

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
  // Default to Phagwara Model Town (serviceable)
  const [location, setLocationState] = useState(() => {
    const defaultLoc = PRESET_LOCATIONS[0];
    const dist = calculateDistanceKm(
      defaultLoc.lat,
      defaultLoc.lng,
      PHAGWARA_HUB.lat,
      PHAGWARA_HUB.lng
    );
    return {
      id: defaultLoc.id,
      name: defaultLoc.name,
      area: defaultLoc.area,
      lat: defaultLoc.lat,
      lng: defaultLoc.lng,
      distanceKm: dist,
      isServiceable: dist <= PHAGWARA_HUB.maxRadiusKm,
      deliveryTime: '⚡ 10 Mins',
      isDetected: false,
    };
  });

  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [calculatingGPS, setCalculatingGPS] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const [mounted, setMounted] = useState(false);

  // Helper to evaluate serviceability against Phagwara (primary) and Etawah (secondary)
  const evaluateLocation = useCallback((lat, lng, name, area, isDetected = false) => {
    const distToPhagwara = calculateDistanceKm(lat, lng, PHAGWARA_HUB.lat, PHAGWARA_HUB.lng);
    const distToEtawah = calculateDistanceKm(lat, lng, ETAWAH_HUB.lat, ETAWAH_HUB.lng);

    let isServiceable = false;
    let distanceKm = distToPhagwara;
    let activeHub = PHAGWARA_HUB;

    if (distToPhagwara !== null && distToPhagwara <= PHAGWARA_HUB.maxRadiusKm) {
      isServiceable = true;
      distanceKm = distToPhagwara;
      activeHub = PHAGWARA_HUB;
    } else if (distToEtawah !== null && distToEtawah <= ETAWAH_HUB.maxRadiusKm) {
      isServiceable = true;
      distanceKm = distToEtawah;
      activeHub = ETAWAH_HUB;
    } else {
      isServiceable = false;
      // Show distance to primary Phagwara hub
      distanceKm = distToPhagwara;
    }

    const deliveryMins = isServiceable
      ? Math.max(9, Math.min(15, Math.round(8 + (distanceKm || 1) * 1.5)))
      : null;

    return {
      name,
      area,
      lat,
      lng,
      distanceKm,
      isServiceable,
      deliveryTime: isServiceable ? `⚡ ${deliveryMins} Mins` : 'Not Available',
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
    primaryHub: PHAGWARA_HUB,
    secondaryHub: ETAWAH_HUB,
    presetLocations: PRESET_LOCATIONS,
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocationContext() {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return ctx;
}
