"use client";

import { motion } from "framer-motion";
import TermsModal from "./TermsModal";
import FloatingParticles from "@/components/ui/FloatingParticles";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TermsModal />
      <FloatingParticles />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </>
  );
}
