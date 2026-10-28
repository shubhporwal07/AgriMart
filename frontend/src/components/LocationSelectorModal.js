'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocationContext } from '../contexts/LocationContext';

export default function LocationSelectorModal() {
  const {
    location,
    locationModalOpen,
    setLocationModalOpen,
    selectLocation,
    detectGPSLocation,
    calculatingGPS,
    gpsError,
    presetLocations,
    primaryHub,
  } = useLocationContext();

  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (locationModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [locationModalOpen]);

  if (!locationModalOpen || !mounted || typeof document === 'undefined') {
    return null;
  }

  const filteredLocations = presetLocations.filter(
    (loc) =>
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.area.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const serviceableList = filteredLocations.filter((loc) => !loc.id.includes('outside') && !loc.tag.includes('🚫'));
  const unserviceableList = filteredLocations.filter((loc) => loc.tag.includes('🚫'));

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={() => setLocationModalOpen(false)}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto my-auto relative z-10 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#142B4A] text-[26px]">pin_drop</span>
            <div>
              <h3 className="font-headline font-extrabold text-lg text-slate-900 leading-tight">
                Select Delivery Location
              </h3>
              <p className="text-[11px] text-[#5A6B82] leading-tight mt-0.5">
                12-min express delivery within 10 km of Phagwara Dark Pod (Kapurthala)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setLocationModalOpen(false)}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Current Active Location Card */}
        <div className="my-4 p-3.5 rounded-2xl bg-[#F7F9FC] border border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span
              className={`material-symbols-outlined text-[22px] ${
                location.isServiceable ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {location.isServiceable ? 'check_circle' : 'error'}
            </span>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-[#5A6B82]">Current Selected Area</span>
              <span className="text-xs font-extrabold text-[#142B4A] truncate max-w-[260px]">
                {location.name || location.area}
              </span>
            </div>
          </div>
          <span
            className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 ${
              location.isServiceable
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-rose-100 text-rose-800'
            }`}
          >
            {location.isServiceable ? 'In 10km Zone' : 'Outside 10km'}
          </span>
        </div>

        {/* GPS Automatic Location Button */}
        <div className="mb-4">
          <button
            type="button"
            onClick={detectGPSLocation}
            disabled={calculatingGPS}
            className="w-full bg-gradient-to-r from-[#142B4A] to-[#1B385D] hover:from-[#1B385D] hover:to-[#142B4A] text-white p-3.5 rounded-2xl font-bold text-xs flex items-center justify-between shadow-md hover:shadow-lg transition-all disabled:opacity-75"
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`material-symbols-outlined text-[22px] text-[#FF9F43] ${
                  calculatingGPS ? 'animate-spin' : ''
                }`}
              >
                {calculatingGPS ? 'sync' : 'my_location'}
              </span>
              <div className="flex flex-col text-left">
                <span className="text-xs font-extrabold text-white">
                  {calculatingGPS ? 'Detecting Your GPS Location...' : 'Detect My Exact Location'}
                </span>
                <span className="text-[10px] text-slate-300 font-normal">
                  Automatic GPS coordinates with Phagwara 10 km geofence check
                </span>
              </div>
            </div>
            <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full font-bold">GPS</span>
          </button>

          {gpsError && (
            <div className="mt-2 text-[11px] text-rose-600 bg-rose-50 p-2 rounded-xl border border-rose-100 flex items-center gap-1.5 font-medium">
              <span className="material-symbols-outlined text-[15px]">info</span>
              <span>{gpsError}</span>
            </div>
          )}
        </div>

        {/* Search Input */}
        <div className="relative mb-4">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Phagwara areas, LPU, landmarks..."
            className="w-full bg-[#EDF2F7] border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 outline-none focus:border-[#142B4A] focus:bg-white transition-all font-sans"
          />
        </div>

        {/* Section 1: Serviceable Areas in 10 km Radius */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Phagwara Express Hub (Within 10 km)
            </span>
            <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-bold">
              ⚡ 10-15 Min Delivery
            </span>
          </div>

          <div className="space-y-1.5">
            {serviceableList.map((loc) => {
              const isSelected = location.name === loc.name || location.area === loc.area;
              return (
                <button
                  key={loc.id}
                  onClick={() => selectLocation(loc)}
                  className={`w-full text-left p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                    isSelected
                      ? 'border-[#142B4A] bg-[#142B4A]/5 text-[#142B4A] font-bold shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span className="material-symbols-outlined text-[17px] text-[#142B4A]">
                      location_on
                    </span>
                    <div className="flex flex-col truncate">
                      <span className="truncate">{loc.name}</span>
                      <span className="text-[10px] text-slate-400 font-normal truncate">
                        {loc.area}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#E27B12] font-extrabold shrink-0">
                    {loc.tag}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Outside 10 km Radius (Test Unserviceable State) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-rose-500">
                cancel
              </span>
              Outside 10 km Radius (Test Unserviceable Mode)
            </span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
              Test & Demo
            </span>
          </div>

          <div className="space-y-1.5">
            {unserviceableList.map((loc) => {
              const isSelected = location.name === loc.name || location.area === loc.area;
              return (
                <button
                  key={loc.id}
                  onClick={() => selectLocation(loc)}
                  className={`w-full text-left p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                    isSelected
                      ? 'border-rose-400 bg-rose-50/70 text-rose-900 font-bold shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span className="material-symbols-outlined text-[17px] text-rose-500">
                      location_off
                    </span>
                    <div className="flex flex-col truncate">
                      <span className="truncate">{loc.name}</span>
                      <span className="text-[10px] text-slate-400 font-normal truncate">
                        {loc.area}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-rose-600 font-bold shrink-0">
                    {loc.tag}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1 font-medium">
            <span className="material-symbols-outlined text-[14px] text-emerald-600">verified</span>
            Strict 10 km geofencing from Phagwara hub
          </span>
          <button
            type="button"
            onClick={() => setLocationModalOpen(false)}
            className="text-[#142B4A] hover:underline font-bold"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
