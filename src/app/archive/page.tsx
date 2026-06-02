"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import BreakingNews from "@/components/layout/BreakingNews";
import Navbar from "@/components/layout/Navbar";
import Masthead from "@/components/layout/Masthead";
import CategoryNav from "@/components/layout/CategoryNav";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/lib/supabase";
import type { Article } from "@/lib/data";
import ArticleCard from "@/components/ui/ArticleCard";

interface ArticleRow {
  id: string;
  title: string;
  subheadline: string;
  summary: string;
  content: string;
  category: string;
  category_slug: string;
  author: string;
  author_role: string;
  image_url: string;
  thumbnail_url: string;
  cover_image: string;
  image_caption: string;
  image_credit: string;
  published_at: string;
  is_published: boolean;
  drop_cap: boolean;
  read_time: string;
  tags: string;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

export default function ArchivePage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [searchQuery, setSearchQuery] = useState("");
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("articles")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(200)
      .then(({ data }) => {
        const mapped: Article[] = (data || []).map((row: ArticleRow) => {
        const imgUrl = row.image_url || row.thumbnail_url || row.cover_image || "";
        return {
          id: row.id,
          title: row.title,
          subheadline: row.subheadline || "",
          summary: row.summary,
          content: row.content,
          category: row.category,
          categorySlug: row.category_slug,
          imageUrl: imgUrl,
          thumbnailUrl: imgUrl,
          coverImage: imgUrl,
          imageCaption: row.image_caption || "",
          imageCredit: row.image_credit || "",
          author: row.author,
          authorRole: row.author_role,
          publishedAt: row.published_at,
          isPublished: row.is_published,
          dropCap: row.drop_cap !== false,
          featured: false,
          trending: false,
          editorPick: false,
          readTime: row.read_time,
          tags: row.tags || "",
        };
      });
        setAllArticles(mapped);
        setLoading(false);
      });
  }, []);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDay }, (_, i) => null);

  const filtered = allArticles.filter((a) => {
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
              className="pl-8 pr-3 py-1.5 text-sm border border-border bg-paper focus:outline-none font-sans placeholder:text-ink-faded"
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
                <button onClick={goToday} className="text-xs font-sans font-semibold text-sepia hover:underline">
                  {MONTHS[month]} {year}
                </button>
                <button onClick={nextMonth} className="p-1 hover:bg-paper-dark transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-px p-2 text-center">
                {WEEKDAYS.map((d) => (
                  <div key={d} className="text-[10px] text-ink-faded py-1 uppercase tracking-wider font-sans font-semibold">{d}</div>
                ))}
                {padding.map((_, i) => <div key={`pad-${i}`} className="py-1" />)}
                {days.map((d) => {
                  const hasArticle = allArticles.some((a) => {
                    const ad = new Date(a.publishedAt);
                    return ad.getDate() === d && ad.getMonth() === month && ad.getFullYear() === year;
                  });
                  const isToday = d === now.getDate() && month === now.getMonth() && year === now.getFullYear();
                  return (
                    <div key={d} className={`py-1 text-xs relative font-sans ${isToday ? "bg-ink text-paper font-bold" : "text-ink-light"}`}>
                      {d}
                      {hasArticle && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-sepia" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block w-5 h-5 border border-ink/20 border-t-ink rounded-full animate-spin" />
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border border-dashed border-border">
                <p className="text-ink-faded font-sans">No articles found for this period.</p>
                <button onClick={goToday} className="mt-1 text-sm text-sepia hover:underline font-sans">View this month</button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
