import { motion } from "framer-motion";

// Wraps each routed page in a smooth fade + rise transition. AnimatePresence
// in App.jsx handles the exit animation on route change. Respects the user's
// reduced-motion preference automatically via Framer Motion.
const variants = {
  initial: { opacity: 0, y: 16 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.25, ease: [0.4, 0, 1, 1] } },
};

export default function PageTransition({ children }) {
  return (
    <motion.div variants={variants} initial="initial" animate="enter" exit="exit" style={{ minHeight: "60vh" }}>
      {children}
    </motion.div>
  );
}

