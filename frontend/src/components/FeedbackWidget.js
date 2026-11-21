'use client';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  X,
  Send,
  CheckCircle2,
  LogIn,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { realtimeDb } from '../config/firebase';
import { ref as rtdbRef, push, set } from 'firebase/database';
import {
  backdropVariants,
  modalVariants,
  buttonTap,
  fieldMessageVariants,
  EASE,
} from '../utils/motion';

const FEEDBACK_CATEGORIES = [
  'General Suggestion',
  'Seed & Fertilizer Quality',
  'Delivery & Village Dispatch',
  'Pricing & Kisan Subsidy',
  'Website Feature Request',
];

const MAX_CHARS = 500;

export default function FeedbackWidget({ className = '', label = 'Feedback' }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('General Suggestion');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Support opening via custom event from any footer link or button
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-agrimart-feedback', handleOpen);
    return () => window.removeEventListener('open-agrimart-feedback', handleOpen);
  }, []);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setMessage('');
      setCategory('General Suggestion');
      setError('');
      setSuccess(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Do not render on admin console routes
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const isLoggedIn = Boolean(user && (user.email || user.uid));
  const charsCount = message.length;
  const isOverLimit = charsCount > MAX_CHARS;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setError('Please sign in to submit your feedback.');
      return;
    }

    const trimmed = message.trim();
    if (!trimmed) {
      setError('Please enter your feedback or suggestion.');
      return;
    }

    if (trimmed.length > MAX_CHARS) {
      setError(`Feedback must be under ${MAX_CHARS} characters (currently ${trimmed.length}).`);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const feedbackRef = rtdbRef(realtimeDb, 'feedback');
      const newFeedbackRef = push(feedbackRef);

      const feedbackData = {
        id: newFeedbackRef.key,
        userId: user?.uid || 'authenticated_user',
        userName: user?.displayName || user?.email?.split('@')[0] || 'AgriMart Farmer',
        userEmail: (user?.email || '').toLowerCase(),
        category: category,
        message: trimmed,
        submittedAt: new Date().toISOString(),
        source: 'Footer Feedback Button',
      };

      await set(newFeedbackRef, feedbackData);

      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
      }, 1800);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      setError('Could not submit feedback to the server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignInRedirect = () => {
    setIsOpen(false);
    const redirectUrl = pathname ? `/login?redirect=${encodeURIComponent(pathname)}` : '/login';
    router.push(redirectUrl);
  };

  return (
    <>
      {/* Feedback Button (in Footer) */}
      <motion.button
        type="button"
        id="site-feedback-tag"
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-2 bg-[#0B1B30] hover:bg-[#152B48] text-white px-4 py-2 rounded-full shadow-md border border-white/20 cursor-pointer transition-all duration-150 group shrink-0 ${className}`}
        title="Share your feedback or suggestions with AgriMart"
        aria-label="Open Feedback Form"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span
          className="material-symbols-outlined text-[18px] text-[#FF9F43] group-hover:rotate-12 transition-transform"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          rate_review
        </span>
        <span className="text-xs font-bold tracking-wide">{label}</span>
      </motion.button>

      {/* Animated Feedback Box / Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="feedback-backdrop"
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto no-scrollbar"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              key="feedback-dialog"
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 my-auto relative"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#FAF5EB]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#0B1B30] text-[#FF9F43] flex items-center justify-center font-bold shadow-xs">
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <h2 className="font-headline font-extrabold text-base text-[#0B1B30] leading-tight">
                      Share Feedback &amp; Suggestions
                    </h2>
                    <p className="text-[11px] text-[#5A6B82] leading-tight mt-0.5">
                      Direct to AgriMart Kisan Management Console
                    </p>
                  </div>
                </div>
                <motion.button
                  type="button"
                  whileTap={buttonTap}
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  aria-label="Close"
                >
                  <X size={18} />
                </motion.button>
              </div>

              {/* Body */}
              <div className="p-6">
                {!isLoggedIn ? (
                  /* User Not Logged In - Prompt to Log In */
                  <div className="text-center py-4 space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 text-[#FF9F43] border border-amber-200/80 flex items-center justify-center mx-auto shadow-xs">
                      <LogIn size={26} className="text-[#E27B12]" />
                    </div>
                    <div>
                      <h3 className="font-headline text-lg font-bold text-slate-900">
                        Sign In Required to Give Feedback
                      </h3>
                      <p className="text-xs text-slate-600 mt-1.5 max-w-sm mx-auto leading-relaxed">
                        To maintain high agricultural standards and protect against spam, feedback and suggestions can only be submitted by registered users.
                      </p>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <motion.button
                        type="button"
                        whileTap={buttonTap}
                        onClick={handleSignInRedirect}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#0B1B30] hover:bg-[#152B48] text-white text-xs font-bold transition shadow-md flex items-center justify-center gap-2"
                      >
                        <LogIn size={15} />
                        <span>Sign In to Give Feedback</span>
                      </motion.button>
                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* User Logged In - Feedback Form */
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* User Identifier Pill */}
                    <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-[#0B1B30] text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">
                            {user.displayName || 'AgriMart Customer'}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
                        <ShieldCheck size={12} className="text-emerald-600" />
                        Verified Account
                      </span>
                    </div>

                    {/* Notifications */}
                    <AnimatePresence>
                      {success && (
                        <motion.div
                          variants={fieldMessageVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2.5"
                        >
                          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                          <div>
                            <p className="font-extrabold">Feedback Submitted Successfully!</p>
                            <p className="text-[11px] font-medium text-emerald-700">
                              Thank you! Your feedback is now visible in the AgriMart Kisan Hub Console.
                            </p>
                          </div>
                        </motion.div>
                      )}
                      {error && (
                        <motion.div
                          variants={fieldMessageVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2"
                        >
                          <AlertCircle size={16} className="text-rose-600 shrink-0" />
                          <span>{error}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Topic Chips */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wide">
                        Feedback Topic
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {FEEDBACK_CATEGORIES.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setCategory(cat)}
                            className={`text-xs font-semibold px-2.5 py-1 rounded-xl border transition-all ${
                              category === cat
                                ? 'bg-[#0B1B30] text-amber-300 border-[#0B1B30] shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Textarea under 500 characters */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                          Your Suggestion or Feedback *
                        </label>
                        <span
                          className={`text-[11px] font-mono font-bold ${
                            isOverLimit
                              ? 'text-rose-600'
                              : charsCount > 450
                              ? 'text-amber-600'
                              : 'text-slate-400'
                          }`}
                        >
                          {charsCount} / {MAX_CHARS}
                        </span>
                      </div>
                      <textarea
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        maxLength={MAX_CHARS}
                        placeholder="Type your feedback, advice, or suggestions for AgriMart (under 500 characters)..."
                        className={`w-full text-xs p-3 rounded-xl border bg-white focus:outline-none focus:ring-2 leading-relaxed transition-colors ${
                          isOverLimit
                            ? 'border-rose-400 focus:ring-rose-200'
                            : 'border-slate-300 focus:ring-[#0B1B30]/20 focus:border-[#0B1B30]'
                        }`}
                        required
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        Keep your suggestions under 500 characters. Help us serve your farm better!
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        disabled={submitting}
                        className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
                      >
                        Cancel
                      </button>
                      <motion.button
                        type="submit"
                        disabled={submitting || !message.trim() || isOverLimit}
                        whileTap={buttonTap}
                        className="px-5 py-2.5 rounded-xl bg-[#0B1B30] hover:bg-[#152B48] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send size={14} className="text-[#FF9F43]" />
                        <span>{submitting ? 'Submitting...' : 'Submit Feedback'}</span>
                      </motion.button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
