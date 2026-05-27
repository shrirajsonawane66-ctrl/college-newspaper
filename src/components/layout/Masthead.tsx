"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Masthead() {
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    const now = new Date();
    setDateStr(now.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }));
  }, []);

  return (
    <div className="bg-paper">
      <div className="newspaper-container">
        <div className="flex items-center justify-between py-2">
          <div className="byline flex items-center">{dateStr}</div>
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-ink-lighter font-serif">
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
            <h2 className="font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl tracking-[0.3em] text-sepia font-normal mt-1">
              T I M E L I N E
            </h2>
          </Link>
        </div>
        <div className="masthead-meta">
          <span>The Official Student Newspaper</span>
          <span>{dateStr}</span>
          <span>Since 1965</span>
        </div>
      </div>
    </div>
  );
}
