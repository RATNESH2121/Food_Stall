import { motion } from 'framer-motion';

export default function Card({ children, className = '', hover = true, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.4, 0, 0.2, 1] }}
      whileHover={hover ? { y: -1, transition: { duration: 0.15 } } : {}}
      className={`bg-white rounded-2xl border border-slate-100 shadow-sm ${className}`}
    >
      {children}
    </motion.div>
  );
}
