"use client";

import Link from "next/link";

const tickerItems = [
  "WCCBM TIMELINE — The Official Student Newspaper",
  "Breaking: WCCBM Campus News • Live Updates",
  "Printed in the Spirit of Independent Campus Journalism",
  "Est. 2026 • Serving the WCCBM Community",
];

export default function BreakingNews() {
  return (
    <div className="relative bg-ink/95 border-b border-gold/20 overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox%3D%270 0 256 256%27 xmlns%3D%27http://www.w3.org/2000/svg%27%3E%3Cfilter id%3D%27n%27%3E%3CfeTurbulence type%3D%27fractalNoise%27 baseFrequency%3D%270.5%27 numOctaves%3D%273%27 stitchTiles%3D%27stitch%27/%3E%3C/filter%3E%3Crect width%3D%27100%25%27 height%3D%27100%25%27 filter%3D%27url(%23n)%27 opacity%3D%270.04%27/%3E%3C/svg%3E')] opacity-40" />

      <div className="relative flex items-center h-10 sm:h-11">
        <div className="shrink-0 flex items-center gap-2 bg-gold text-ink font-serif font-bold text-xs uppercase tracking-[0.22em] px-4 h-full z-10">
          <span className="inline-block w-1.5 h-1.5 bg-ink rounded-full animate-pulse-glow" />
          Breaking
        </div>

        <div className="flex-1 overflow-hidden mask-fade-x">
          <div className="animate-marquee flex items-center h-full gap-14 sm:gap-18">
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <span
                key={i}
                className="text-paper/85 font-body text-xs sm:text-sm tracking-wide shrink-0 flex items-center gap-4 sm:gap-6"
              >
                {item}
                <span className="inline-block w-px h-3 bg-gold/30" />
              </span>
            ))}
          </div>
        </div>

        <Link
          href="/archive"
          className="shrink-0 text-[11px] uppercase tracking-[0.18em] text-gold-light/80 hover:text-gold-light transition-colors px-3 font-body font-semibold h-full flex items-center"
        >
          All News &rarr;
        </Link>
        <Link
          href="/about"
          className="shrink-0 text-[11px] uppercase tracking-[0.18em] text-gold-light/80 hover:text-gold-light transition-colors px-3 font-body font-semibold border-l border-gold/20 h-full flex items-center"
        >
          Founder
        </Link>
      </div>
    </div>
  );
}
