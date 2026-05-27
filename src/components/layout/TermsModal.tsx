"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const sections = [
  {
    title: "Respectful Conduct",
    content:
      "All visitors are expected to engage with this publication and its community in a respectful, constructive manner. Harassment, hate speech, or personal attacks will not be tolerated.",
  },
  {
    title: "No Unauthorized Copying",
    content:
      "The content published on WCCBM Timeline is protected under copyright law. Reproduction, redistribution, or repurposing of articles, photographs, or illustrations without explicit written consent is strictly prohibited.",
  },
  {
    title: "Comment Responsibility",
    content:
      "Registered users who submit comments retain responsibility for their own words. WCCBM Timeline reserves the right to moderate, edit, or remove comments that violate our standards of discourse.",
  },
  {
    title: "Privacy Notice",
    content:
      "We collect minimal personal data necessary for site functionality. Your email address and name are stored securely and will never be shared with third parties without your explicit consent.",
  },
  {
    title: "Intellectual Property",
    content:
      "All trademarks, logos, and brand assets displayed on this site are the property of WCCBM or their respective owners. The name 'WCCBM Timeline' and its associated masthead are protected intellectual property.",
  },
  {
    title: "Content Accuracy",
    content:
      "While we strive for factual accuracy in every story, WCCBM Timeline disclaims liability for errors or omissions. Corrections and retractions will be published promptly when errors are brought to our attention.",
  },
];

export default function TermsModal() {
  const [mounted, setMounted] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [checked, setChecked] = useState(false);
  const [declined, setDeclined] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (mounted && !accepted) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mounted, accepted]);

  const handleAccept = () => {
    setAccepted(true);
  };

  const handleDecline = () => {
    setDeclined(true);
  };

  const particles = useRef(
    Array.from({ length: 20 }, () => ({
      x: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 15,
    }))
  );

  if (!mounted) return null;
  if (accepted) return null;

  if (declined) {
    return (
      <div className="fixed inset-0 z-[200] bg-[#1A1410] flex items-center justify-center p-4">
        <div
          className="relative max-w-md w-full p-8 sm:p-10 text-center"
          style={{ backgroundColor: "#F2E7D3" }}
        >
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.07] mix-blend-multiply"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23p)'/%3E%3C/svg%3E")`,
            }}
          />
          <div className="relative z-[2]">
            <div className="w-16 h-16 mx-auto mb-4 border-2 border-[#B08A4A]/40 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7 text-[#B08A4A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h1 className="font-serif text-xl font-bold text-[#2B1D14] tracking-tight mb-2">
              Access Denied
            </h1>
            <p className="text-sm text-[#2B1D14]/70 font-serif leading-relaxed mb-4">
              You must accept the Press Access Agreement to enter WCCBM Timeline.
            </p>
            <div className="h-px bg-gradient-to-r from-transparent via-[#B08A4A]/30 to-transparent mb-4" />
            <div className="flex flex-col gap-2">
              <button
                onClick={handleAccept}
                className="w-full py-2.5 bg-[#2B1D14] text-[#B08A4A] border border-[#B08A4A]/30 text-[10px] uppercase tracking-[0.2em] font-serif font-bold hover:bg-[#B08A4A]/10 transition-colors"
              >
                Accept &amp; Continue
              </button>
              <a
                href="https://www.google.com"
                className="text-[10px] text-[#2B1D14]/40 hover:text-[#B08A4A]/70 font-serif italic transition-colors"
              >
                Leave Site &rarr;
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Cinematic overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-[#1A1410]/90 backdrop-blur-sm"
      />

      {/* Dust particles */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        {particles.current.map((p, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-amber-200/20 pointer-events-none"
            style={{
              left: `${p.x}%`,
              width: p.size,
              height: p.size,
            }}
            initial={{ opacity: 0, y: "100vh" }}
            animate={{
              opacity: [0, 0.5, 0.2, 0],
              y: ["100vh", "-10vh"],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Modal card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-xl max-h-[85vh] overflow-y-auto"
        style={{ backgroundColor: "#F2E7D3" }}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.06] mix-blend-multiply"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23p)'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#B08A4A]/40 to-transparent" />
        <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#B08A4A]/40 to-transparent" />

        <div className="absolute top-3 left-3 w-5 h-5 border-t border-l border-[#B08A4A]/25" />
        <div className="absolute top-3 right-3 w-5 h-5 border-t border-r border-[#B08A4A]/25" />
        <div className="absolute bottom-3 left-3 w-5 h-5 border-b border-l border-[#B08A4A]/25" />
        <div className="absolute bottom-3 right-3 w-5 h-5 border-b border-r border-[#B08A4A]/25" />

        <div className="relative z-[2] p-6 sm:p-8 md:p-10">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full border-2 border-[#B08A4A]/30 flex items-center justify-center bg-[#2B1D14]/5">
              <svg className="w-6 h-6 text-[#B08A4A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
          </div>

          <div className="text-center mb-5">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2B1D14] tracking-wide uppercase">
              Press Access
            </h1>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#2B1D14]/80 tracking-tight -mt-0.5">
              Agreement
            </h2>
            <div className="mt-2 h-px mx-auto w-12 bg-gradient-to-r from-transparent via-[#B08A4A]/50 to-transparent" />
            <p className="mt-2 text-[11px] text-[#2B1D14]/60 font-serif italic leading-relaxed max-w-sm mx-auto">
              Before entering WCCBM Timeline, all visitors must acknowledge and accept our publishing policies and newsroom guidelines.
            </p>
          </div>

          <div className="space-y-3 mb-5">
            {sections.map((section, i) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="border-l-2 border-[#B08A4A]/20 pl-3"
              >
                <h3 className="font-serif text-[11px] font-bold text-[#2B1D14] uppercase tracking-[0.12em]">
                  {section.title}
                </h3>
                <p className="text-[11px] text-[#2B1D14]/65 font-serif leading-relaxed mt-0.5">
                  {section.content}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mb-4">
            <div className="h-px bg-gradient-to-r from-transparent via-[#B08A4A]/25 to-transparent mb-3" />
            <p className="text-[10px] text-[#2B1D14]/50 font-serif italic">
              By continuing, you acknowledge and accept the policies governing access to this publication.
            </p>
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer group mb-4">
            <div className="relative mt-0.5 shrink-0">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                className="peer sr-only"
              />
              <div className="w-4 h-4 border border-[#B08A4A]/40 bg-[#E7D8BC] peer-checked:bg-[#2B1D14] peer-checked:border-[#2B1D14] transition-all duration-200 flex items-center justify-center">
                {checked && (
                  <svg className="w-2.5 h-2.5 text-[#F2E7D3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-[10px] text-[#2B1D14]/60 font-serif leading-relaxed group-hover:text-[#2B1D14]/80 transition-colors">
              I have read and agree to the{" "}
              <span className="font-semibold text-[#2B1D14]/80">Terms &amp; Conditions</span> and{" "}
              <span className="font-semibold text-[#2B1D14]/80">Privacy Policy</span>.
            </span>
          </label>

          <div className="flex flex-col gap-2">
            <motion.button
              whileHover={checked ? { scale: 1.01 } : {}}
              whileTap={checked ? { scale: 0.99 } : {}}
              onClick={handleAccept}
              disabled={!checked}
              className="w-full py-3 bg-[#2B1D14] text-[#B08A4A] border border-[#B08A4A]/30 text-[10px] uppercase tracking-[0.25em] font-serif font-bold transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-gradient-to-t from-[#B08A4A]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="absolute -inset-x-full top-0 h-px bg-gradient-to-r from-transparent via-[#B08A4A]/40 to-transparent group-hover:animate-shimmer" />
              <span className="relative z-[1]">Accept &amp; Continue</span>
            </motion.button>

            <button
              onClick={handleDecline}
              className="w-full py-2 border border-[#B08A4A]/15 text-[10px] uppercase tracking-[0.15em] text-[#2B1D14]/40 font-serif font-semibold hover:text-[#B08A4A]/70 hover:border-[#B08A4A]/30 transition-all duration-300"
            >
              Decline
            </button>
          </div>

          <div className="mt-4 text-center">
            <div className="h-px bg-gradient-to-r from-transparent via-[#B08A4A]/15 to-transparent mb-2" />
            <p className="text-[8px] text-[#2B1D14]/30 font-serif tracking-wider">
              &copy; 2026 WCCBM Timeline. All Rights Reserved.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
