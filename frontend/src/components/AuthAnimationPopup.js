'use client';
import { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, LogOut, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { buttonTap, iconTap } from '../utils/motion';

export default function AuthAnimationPopup() {
  const pathname = usePathname();
  const { authModal, closeAuthNotice } = useAuth();
  const [toastNotice, setToastNotice] = useState(null);

  // Check for post-navigation auth notices stored in sessionStorage (e.g., after login/logout redirect)
  const checkStoredNotice = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = sessionStorage.getItem('agrimart_auth_toast');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Only show if fresh (created within last 15 seconds)
        if (parsed && Date.now() - (parsed.timestamp || 0) < 15000) {
          setToastNotice(parsed);
        }
        sessionStorage.removeItem('agrimart_auth_toast');
      }
    } catch {
      // ignore
    }
  }, []);

  // Check stored notice on initial mount and whenever route changes
  useEffect(() => {
    checkStoredNotice();
  }, [pathname, checkStoredNotice]);

  useEffect(() => {
    const handleCustomNotice = (e) => {
      if (e.detail) {
        setToastNotice(e.detail);
      }
    };
    window.addEventListener('agrimart-auth-notice', handleCustomNotice);
    return () => {
      window.removeEventListener('agrimart-auth-notice', handleCustomNotice);
    };
  }, []);

  // Auto-dismiss top toast notification after 4 seconds
  useEffect(() => {
    if (toastNotice) {
      const timer = setTimeout(() => {
        setToastNotice(null);
      }, 4200);
      return () => clearTimeout(timer);
    }
  }, [toastNotice]);

  // Sync active modal if authModal is set to stage 'after'
  useEffect(() => {
    if (authModal?.show && authModal?.stage === 'after') {
      setToastNotice({
        type: authModal.type,
        title: authModal.title,
        message: authModal.message,
        userName: authModal.userName,
      });
      closeAuthNotice();
    }
  }, [authModal, closeAuthNotice]);

  // Close during-modal on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (toastNotice) setToastNotice(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toastNotice]);

  const isDuringModalVisible = Boolean(authModal?.show && authModal?.stage === 'during');
  const isDuringLogin = authModal?.type === 'login';
  const isDuringLogout = authModal?.type === 'logout';
  const isSuccessPhase = authModal?.status === 'success';

  return (
    <>
      {/* 1. DURING LOGIN / DURING LOGOUT MODAL OVERLAY */}
      <AnimatePresence>
        {isDuringModalVisible && (
          <motion.div
            key="auth-during-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[99998] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
          >
            <motion.div
              key="auth-during-dialog"
              initial={{ scale: 0.85, y: 24, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: -16, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl border border-amber-200/80 relative overflow-hidden"
            >
              {/* Top ambient glow accent */}
              <div
                className={`absolute top-0 inset-x-0 h-1.5 ${
                  isDuringLogout
                    ? 'bg-gradient-to-r from-rose-500 via-amber-400 to-rose-500'
                    : 'bg-gradient-to-r from-[#0B1B30] via-[#FF9F43] to-emerald-500'
                }`}
              />

              {/* Animated Icon Avatar */}
              <div className="relative mx-auto w-16 h-16 mb-4 flex items-center justify-center mt-2">
                <motion.div
                  animate={{ scale: [1, 1.25, 1], opacity: [0.35, 0.75, 0.35] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  className={`absolute inset-0 rounded-2xl blur-md ${
                    isDuringLogout
                      ? 'bg-rose-400/30'
                      : isSuccessPhase
                      ? 'bg-emerald-400/40'
                      : 'bg-amber-400/35'
                  }`}
                />

                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg relative z-10 transition-colors duration-200 ${
                    isDuringLogout
                      ? 'bg-[#0B1B30] text-rose-400'
                      : isSuccessPhase
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#0B1B30] text-[#FF9F43]'
                  }`}
                >
                  {isDuringLogout ? (
                    <motion.div
                      animate={{ x: [0, -2, 2, 0] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    >
                      <LogOut className="w-8 h-8 text-rose-400" />
                    </motion.div>
                  ) : isSuccessPhase ? (
                    <motion.div
                      initial={{ scale: 0.5, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', damping: 15, stiffness: 400 }}
                    >
                      <Check className="w-8 h-8 text-white stroke-[3]" />
                    </motion.div>
                  ) : (
                    <span className="material-symbols-outlined text-[32px] animate-pulse">
                      potted_plant
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Description */}
              <h3
                id="auth-modal-title"
                className="font-headline font-black text-lg text-[#0B1B30] mb-1.5 leading-snug"
              >
                {authModal?.title || (isDuringLogout ? 'Signing Out...' : 'Signing You In...')}
              </h3>
              <p className="text-xs text-[#5A6B82] leading-relaxed max-w-xs mx-auto">
                {authModal?.message ||
                  (isDuringLogout
                    ? 'Securing your AgriMart account & disconnecting safely...'
                    : 'Connecting to AgriMart Kisan Hub & securing session...')}
              </p>

              {/* Animated Progress Bar */}
              <div className="mt-5 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  initial={{ width: '15%' }}
                  animate={{ width: isSuccessPhase ? '100%' : '88%' }}
                  transition={{ duration: isSuccessPhase ? 0.4 : 1.2, ease: 'easeOut' }}
                  className={`h-full rounded-full ${
                    isDuringLogout
                      ? 'bg-gradient-to-r from-[#0B1B30] via-rose-500 to-amber-500'
                      : isSuccessPhase
                      ? 'bg-emerald-500'
                      : 'bg-gradient-to-r from-[#0B1B30] via-[#FF9F43] to-emerald-500'
                  }`}
                />
              </div>

              {/* Security Badge */}
              <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-[#5A6B82] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Protected by AgriMart Secure Auth</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. AFTER LOGIN / AFTER LOGOUT TOP POP-UP TOAST */}
      <AnimatePresence>
        {toastNotice && (
          <motion.div
            key="auth-after-toast"
            initial={{ opacity: 0, y: -35, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -25, scale: 0.95 }}
            transition={{ type: 'spring', damping: 24, stiffness: 380 }}
            className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-[99999] w-[calc(100%-2rem)] max-w-md pointer-events-auto"
            role="status"
            aria-live="polite"
          >
            <div
              className={`rounded-2xl p-4 shadow-[0_16px_36px_rgba(11,27,48,0.28)] border backdrop-blur-md flex items-center justify-between gap-3 text-white ${
                toastNotice.type === 'logout'
                  ? 'bg-gradient-to-r from-[#0B1B30] via-[#1A2E4C] to-[#0B1B30] border-rose-400/40'
                  : 'bg-gradient-to-r from-[#0B1B30] via-[#142B4A] to-[#0B1B30] border-amber-300/40'
              }`}
            >
              {/* Left Badge Icon */}
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold shadow-sm ${
                  toastNotice.type === 'logout'
                    ? 'bg-rose-500/25 text-rose-300 border border-rose-400/30'
                    : 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/30'
                }`}
              >
                {toastNotice.type === 'logout' ? (
                  <LogOut className="w-5 h-5 text-rose-300" />
                ) : (
                  <Sparkles className="w-5 h-5 text-[#FF9F43]" />
                )}
              </div>

              {/* Notice Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      toastNotice.type === 'logout'
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-[#FF9F43]/20 text-[#FF9F43]'
                    }`}
                  >
                    {toastNotice.type === 'logout' ? '👋 Session Ended' : '🌾 Authenticated'}
                  </span>
                </div>
                <h4 className="font-headline font-bold text-sm text-white leading-tight truncate">
                  {toastNotice.title ||
                    (toastNotice.type === 'logout'
                      ? 'Logged Out Successfully'
                      : 'Welcome Back!')}
                </h4>
                <p className="text-xs text-slate-300 leading-normal line-clamp-1 mt-0.5">
                  {toastNotice.message ||
                    (toastNotice.type === 'logout'
                      ? 'You have safely signed out of AgriMart. See you again!'
                      : 'You are now securely signed in to AgriMart.')}
                </p>
              </div>

              {/* Close Button */}
              <motion.button
                type="button"
                whileTap={iconTap}
                onClick={() => setToastNotice(null)}
                className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
