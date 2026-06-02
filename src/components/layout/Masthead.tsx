"use client";

import Link from "next/link";
import CalendarWidget from "./CalendarWidget";

export default function Masthead() {
  return (
    <div className="bg-paper">
      <div className="newspaper-container">
        <div className="flex items-center justify-between py-2">
          <CalendarWidget plain />
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-ink-lighter font-sans font-semibold">
            <span>Vol. CII</span>
            <span className="w-px h-3 bg-border" />
            <span>No. 42</span>
          </div>
        </div>
        <div className="newspaper-rule-dashed" />
        <div className="py-6 sm:py-8 md:py-10 text-center">
          <Link href="/">
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black tracking-[-0.02em] text-ink leading-[0.85]">
              WCCBM
            </h1>
            <h2 className="font-serif text-xl sm:text-2xl md:text-3xl lg:text-5xl tracking-[0.3em] text-sepia font-light mt-1">
              T I M E L I N E
            </h2>
          </Link>
        </div>
        <div className="masthead-meta">
          <span>The Official Student Newspaper</span>
        </div>
      </div>
    </div>
  );
}
