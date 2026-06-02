"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import SearchBar from "./SearchBar";
import { fetchCategories, type CategoryItem } from "@/lib/categories";
import { supabase } from "@/lib/supabase";
import { hasSectionUnread, markSectionAsRead } from "@/lib/notifications";
import RedDot from "@/components/ui/RedDot";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
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

  const handleCatClick = (slug: string) => {
    markSectionAsRead(slug);
    setUnreadSections((prev) => { const next = new Set(prev); next.delete(slug); return next; });
  };

  return (
    <header className="sticky top-0 z-50 bg-paper/98 border-b border-border border-glow-bottom">
      <div className="newspaper-container">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 -ml-2 text-ink-lighter hover:text-ink flex items-center justify-center"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link
              href="/"
              className="font-serif text-base sm:text-lg font-bold tracking-[0.15em] text-ink uppercase leading-none"
            >
              WCCBM Timeline
            </Link>
            <span className="hidden sm:inline w-px h-4 bg-border/60" />
            <Link
              href="/admin/login"
              className="hidden sm:flex items-center justify-center text-xs uppercase tracking-[0.2em] font-sans font-semibold text-ink-lighter hover:text-ink leading-none"
            >
              Admin
            </Link>
          </div>

          <nav className="hidden lg:flex items-center justify-center h-full gap-1">
            <Link
              href="/"
              className="flex items-center justify-center h-full px-3 text-[13px] uppercase tracking-[0.15em] text-ink-lighter hover:text-ink font-sans font-semibold whitespace-nowrap border-b-2 border-transparent hover:border-sepia/40 transition-all duration-200"
            >
              Home
            </Link>
            {visibleCats.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                onClick={() => handleCatClick(cat.slug)}
                className="flex items-center justify-center h-full px-3 text-[13px] uppercase tracking-[0.15em] text-ink-lighter hover:text-ink font-sans font-semibold whitespace-nowrap border-b-2 border-transparent hover:border-sepia/40 transition-all duration-200 gap-1.5"
              >
                {cat.name}
                {unreadSections.has(cat.slug) && <RedDot />}
              </Link>
            ))}
            <Link
              href="/archive"
              className="flex items-center justify-center h-full px-3 text-[13px] uppercase tracking-[0.15em] text-ink-lighter hover:text-ink font-sans font-semibold whitespace-nowrap border-b-2 border-transparent hover:border-sepia/40 transition-all duration-200"
            >
              Archives
            </Link>
            <span className="w-px h-4 bg-border mx-1.5 shrink-0" />
            <Link
              href="/about"
              className="flex items-center justify-center h-full px-3 text-[13px] uppercase tracking-[0.15em] text-ink-lighter hover:text-ink font-sans font-semibold whitespace-nowrap border-b-2 border-transparent hover:border-sepia/40 transition-all duration-200"
            >
              Founder
            </Link>
          </nav>

          <div className="flex items-center justify-center gap-2">
            <SearchBar />
          </div>
        </div>
      </div>

      <div
        className={`border-t border-border bg-paper overflow-hidden lg:hidden transition-all duration-200 ${
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="newspaper-container py-3 space-y-1">
          <Link href="/" onClick={() => setMobileOpen(false)} className="block py-2 px-3 text-sm font-serif font-semibold text-ink hover:bg-paper-dark/50 rounded transition-colors">
            Home
          </Link>
          {visibleCats.map((cat) => (
            <Link key={cat.slug} href={`/category/${cat.slug}`} onClick={() => { setMobileOpen(false); handleCatClick(cat.slug); }} className="flex items-center gap-2 py-2 px-3 text-sm font-serif text-ink-light hover:bg-paper-dark/50 rounded transition-colors">
              {cat.name}
              {unreadSections.has(cat.slug) && <RedDot />}
            </Link>
          ))}
          <Link href="/archive" onClick={() => setMobileOpen(false)} className="block py-2 px-3 text-sm font-serif text-ink-light hover:bg-paper-dark/50 rounded transition-colors">
            Archives
          </Link>
          <Link href="/about" onClick={() => setMobileOpen(false)} className="block py-2 px-3 text-sm font-serif text-ink-light hover:bg-paper-dark/50 rounded transition-colors">
            Founder
          </Link>
          <div className="pt-2 mt-2 border-t border-border">
            <Link href="/admin/login" onClick={() => setMobileOpen(false)} className="block py-2 px-3 text-sm font-serif font-semibold text-sepia hover:bg-paper-dark/50 rounded transition-colors">
              Admin Login
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
