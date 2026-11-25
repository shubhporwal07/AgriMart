'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  CheckCircle2,
  X,
  Package,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  MapPin,
  Calendar,
} from 'lucide-react';
import { backdropVariants, modalVariants, buttonTap, fieldMessageVariants, EASE } from '../utils/motion';
import { realtimeDb } from '../config/firebase';
import { ref as rtdbRef, set, push, update } from 'firebase/database';
import { useLanguage } from '../contexts/LanguageContext';

const STAR_LABELS = {
  1: '1 Star — Poor / Low germination or quality',
  2: '2 Stars — Fair / Below expectation',
  3: '3 Stars — Average / Standard quality',
  4: '4 Stars — Very Good / High yield & healthy growth',
  5: '5 Stars — Excellent / Lab quality certified',
};

const QUICK_TAGS = [
  '🌱 95%+ Germination',
  '🌾 High Crop Yield',
  '🚚 Fast Farm Delivery',
  '📦 Intact Lab Packaging',
  '🔬 Genuine FCO Certified',
  '💧 Easy Application / Soluble',
];

export default function ProductReviewModal({
  isOpen,
  onClose,
  order,
  item,
  existingReview = null,
  onReviewSubmitted,
}) {
  const { isHindi } = useLanguage();
  const [rating, setRating] = useState(existingReview?.rating || 5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState(existingReview?.title || '');
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [authorName, setAuthorName] = useState(
    existingReview?.authorName || order?.userName || 'Progressive Farmer'
  );
  const [selectedTags, setSelectedTags] = useState(existingReview?.tags || []);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating || 5);
      setTitle(existingReview.title || '');
      setComment(existingReview.comment || '');
      setAuthorName(existingReview.authorName || order?.userName || 'Progressive Farmer');
      setSelectedTags(existingReview.tags || []);
    } else {
      setRating(5);
      setTitle('');
      setComment('');
      setAuthorName(order?.userName || 'Progressive Farmer');
      setSelectedTags([]);
    }
    setErrorMessage('');
    setSuccess(false);
  }, [existingReview, order, item, isOpen]);

  if (!isOpen || !item) return null;

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags((prev) => prev.filter((t) => t !== tag));
    } else {
      setSelectedTags((prev) => [...prev, tag]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || rating < 1 || rating > 5) {
      setErrorMessage('Please select a star rating between 1 and 5.');
      return;
    }
    if (!comment.trim() && selectedTags.length === 0) {
      setErrorMessage('Please share a short review or select at least one quick tag.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const reviewId =
        existingReview?.id ||
        `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const timestamp = new Date().toISOString();
      const location =
        order?.deliveryLocation ||
        order?.shippingAddress?.city ||
        order?.shippingAddress?.addressLine1 ||
        'Punjab / Hub Region';

      const finalComment = comment.trim() || selectedTags.join(' • ');

      const reviewPayload = {
        id: reviewId,
        orderId: order.id,
        razorpayOrderId: order.razorpayOrderId || order.id,
        productId: item.id,
        productName: item.name,
        productImage: item.imageUrl || '',
        packSize: item.packSize || item.weight || '',
        rating: Number(rating),
        title: title.trim() || `${rating} Stars — Verified Farm Review`,
        comment: finalComment,
        tags: selectedTags,
        authorName: authorName.trim() || 'Verified Kisan',
        authorEmail: (order.userEmail || '').toLowerCase(),
        location: location,
        createdAt: timestamp,
        verifiedPurchase: true,
      };

      // 1. Save directly under order
      await update(rtdbRef(realtimeDb, `orders/${order.id}/reviews/${item.id}`), reviewPayload);

      // 2. Save under product's dedicated reviews node for fast lookup
      await set(rtdbRef(realtimeDb, `productReviews/${item.id}/${reviewId}`), reviewPayload);

      // 3. Save under global allReviews for storefront social proof & admin moderation
      await set(rtdbRef(realtimeDb, `allReviews/${reviewId}`), reviewPayload);

      // Cache locally
      try {
        const localKey = `agrimart_review_${order.id}_${item.id}`;
        localStorage.setItem(localKey, JSON.stringify(reviewPayload));
      } catch {
        // ignore storage errors
      }

      setSuccess(true);
      if (onReviewSubmitted) {
        onReviewSubmitted(reviewPayload);
      }

      setTimeout(() => {
        onClose();
      }, 1400);
    } catch (err) {
      console.error('Failed to submit review:', err);
      setErrorMessage('Could not save review to database. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <AnimatePresence>
      <motion.div
        key="review-backdrop"
        variants={backdropVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto no-scrollbar"
        onClick={onClose}
      >
        <motion.div
          key="review-dialog"
          variants={modalVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto no-scrollbar border border-slate-100 my-auto relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#FAF5EB]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#0B1B30] text-[#FF9F43] flex items-center justify-center font-bold shadow-xs">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              </div>
              <div>
                <h2 className="font-headline font-extrabold text-base text-[#0B1B30] leading-tight">
                  {existingReview
                    ? (isHindi ? 'अपनी सत्यापित समीक्षा अपडेट करें' : 'Update Your Verified Review')
                    : (isHindi ? 'डिलीवर किए गए इनपुट की समीक्षा एवं रेटिंग दें' : 'Rate & Review Delivered Input')}
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                    <ShieldCheck size={11} className="text-emerald-700" />
                    {isHindi ? 'सत्यापित डिलीवर किया गया ऑर्डर' : 'Verified Delivered Order'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Ref: {order.razorpayOrderId || order.id}
                  </span>
                </div>
              </div>
            </div>
            <motion.button
              type="button"
              whileTap={buttonTap}
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </motion.button>
          </div>

          {/* Product Mini Preview */}
          <div className="p-4 mx-6 mt-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3.5">
            <img
              src={item.imageUrl || '/images/products/hybrid-tomato-seeds.png'}
              alt={item.name}
              className="w-14 h-14 rounded-xl object-cover bg-white border border-slate-200 shrink-0"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/images/products/hybrid-tomato-seeds.png';
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug">{item.name}</p>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                {(item.packSize || item.weight) && (
                  <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                    {item.packSize || item.weight}
                  </span>
                )}
                <span>{isHindi ? 'मात्रा:' : 'Qty:'} {item.quantity || 1}</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Success Banner */}
            <AnimatePresence>
              {success && (
                <motion.div
                  variants={fieldMessageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2.5"
                >
                  <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-sm font-extrabold text-emerald-900">{isHindi ? 'समीक्षा सफलतापूर्वक दर्ज की गई!' : 'Review Submitted Successfully!'}</p>
                    <p className="text-[11px] font-medium text-emerald-700 mt-0.5">
                      {isHindi ? 'आपकी वास्तविक समीक्षा अब इस उत्पाद पर अन्य किसानों के लिए लाइव है।' : 'Your authentic review is now live on this product and verified for other farmers.'}
                    </p>
                  </div>
                </motion.div>
              )}
              {errorMessage && (
                <motion.div
                  variants={fieldMessageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2"
                >
                  <AlertCircle size={16} className="text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Star Rating Section */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wide">
                {isHindi ? '1. स्टार रेटिंग चुनें *' : '1. Select Star Rating *'}
              </label>
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex flex-col items-center sm:items-start gap-2">
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 rounded-xl hover:scale-110 active:scale-95 transition-transform cursor-pointer focus:outline-none"
                      aria-label={`${star} star`}
                    >
                      <Star
                        className={`w-8 h-8 sm:w-9 sm:h-9 transition-colors ${
                          star <= displayRating
                            ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                            : 'fill-transparent text-slate-300'
                        }`}
                        strokeWidth={1.5}
                      />
                    </button>
                  ))}
                  <span className="font-extrabold text-base text-amber-900 ml-2">
                    {displayRating}.0
                  </span>
                </div>
                <p className="text-xs font-bold text-amber-900/90 mt-0.5">
                  {STAR_LABELS[displayRating] || 'Tap a star to rate this product'}
                </p>
              </div>
            </div>

            {/* Quick Praise Tags */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#FF9F43]" />
                <span>{isHindi ? '2. त्वरित अनुभव टैग (जोड़ने के लिए टैप करें)' : '2. Quick Experience Tags (Tap to add)'}</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_TAGS.map((tag) => {
                  const active = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                        active
                          ? 'bg-[#0B1B30] text-amber-300 border-[#0B1B30] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Review Title */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                {isHindi ? '3. समीक्षा शीर्षक (वैकल्पिक)' : '3. Review Headline (Optional)'}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isHindi ? 'उदा. 3 दिनों के भीतर उत्कृष्ट अंकुरण, बहुत संतुष्ट!' : 'e.g. Excellent germination within 3 days, very satisfied!'}
                className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0B1B30]/20 focus:border-[#0B1B30]"
              />
            </div>

            {/* Review Comment */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                {isHindi ? '4. खेत का अनुभव एवं टिप्पणियां *' : '4. Field Experience & Comments *'}
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={isHindi ? 'बीज अंकुरण दर, फसल की पैदावार, पत्तों का स्वास्थ्य, उर्वरक घुलनशीलता, या पैकिंग गुणवत्ता पर विवरण साझा करें...' : 'Share details on seed germination rate, crop yield, leaf health, fertilizer solubility, packing quality, or advice received...'}
                className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0B1B30]/20 focus:border-[#0B1B30] leading-relaxed"
              />
            </div>

            {/* Author Identity & Location Pre-fills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  {isHindi ? 'आपका नाम / किसान पहचान' : 'Your Name / Kisan Handle'}
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder={isHindi ? 'उदा. गुरप्रीत सिंह' : 'e.g. Gurpreet Singh'}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0B1B30]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  {isHindi ? 'खेत का स्थान / क्षेत्र' : 'Farm Location / Region'}
                </label>
                <div className="flex items-center gap-1.5 text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700">
                  <MapPin size={14} className="text-emerald-600 shrink-0" />
                  <span className="truncate">
                    {order.deliveryLocation || order.shippingAddress?.city || 'LPU Hub Dispatch Area'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
              >
                {isHindi ? 'रद्द करें' : 'Cancel'}
              </button>
              <motion.button
                type="submit"
                disabled={submitting}
                whileTap={buttonTap}
                className="px-5 py-2.5 rounded-xl bg-[#0B1B30] hover:bg-[#152B48] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{submitting ? (isHindi ? 'समीक्षा जमा हो रही है...' : 'Submitting Review...') : existingReview ? (isHindi ? 'समीक्षा अपडेट करें' : 'Update Verified Review') : (isHindi ? 'समीक्षा जमा करें' : 'Submit Verified Review')}</span>
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
