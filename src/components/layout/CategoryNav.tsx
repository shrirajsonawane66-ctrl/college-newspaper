"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { categories } from "@/lib/data";

export default function CategoryNav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-border bg-paper-dark/30">
      <div className="newspaper-container">
        <nav className="flex items-center overflow-x-auto scrollbar-none gap-0 py-2">
          <Link
            href="/"
            className={`shrink-0 px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] font-body font-semibold transition-colors border-r border-border last:border-r-0 whitespace-nowrap flex items-center justify-center ${
              pathname === "/" ? "text-ink" : "text-ink-lighter hover:text-ink"
            }`}
          >
            Home
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className={`shrink-0 px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] font-body font-semibold transition-colors border-r border-border last:border-r-0 whitespace-nowrap flex items-center justify-center ${
                pathname === `/category/${cat.slug}` ? "text-ink" : "text-ink-lighter hover:text-ink"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
