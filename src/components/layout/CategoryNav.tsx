"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { fetchCategories, type CategoryItem } from "@/lib/categories";
import { supabase } from "@/lib/supabase";
import RedDot from "@/components/ui/RedDot";

export default function CategoryNav() {
  const pathname = usePathname();
  const [cats, setCats] = useState<CategoryItem[]>([]);
  const [newCategories, setNewCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCategories().then(setCats);
  }, []);

  useEffect(() => {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    supabase
      .from("articles")
      .select("category_slug")
      .or(`is_new.eq.true,published_at.gte.${twentyFourHoursAgo}`)
      .then(({ data }) => {
        if (data) {
          const slugs = new Set(data.map((r: { category_slug: string }) => r.category_slug));
          setNewCategories(slugs);
        }
      });
  }, []);

  const visibleCats = cats.filter((c) => c.visible);

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
          {visibleCats.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className={`shrink-0 px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] font-body font-semibold transition-colors border-r border-border last:border-r-0 whitespace-nowrap flex items-center justify-center ${
                pathname === `/category/${cat.slug}` ? "text-ink" : "text-ink-lighter hover:text-ink"
              }`}
            >
              {cat.name}
              {newCategories.has(cat.slug) && <RedDot />}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
