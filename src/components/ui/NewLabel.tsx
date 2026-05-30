"use client";

import { motion } from "framer-motion";

export default function NewLabel() {
  return (
    <motion.span
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -4 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="inline-flex items-center gap-1 text-[8px] uppercase tracking-[0.18em] font-body font-bold text-[#a61e1e] animate-new-label"
    >
      <span className="inline-block w-1 h-1 rounded-full bg-[#a61e1e] opacity-80" />
      New
    </motion.span>
  );
}
