"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export default function AnalyticsCard({
  label, value, change, icon,
}: {
  label: string; value: string; change?: string; icon: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="newspaper-card p-4 flex items-center gap-3"
    >
      <div className="w-9 h-9 bg-sepia/10 flex items-center justify-center text-sepia">
        {icon}
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-[0.15em] text-ink-faded font-semibold font-body">{label}</p>
        <p className="text-lg font-bold font-serif text-ink">{value}</p>
        {change && <p className="text-[10px] text-emerald-700 font-body font-medium">{change}</p>}
      </div>
    </motion.div>
  );
}
