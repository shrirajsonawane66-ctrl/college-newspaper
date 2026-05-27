"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { fetchCategories, type CategoryItem } from "@/lib/categories";

export default function Footer() {
  const [cats, setCats] = useState<CategoryItem[]>([]);

  useEffect(() => {
    fetchCategories().then(setCats);
  }, []);

  const visibleCats = cats.filter((c) => c.visible);

  return (
    <footer className="bg-ink text-ink-faded mt-16 border-t border-gold/10">
      <div className="newspaper-container py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="font-serif text-xl font-bold tracking-[0.05em] text-paper mb-1">
              WCCBM
            </h3>
            <h4 className="font-serif text-xs tracking-[0.25em] text-ink-faded/60 mb-3">
              T I M E L I N E
            </h4>
            <p className="text-sm leading-relaxed text-ink-faded/70 font-body">
              The official student newspaper of WCCBM. Bringing you campus news,
              announcements, achievements, and stories since 2026.
            </p>
          </div>

          <div>
            <h4 className="byline text-paper/60 mb-3">Sections</h4>
            <ul className="space-y-1.5">
              {visibleCats.map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/category/${cat.slug}`} className="text-sm text-ink-faded/70 hover:text-paper transition-colors font-body">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="byline text-paper/60 mb-3">Quick Links</h4>
            <ul className="space-y-1.5">
              {[
                { label: "Founder", href: "/about" },
                { label: "Contact", href: "/contact" },
                { label: "Meme", href: "/meme" },
                { label: "Archives", href: "/archive" },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-ink-faded/70 hover:text-paper transition-colors font-body">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="byline text-paper/60 mb-3">Contact</h4>
            <ul className="space-y-1.5 text-sm text-ink-faded/70 font-body">
              <li>WCCBM Campus, College Road, Nashik</li>
              <li>
                <a href="mailto:timeline@wccbm.edu.in" className="hover:text-paper transition-colors">
                  timeline@wccbm.edu.in
                </a>
              </li>
              <li>+91 123-456-7890</li>
            </ul>
          </div>
        </div>

        <div className="relative mt-8 mb-4">
          <div className="newspaper-rule-dashed opacity-30" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-ink-faded/60 font-body">
            &copy; {new Date().getFullYear()} WCCBM TIMELINE. All rights reserved.
          </p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-ink-faded/50 font-body font-semibold">
            Printed in the spirit of independent campus journalism
          </p>
        </div>
      </div>
    </footer>
  );
}
