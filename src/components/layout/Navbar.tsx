"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SearchBar from "./SearchBar";
import CalendarWidget from "./CalendarWidget";
import { categories } from "@/lib/data";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-paper/98 border-b border-border border-glow-bottom">
      <div className="newspaper-container">
        <div className="flex items-center justify-between h-12">
          <div className="flex items-center gap-4">
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
          </div>

          <nav className="hidden lg:flex items-center justify-center h-full gap-1">
            <Link
              href="/"
              className="flex items-center justify-center h-full px-4 text-xs uppercase tracking-[0.2em] text-ink-lighter hover:text-ink font-body font-semibold whitespace-nowrap border-b-2 border-transparent hover:border-sepia/40 transition-all duration-200"
            >
              Home
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="flex items-center justify-center h-full px-4 text-xs uppercase tracking-[0.2em] text-ink-lighter hover:text-ink font-body font-semibold whitespace-nowrap border-b-2 border-transparent hover:border-sepia/40 transition-all duration-200"
              >
                {cat.name}
              </Link>
            ))}
            <Link
              href="/archive"
              className="flex items-center justify-center h-full px-4 text-xs uppercase tracking-[0.2em] text-ink-lighter hover:text-ink font-body font-semibold whitespace-nowrap border-b-2 border-transparent hover:border-sepia/40 transition-all duration-200"
            >
              Meme
            </Link>
            <span className="w-px h-4 bg-border mx-2 shrink-0" />
            <Link
              href="/about"
              className="flex items-center justify-center h-full px-4 text-xs uppercase tracking-[0.2em] text-ink-lighter hover:text-ink font-body font-semibold whitespace-nowrap border-b-2 border-transparent hover:border-sepia/40 transition-all duration-200"
            >
              Founder
            </Link>
          </nav>

          <div className="flex items-center justify-center gap-1">
            <CalendarWidget />
            <SearchBar />
            <Link
              href="/admin/login"
              className="hidden sm:flex items-center justify-center gap-1 text-xs uppercase tracking-wider font-body font-semibold text-ink-lighter hover:text-ink px-2 h-8"
            >
              Admin
            </Link>
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
              {categories.map((cat) => (
                <Link key={cat.slug} href={`/category/${cat.slug}`} onClick={() => setMobileOpen(false)} className="block py-2 px-3 text-sm font-serif text-ink-light hover:bg-paper-dark/50 rounded transition-colors">
                  {cat.name}
                </Link>
              ))}
              <Link href="/archive" onClick={() => setMobileOpen(false)} className="block py-2 px-3 text-sm font-serif text-ink-light hover:bg-paper-dark/50 rounded transition-colors">
                Meme
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
