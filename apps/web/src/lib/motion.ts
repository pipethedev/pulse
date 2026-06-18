import type { Transition, Variants } from "framer-motion";

// A soft, smooth easing curve (easeOutExpo-ish) used across the app so
// entrances, exits, and layout shifts all feel like the same motion language.
export const soft: Transition = {
  duration: 0.28,
  ease: [0.22, 1, 0.36, 1],
};

export const gridVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05, delayChildren: 0.04 },
  },
};

export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: soft },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.16 } },
};
