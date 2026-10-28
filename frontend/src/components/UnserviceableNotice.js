'use client';
import { useState } from 'react';
import { useLocationContext } from '../contexts/LocationContext';

export default function UnserviceableNotice({ className = '' }) {
  const { location, isServiceable, setLocationModalOpen, primaryHub } = useLocationContext();
  const [notified, setNotified] = useState(false);
  const [notifyInput, setNotifyInput] = useState('');

  if (isServiceable) return null;

  const handleNotifySubmit = (e) => {
    e.preventDefault();
    if (!notifyInput.trim()) return;
    setNotified(true);
    setTimeout(() => setNotified(false), 5000);
    setNotifyInput('');
  };

  return (
    <div
      className={`w-full bg-gradient-to-r from-[#FFF5F5] via-[#FFF8F0] to-[#FFF0E6] border-b border-rose-200 shadow-sm ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left Information */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <span className="material-symbols-outlined text-[26px]">location_off</span>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                Currently Not Available in Your Area
              </h2>
              <span className="text-[11px] bg-rose-100 text-rose-700 font-extrabold px-2.5 py-0.5 rounded-full border border-rose-200">
                Outside 10 km Hub Zone
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              AgriMart farm dispatch is currently live strictly within a <strong>10 km radius</strong> of our{' '}
              <strong className="text-[#142B4A]">{primaryHub.name} ({primaryHub.area})</strong>.
              Your current selection is{' '}
              <span className="font-semibold text-rose-900 underline">
                {location.name || location.area || 'Outside Area'}
              </span>{' '}
              {location.distanceKm ? `(~${location.distanceKm} km away)` : ''}.
            </p>
          </div>
        </div>

        {/* Right CTA Actions */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full md:w-auto shrink-0">
          <button
            type="button"
            onClick={() => setLocationModalOpen(true)}
            className="flex-1 sm:flex-none bg-[#142B4A] hover:bg-[#1B385D] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">edit_location_alt</span>
            <span>Select Phagwara Address</span>
          </button>

          {notified ? (
            <div className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-2.5 rounded-xl flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>We will notify you!</span>
            </div>
          ) : (
            <form onSubmit={handleNotifySubmit} className="flex-1 sm:flex-none flex items-center gap-1">
              <input
                type="text"
                value={notifyInput}
                onChange={(e) => setNotifyInput(e.target.value)}
                placeholder="Phone or Email"
                className="bg-white border border-slate-300 px-3 py-2 rounded-xl text-xs text-slate-800 outline-none w-32 sm:w-36 focus:border-[#142B4A]"
              />
              <button
                type="submit"
                className="bg-white hover:bg-slate-100 text-[#142B4A] border border-slate-300 text-xs font-bold px-3 py-2 rounded-xl transition-colors whitespace-nowrap shadow-sm"
              >
                Notify Me
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
