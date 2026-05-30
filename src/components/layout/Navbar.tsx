"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SearchBar from "./SearchBar";
import { fetchCategories, type CategoryItem } from "@/lib/categories";
import { supabase } from "@/lib/supabase";
import RedDot from "@/components/ui/RedDot";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
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
    <header className="sticky top-0 z-50 bg-paper/98 border-b border-border border-glow-bottom">
      <div className="newspaper-container">
        <div className="flex items-center justify-between h-12">
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
              className="font-serif text-base sm:text-lg font-bold tracking-[0.12em] text-ink uppercase leading-none"
            >
              WCCBM Timeline
            </Link>
            <span className="hidden sm:inline w-px h-3 bg-border/60" />
            <Link
              href="/admin/login"
              className="hidden sm:flex items-center justify-center text-[10px] uppercase tracking-[0.2em] font-body font-semibold text-ink-lighter hover:text-ink leading-none"
            >
              Admin
            </Link>
          </div>

          <nav className="hidden lg:flex items-center justify-center h-full gap-1">
            <Link
              href="/"
              className="flex items-center justify-center h-full px-4 text-xs uppercase tracking-[0.2em] text-ink-lighter hover:text-ink font-body font-semibold whitespace-nowrap border-b-2 border-transparent hover:border-sepia/40 transition-all duration-200"
            >
              Home
            </Link>
            {visibleCats.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="flex items-center justify-center h-full px-4 text-xs uppercase tracking-[0.2em] text-ink-lighter hover:text-ink font-body font-semibold whitespace-nowrap border-b-2 border-transparent hover:border-sepia/40 transition-all duration-200 gap-1.5"
              >
                {cat.name}
                {newCategories.has(cat.slug) && <RedDot />}
              </Link>
            ))}
            <Link
              href="/archive"
              className="flex items-center justify-center h-full px-4 text-xs uppercase tracking-[0.2em] text-ink-lighter hover:text-ink font-body font-semibold whitespace-nowrap border-b-2 border-transparent hover:border-sepia/40 transition-all duration-200"
            >
              Archives
            </Link>
            <span className="w-px h-4 bg-border mx-2 shrink-0" />
            <Link
              href="/about"
              className="flex items-center justify-center h-full px-4 text-xs uppercase tracking-[0.2em] text-ink-lighter hover:text-ink font-body font-semibold whitespace-nowrap border-b-2 border-transparent hover:border-sepia/40 transition-all duration-200"
            >
              Founder
            </Link>
          </nav>

          <div className="flex items-center justify-center gap-2">
            <SearchBar />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="border-t border-border bg-paper overflow-hidden lg:hidden"
          >
            <div className="newspaper-container py-3 space-y-1">
              <Link href="/" onClick={() => setMobileOpen(false)} className="block py-2 px-3 text-sm font-serif font-semibold text-ink hover:bg-paper-dark/50 rounded transition-colors">
                Home
              </Link>
              {visibleCats.map((cat) => (
                <Link key={cat.slug} href={`/category/${cat.slug}`} onClick={() => setMobileOpen(false)} className="flex items-center gap-2 py-2 px-3 text-sm font-serif text-ink-light hover:bg-paper-dark/50 rounded transition-colors">
                  {cat.name}
                  {newCategories.has(cat.slug) && <RedDot />}
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
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
