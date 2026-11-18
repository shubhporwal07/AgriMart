'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { ref as rtdbRef, get, set } from 'firebase/database';
import { realtimeDb } from '../config/firebase';
import { backdropVariants, modalVariants, buttonTap } from '../utils/motion';

export default function AnnouncementPopup({ userId, onDismiss }) {
  const [announcement, setAnnouncement] = useState(null);
  const [hasSeenThis, setHasSeenThis] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    checkAndShowAnnouncement();
  }, [userId]);

  const checkAndShowAnnouncement = async () => {
    try {
      const announcementSnapshot = await get(rtdbRef(realtimeDb, 'announcements/current'));

      if (!announcementSnapshot.exists()) {
        setLoading(false);
        return;
      }

      const currentAnnouncement = announcementSnapshot.val();

      if (currentAnnouncement.type === 'everytime') {
        setAnnouncement(currentAnnouncement);
        setLoading(false);
        return;
      }

      if (currentAnnouncement.type === 'once') {
        const seenSnapshot = await get(
          rtdbRef(realtimeDb, `announcements/seen/${userId}`)
        );

        if (seenSnapshot.exists() && seenSnapshot.val() === currentAnnouncement.createdAt) {
          setHasSeenThis(true);
          setLoading(false);
          return;
        }

        setAnnouncement(currentAnnouncement);
        setLoading(false);
        return;
      }

      setLoading(false);
    } catch (err) {
      console.error('Error checking announcement:', err);
      setLoading(false);
    }
  };

  const handleDismiss = async () => {
    if (!userId || !announcement) return;

    try {
      if (announcement.type === 'once') {
        await set(
          rtdbRef(realtimeDb, `announcements/seen/${userId}`),
          announcement.createdAt
        );
      }

      setAnnouncement(null);
      onDismiss?.();
    } catch (err) {
      console.error('Error marking announcement as seen:', err);
    }
  };

  const isVisible = !loading && !!announcement && !hasSeenThis;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={backdropVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50 flex items-center justify-center p-4"
          onClick={handleDismiss}
        >
          <motion.div
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative bg-gradient-to-b from-white to-stone-100 rounded-3xl shadow-2xl max-w-sm w-full px-8 py-14 text-center border border-amber-500/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center border border-amber-400/40">
                <Bell className="w-7 h-7 text-amber-500" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-slate-900 mb-4 font-serif">
              Notification
            </h2>

            {/* Message */}
            <p className="text-slate-600 text-base leading-relaxed mb-8 font-sans">
              {announcement.message}
            </p>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent mb-6" />

            {/* Button */}
            <motion.button
              type="button"
              whileTap={buttonTap}
              onClick={handleDismiss}
              className="text-amber-500 font-semibold text-lg hover:text-amber-600 transition-colors duration-150 tracking-wide"
            >
              OK
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
