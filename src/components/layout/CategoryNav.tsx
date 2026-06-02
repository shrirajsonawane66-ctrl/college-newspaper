"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { fetchCategories, type CategoryItem } from "@/lib/categories";
import { supabase } from "@/lib/supabase";
import { hasSectionUnread, markSectionAsRead } from "@/lib/notifications";
import RedDot from "@/components/ui/RedDot";

export default function CategoryNav() {
  const pathname = usePathname();
  const [cats, setCats] = useState<CategoryItem[]>([]);
  const [latestDates, setLatestDates] = useState<Record<string, string>>({});
  const [unreadSections, setUnreadSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCategories().then(setCats);
  }, []);

  useEffect(() => {
    supabase
      .from("articles")
      .select("category_slug, published_at")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .then(({ data }) => {
        if (!data) return;
        const dates: Record<string, string> = {};
        for (const row of data as { category_slug: string; published_at: string }[]) {
          const slug = row.category_slug;
          if (!dates[slug]) {
            dates[slug] = row.published_at;
          }
        }
        setLatestDates(dates);
      });
  }, []);

  useEffect(() => {
    const unread = new Set<string>();
    for (const cat of cats) {
      const latest = latestDates[cat.slug];
      if (latest && hasSectionUnread(cat.slug, latest)) {
        unread.add(cat.slug);
      }
    }
    setUnreadSections(unread);
  }, [cats, latestDates]);

  const visibleCats = cats.filter((c) => c.visible);

  return (
    <div className="border-b border-border bg-paper-dark/30">
      <div className="newspaper-container">
        <nav className="flex items-center overflow-x-auto scrollbar-none gap-0 py-2.5">
          <Link
            href="/"
            className={`shrink-0 px-4 py-1 text-xs uppercase tracking-[0.18em] font-sans font-semibold transition-colors border-r border-border last:border-r-0 whitespace-nowrap flex items-center justify-center ${
              pathname === "/" ? "text-ink" : "text-ink-lighter hover:text-ink"
            }`}
          >
            Home
          </Link>
          {visibleCats.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              onClick={() => {
                markSectionAsRead(cat.slug);
                setUnreadSections((prev) => { const next = new Set(prev); next.delete(cat.slug); return next; });
              }}
              className={`shrink-0 px-4 py-1 text-xs uppercase tracking-[0.18em] font-sans font-semibold transition-colors border-r border-border last:border-r-0 whitespace-nowrap flex items-center justify-center gap-1 ${
                pathname === `/category/${cat.slug}` ? "text-ink" : "text-ink-lighter hover:text-ink"
              }`}
            >
              {cat.name}
              {unreadSections.has(cat.slug) && <RedDot />}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
