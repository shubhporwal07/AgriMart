'use client';

// Centralized motion timing tokens (in seconds)
export const DURATION = {
  fast: 0.14,     // 140ms — button feedback, icon changes, small hover effects
  normal: 0.22,   // 220ms — dropdowns, toasts, cards, modals, state changes
  slow: 0.28,     // 280ms — larger drawers, page transitions, content reveals
};

// Natural easing curves
export const EASE = {
  out: [0.22, 1, 0.36, 1],       // Smooth deceleration for entering
  in: [0.4, 0, 1, 1],            // Crisp acceleration for exiting
  inOut: [0.4, 0, 0.2, 1],       // Reversible state changes
};

// Page enter transition (used in src/app/template.js)
export const pageTransition = {
  initial: { opacity: 0.94, y: 3 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.1, ease: EASE.out },
  },
};

// Modal & drawer backdrop overlay
export const backdropVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.18, ease: EASE.out },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15, ease: EASE.in },
  },
};

// Modal dialog panel
export const modalVariants = {
  initial: { opacity: 0, y: 12, scale: 0.97 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: DURATION.normal, ease: EASE.out },
  },
  exit: {
    opacity: 0,
    y: 8,
    scale: 0.98,
    transition: { duration: 0.16, ease: EASE.in },
  },
};

// Dropdown menu
export const dropdownVariants = {
  initial: { opacity: 0, y: -6, scale: 0.97 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.16, ease: EASE.out },
  },
  exit: {
    opacity: 0,
    y: -4,
    scale: 0.97,
    transition: { duration: 0.12, ease: EASE.in },
  },
};

// Right slide-in drawer (mobile filter drawer)
export const drawerRightVariants = {
  initial: { x: '100%' },
  animate: {
    x: 0,
    transition: { duration: DURATION.slow, ease: EASE.out },
  },
  exit: {
    x: '100%',
    transition: { duration: 0.2, ease: EASE.in },
  },
};

// Collapsible / accordion content
export const accordionVariants = {
  initial: { height: 0, opacity: 0 },
  animate: {
    height: 'auto',
    opacity: 1,
    transition: { duration: 0.2, ease: EASE.inOut },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.16, ease: EASE.inOut },
  },
};

// Toast & notification banner
export const toastVariants = {
  initial: { opacity: 0, y: 10, scale: 0.97 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.2, ease: EASE.out },
  },
  exit: {
    opacity: 0,
    y: 6,
    scale: 0.97,
    transition: { duration: 0.16, ease: EASE.in },
  },
};

// Cart list item with smooth collapse on removal
export const cartItemVariants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: EASE.out },
  },
  exit: {
    opacity: 0,
    x: -16,
    height: 0,
    paddingTop: 0,
    paddingBottom: 0,
    marginTop: 0,
    marginBottom: 0,
    transition: { duration: 0.22, ease: EASE.inOut },
  },
};

// Wishlist card item with smooth horizontal fade-out
export const wishlistItemVariants = {
  initial: { opacity: 0, y: 8, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.2, ease: EASE.out },
  },
  exit: {
    opacity: 0,
    x: -16,
    scale: 0.96,
    transition: { duration: 0.2, ease: EASE.in },
  },
};

// Tab content subtle crossfade
export const tabContentVariants = {
  initial: { opacity: 0, y: 4 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.16, ease: EASE.out },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: { duration: 0.12, ease: EASE.in },
  },
};

// Form validation error / status message
export const fieldMessageVariants = {
  initial: { opacity: 0, y: -4, height: 0 },
  animate: {
    opacity: 1,
    y: 0,
    height: 'auto',
    transition: { duration: 0.18, ease: EASE.out },
  },
  exit: {
    opacity: 0,
    y: -4,
    height: 0,
    transition: { duration: 0.14, ease: EASE.in },
  },
};

// Floating bar (bottom quick cart bar)
export const floatingBarVariants = {
  initial: { opacity: 0, y: 24, scale: 0.96 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.22, ease: EASE.out },
  },
  exit: {
    opacity: 0,
    y: 20,
    scale: 0.96,
    transition: { duration: 0.16, ease: EASE.in },
  },
};

// Quantity number transition
export const qtyNumberVariants = {
  initial: { opacity: 0, y: -6, scale: 0.9 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.14, ease: EASE.out },
  },
  exit: {
    opacity: 0,
    y: 6,
    scale: 0.9,
    transition: { duration: 0.1, ease: EASE.in },
  },
};

// Subtle section scroll reveal (used sparingly on major sections)
export const sectionRevealProps = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 'some' },
  transition: { duration: DURATION.slow, ease: EASE.out },
};

// Tactile press helpers
export const buttonTap = { scale: 0.97 };
export const iconTap = { scale: 0.92 };
export const fastTransition = { duration: DURATION.fast, ease: EASE.out };
