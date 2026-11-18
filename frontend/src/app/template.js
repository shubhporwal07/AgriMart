'use client';
import { motion } from 'framer-motion';
import { pageTransition } from '../utils/motion';

export default function Template({ children }) {
  return (
    <motion.div
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      className="min-h-screen"
    >
      {children}
    </motion.div>
  );
}
