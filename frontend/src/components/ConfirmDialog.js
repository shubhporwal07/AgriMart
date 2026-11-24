'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';
import { backdropVariants, modalVariants, buttonTap, iconTap } from '../utils/motion';
import { useLanguage } from '../contexts/LanguageContext';

export default function ConfirmDialog({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure?',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isLoading = false,
  isDangerous = false,
}) {
  const { isHindi } = useLanguage();
  const finalCancel = cancelText === 'Cancel' ? (isHindi ? 'रद्द करें' : 'Cancel') : cancelText;
  const finalConfirm = confirmText === 'Delete' ? (isHindi ? 'हटाएं' : 'Delete') : confirmText;
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={backdropVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50 flex items-center justify-center p-4"
          onClick={onCancel}
        >
          <motion.div
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-white pointer-events-none" />

            {/* Content */}
            <div className="relative p-6 sm:p-8">
              {/* Close button */}
              <motion.button
                type="button"
                whileTap={iconTap}
                onClick={onCancel}
                className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-150"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </motion.button>

              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                  isDangerous ? 'bg-red-100' : 'bg-amber-100'
                }`}
              >
                <AlertCircle className={`w-6 h-6 ${isDangerous ? 'text-red-600' : 'text-amber-600'}`} />
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                {title}
              </h2>

              {/* Message */}
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                {message}
              </p>

              {/* Buttons */}
              <div className="flex gap-3">
                <motion.button
                  type="button"
                  whileTap={buttonTap}
                  onClick={onCancel}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-150 disabled:opacity-50"
                >
                  {finalCancel}
                </motion.button>

                <motion.button
                  type="button"
                  whileTap={buttonTap}
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors duration-150 disabled:opacity-50 ${
                    isDangerous
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-slate-900 hover:bg-slate-800'
                  }`}
                >
                  {isLoading ? (isHindi ? 'हटाया जा रहा है...' : 'Deleting...') : finalConfirm}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
