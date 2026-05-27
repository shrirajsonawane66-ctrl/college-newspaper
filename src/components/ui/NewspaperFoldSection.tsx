"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const easing = [0.22, 1, 0.36, 1] as const;

export default function NewspaperFoldSection({
  children,
  className = "",
  foldIntensity = 1,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  foldIntensity?: number;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start center"],
  });

  const rotateX = useTransform(scrollYProgress, [0, 1], [6 * foldIntensity, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [40 * foldIntensity, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 1], [0, 0.4, 1]);
  const shadowOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.08, 0.15, 0]);

  return (
    <div ref={ref} className={`fold-container ${className}`}>
      <motion.div
        style={{
          rotateX,
          y,
          opacity,
        }}
        transition={{ duration: 1.2, ease: easing, delay }}
        className="fold-content relative"
      >
        <motion.div
          className="fold-shadow"
          style={{ opacity: shadowOpacity }}
        />
        <div className="paper-grain">{children}</div>
      </motion.div>
    </div>
  );
}
