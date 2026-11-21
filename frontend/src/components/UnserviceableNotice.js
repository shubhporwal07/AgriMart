'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocationContext } from '../contexts/LocationContext';
import { accordionVariants, buttonTap, EASE } from '../utils/motion';

export default function UnserviceableNotice({ className = '' }) {
  const { location, isServiceable, setLocationModalOpen, primaryHub } = useLocationContext();
  const [notified, setNotified] = useState(false);
  const [notifyInput, setNotifyInput] = useState('');

  const handleNotifySubmit = (e) => {
    e.preventDefault();
    if (!notifyInput.trim()) return;
    setNotified(true);
    setTimeout(() => setNotified(false), 5000);
    setNotifyInput('');
  };

  return (
    <AnimatePresence>
      {!isServiceable && (
        <motion.div
          variants={accordionVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className={`w-full overflow-hidden bg-gradient-to-r from-[#FFF5F5] via-[#FFF8F0] to-[#FFF0E6] border-b border-rose-200 shadow-sm ${className}`}
        >
          <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3.5 sm:py-5 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
            {/* Left Information */}
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <span className="material-symbols-outlined text-[22px] sm:text-[26px]">location_off</span>
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <h2 className="text-xs sm:text-base font-extrabold text-slate-900">
                    Currently Not Available in Your Area
                  </h2>
                  <span className="text-[10px] sm:text-[11px] bg-rose-100 text-rose-700 font-extrabold px-2 py-0.5 rounded-full border border-rose-200">
                    Outside 30 km Hub Zone
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                  AgriMart farm dispatch is currently live within a <strong>30 km radius</strong> of our{' '}
                  <strong className="text-[#142B4A]">{primaryHub.name} ({primaryHub.area})</strong> (Express &le;10 km, Standard &le;30 km).
                  Your current selection is{' '}
                  <span className="font-semibold text-rose-900 underline">
                    {location.name || location.area || 'Outside Area'}
                  </span>{' '}
                  {location.distanceKm ? `(~${location.distanceKm} km away)` : ''}.
                </p>
              </div>
            </div>

            {/* Right CTA Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto shrink-0">
              <motion.button
                type="button"
                whileTap={buttonTap}
                onClick={() => setLocationModalOpen(true)}
                className="flex-1 sm:flex-none bg-[#142B4A] hover:bg-[#1B385D] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all duration-150 flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">edit_location_alt</span>
                <span>Select Phagwara Address</span>
              </motion.button>

              <AnimatePresence mode="wait" initial={false}>
                {notified ? (
                  <motion.div
                    key="notified"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.16, ease: EASE.out }}
                    className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-2.5 rounded-xl flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>We will notify you!</span>
                  </motion.div>
                ) : (
                  <motion.form
                    key="notify-form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.14 }}
                    onSubmit={handleNotifySubmit}
                    className="flex-1 sm:flex-none flex items-center gap-1"
                  >
                    <input
                      type="text"
                      value={notifyInput}
                      onChange={(e) => setNotifyInput(e.target.value)}
                      placeholder="Phone or Email"
                      className="bg-white border border-slate-300 px-3 py-2 rounded-xl text-xs text-slate-800 outline-none w-32 sm:w-36 focus:border-[#142B4A] focus:ring-2 focus:ring-[#142B4A]/15 transition-all duration-150"
                    />
                    <motion.button
                      type="submit"
                      whileTap={buttonTap}
                      className="bg-white hover:bg-slate-100 text-[#142B4A] border border-slate-300 text-xs font-bold px-3 py-2 rounded-xl transition-colors duration-150 whitespace-nowrap shadow-sm"
                    >
                      Notify Me
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
