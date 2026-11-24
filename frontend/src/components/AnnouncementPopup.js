'use client';
import { useEffect, useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Megaphone, Calendar } from 'lucide-react';
import { ref as rtdbRef, onValue, set, get } from 'firebase/database';
import { realtimeDb } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { backdropVariants, modalVariants, buttonTap, iconTap } from '../utils/motion';

export default function AnnouncementPopup({ userId: propUserId, onDismiss }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { isHindi } = useLanguage();

  const [announcement, setAnnouncement] = useState(null);
  const [hasSeenThis, setHasSeenThis] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionDismissed, setSessionDismissed] = useState(false);

  // Sanitize user ID to ensure valid Firebase RTDB path (no '.', '#', '$', '[', ']')
  // Only authenticated users (or explicit userId prop) are eligible for announcements
  const safeUserId = useMemo(() => {
    const rawId = propUserId || user?.uid || user?.email;
    if (!rawId) return null;
    return 'user_' + String(rawId).replace(/[^a-zA-Z0-9_-]/g, '_');
  }, [propUserId, user]);

  useEffect(() => {
    // Reset session dismissal when user logs in
    setSessionDismissed(false);
  }, [safeUserId]);

  useEffect(() => {
    // Announcements must ONLY be shown to authenticated users right after login, never to guests or on logout
    if (!safeUserId) {
      setAnnouncement(null);
      setLoading(false);
      setSessionDismissed(false);
      return;
    }

    // Do not show on admin console pages or login page
    if (pathname?.startsWith('/admin') || pathname === '/login') {
      setLoading(false);
      return;
    }

    try {
      const currentRef = rtdbRef(realtimeDb, 'announcements/current');
      const unsubscribe = onValue(
        currentRef,
        async (snapshot) => {
          if (!safeUserId) {
            setAnnouncement(null);
            setLoading(false);
            return;
          }

          if (!snapshot.exists()) {
            setAnnouncement(null);
            setLoading(false);
            return;
          }

          const data = snapshot.val();
          if (!data || !data.message) {
            setAnnouncement(null);
            setLoading(false);
            return;
          }

          const announcementKey = data.createdAt || 'latest';

          // Check if dismissed in this browser session (applies to both once & everytime)
          const sessionSeen =
            typeof window !== 'undefined' &&
            sessionStorage.getItem(`agrimart_session_seen_announcement_${safeUserId}_${announcementKey}`);

          if (sessionSeen) {
            setAnnouncement(null);
            setLoading(false);
            return;
          }

          // Check if already dismissed in localStorage for this user
          const localSeen =
            typeof window !== 'undefined' &&
            localStorage.getItem(`agrimart_seen_announcement_${safeUserId}_${announcementKey}`);

          if (data.type === 'once') {
            if (localSeen) {
              setHasSeenThis(true);
              setLoading(false);
              return;
            }

            // Check RTDB seen registry for logged-in user
            try {
              const seenSnap = await get(
                rtdbRef(realtimeDb, `announcements/seen/${safeUserId}`)
              );
              if (seenSnap.exists() && seenSnap.val() === data.createdAt) {
                setHasSeenThis(true);
                setLoading(false);
                return;
              }
            } catch (e) {
              console.warn('Error reading announcement seen state from RTDB:', e);
            }

            setHasSeenThis(false);
            setAnnouncement(data);
            setLoading(false);
          } else {
            // 'everytime' type: show just after login (unless already dismissed in this active session)
            setHasSeenThis(false);
            setAnnouncement(data);
            setLoading(false);
          }
        },
        (error) => {
          console.error('Error subscribing to current announcement:', error);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error('Error checking announcement:', err);
      setLoading(false);
    }
  }, [safeUserId, pathname]);

  const handleDismiss = async () => {
    if (!announcement || !safeUserId) return;
    setSessionDismissed(true);

    const announcementKey = announcement.createdAt || 'latest';

    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(
          `agrimart_session_seen_announcement_${safeUserId}_${announcementKey}`,
          'true'
        );

        if (announcement.type === 'once') {
          localStorage.setItem(
            `agrimart_seen_announcement_${safeUserId}_${announcementKey}`,
            'true'
          );
        }
      }

      if (announcement.type === 'once') {
        await set(
          rtdbRef(realtimeDb, `announcements/seen/${safeUserId}`),
          announcementKey
        );
      }
    } catch (err) {
      console.error('Error marking announcement as seen:', err);
    }

    setAnnouncement(null);
    onDismiss?.();
  };

  const isVisible =
    Boolean(safeUserId) &&
    !loading &&
    Boolean(announcement && announcement.message) &&
    !hasSeenThis &&
    !sessionDismissed &&
    !pathname?.startsWith('/admin') &&
    pathname !== '/login';

  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') handleDismiss();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible]);

  if (!safeUserId || !isVisible || !announcement) {
    return null;
  }

  const formattedDate = announcement.createdAt
    ? new Date(announcement.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="announcement-backdrop"
          variants={backdropVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 overflow-y-auto no-scrollbar"
          onClick={handleDismiss}
          role="dialog"
          aria-modal="true"
          aria-labelledby="announcement-title"
        >
          <motion.div
            key="announcement-dialog"
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-amber-200/60 my-auto"
          >
            {/* Top Decorative Header Accent */}
            <div className="bg-gradient-to-r from-[#0B1B30] via-[#142B4A] to-[#0B1B30] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-[#FF9F43] text-[#0B1B30] flex items-center justify-center font-extrabold shadow-sm shrink-0">
                  <Megaphone className="w-5 h-5 text-[#0B1B30]" />
                </div>
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-full text-[10px] font-bold text-[#FF9F43] uppercase tracking-wider mb-0.5">
                    <span>🌾</span> {isHindi ? 'एग्रीमार्ट किसान केंद्र सूचना' : 'AgriMart Kisan Hub Notice'}
                  </div>
                  <h2 id="announcement-title" className="font-headline font-extrabold text-base text-white leading-tight truncate">
                    {isHindi ? 'आधिकारिक घोषणा' : 'Official Announcement'}
                  </h2>
                </div>
              </div>

              <motion.button
                type="button"
                whileTap={iconTap}
                onClick={handleDismiss}
                className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                aria-label="Close Announcement"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Announcement Content Body */}
            <div className="p-5 sm:p-6 space-y-4">
              <div className="bg-gradient-to-br from-[#FFF9F0] via-[#FFF5E6] to-[#FFEDD5]/60 border border-amber-200/80 rounded-2xl p-4 sm:p-5 relative">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-[#E27B12] flex items-center justify-center shrink-0 mt-0.5">
                    <Bell className="w-4 h-4 text-[#A74E00]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 leading-relaxed whitespace-pre-line break-words">
                      {announcement.message}
                    </p>
                  </div>
                </div>

                {formattedDate && (
                  <div className="mt-3 pt-2.5 border-t border-amber-200/50 flex items-center justify-between text-[11px] text-[#5A6B82]">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-amber-600" />
                      <span>{formattedDate}</span>
                    </span>
                    <span className="font-bold text-[#142B4A] bg-white/80 px-2 py-0.5 rounded-md border border-amber-200/40">
                      {announcement.type === 'once' ? (isHindi ? 'महत्वपूर्ण सूचना' : 'Important Notice') : (isHindi ? 'मौसमी कृषि सलाह' : 'Seasonal Advisory')}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <motion.button
                  type="button"
                  whileTap={buttonTap}
                  onClick={handleDismiss}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#0B1B30] hover:bg-[#152B48] text-white rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4 text-[#FF9F43]" />
                  <span>{isHindi ? 'स्वीकार करें और बंद करें' : 'Acknowledge & Dismiss'}</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
