"use client";

import { motion } from "framer-motion";

interface RedDotProps {
  size?: "sm" | "md";
  className?: string;
}

export default function RedDot({ size = "sm", className = "" }: RedDotProps) {
  const sizeClass = size === "md" ? "w-2 h-2" : "w-1.5 h-1.5";

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`relative inline-flex shrink-0 ${sizeClass} ${className}`}
      aria-label="New content available"
    >
      <span
        className={`absolute inset-0 rounded-full bg-[#a61e1e] animate-red-dot`}
      />
      <span
        className={`absolute inset-0 rounded-full bg-[#a61e1e] opacity-20 blur-[1px]`}
      />
    </motion.span>
  );
}
