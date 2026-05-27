"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import BreakingNews from "@/components/layout/BreakingNews";
import Navbar from "@/components/layout/Navbar";
import Masthead from "@/components/layout/Masthead";
import CategoryNav from "@/components/layout/CategoryNav";
import Footer from "@/components/layout/Footer";
import { articles } from "@/lib/data";
import ArticleCard from "@/components/ui/ArticleCard";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

export default function ArchivePage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [searchQuery, setSearchQuery] = useState("");

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDay }, (_, i) => null);

  const filtered = articles.filter((a) => {
    const d = new Date(a.publishedAt);
    const matchesDate = d.getMonth() === month && d.getFullYear() === year;
    const matchesSearch = !searchQuery ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDate && matchesSearch;
  });

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else { setMonth(month - 1); }
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else { setMonth(month + 1); }
  };
  const goToday = () => { setMonth(now.getMonth()); setYear(now.getFullYear()); };

  return (
    <>
      <BreakingNews />
      <Navbar />
      <Masthead />
      <CategoryNav />
      <main className="newspaper-container py-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <div className="section-head">Archive</div>
            <div className="newspaper-rule-thick max-w-[40px] mt-1 mb-2" />
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink tracking-tight">Archives</h1>
            <p className="byline mt-0.5">Browse articles by month and year</p>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-faded" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search archives..."
              className="pl-8 pr-3 py-1.5 text-sm border border-border bg-paper focus:outline-none font-body placeholder:text-ink-faded"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="newspaper-card">
              <div className="flex items-center justify-between p-3 border-b border-border">
                <button onClick={prevMonth} className="p-1 hover:bg-paper-dark transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={goToday} className="text-xs font-serif font-semibold text-sepia hover:underline">
                  {MONTHS[month]} {year}
                </button>
                <button onClick={nextMonth} className="p-1 hover:bg-paper-dark transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-px p-2 text-center">
                {WEEKDAYS.map((d) => (
                  <div key={d} className="text-[10px] text-ink-faded py-1 uppercase tracking-wider font-body font-semibold">{d}</div>
                ))}
                {padding.map((_, i) => <div key={`pad-${i}`} className="py-1" />)}
                {days.map((d) => {
                  const hasArticle = articles.some((a) => {
                    const ad = new Date(a.publishedAt);
                    return ad.getDate() === d && ad.getMonth() === month && ad.getFullYear() === year;
                  });
                  const isToday = d === now.getDate() && month === now.getMonth() && year === now.getFullYear();
                  return (
                    <div key={d} className={`py-1 text-xs relative font-body ${isToday ? "bg-ink text-paper font-bold" : "text-ink-light"}`}>
                      {d}
                      {hasArticle && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-sepia" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border border-dashed border-border">
                <p className="text-ink-faded font-body">No articles found for this period.</p>
                <button onClick={goToday} className="mt-1 text-sm text-sepia hover:underline font-body">View this month</button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
