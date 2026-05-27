"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Smile } from "lucide-react";
import BreakingNews from "@/components/layout/BreakingNews";
import Navbar from "@/components/layout/Navbar";
import Masthead from "@/components/layout/Masthead";
import CategoryNav from "@/components/layout/CategoryNav";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/lib/supabase";
import type { Article } from "@/lib/data";
import ArticleCard from "@/components/ui/ArticleCard";
import TrendingSidebar from "@/components/sections/TrendingSidebar";

interface ArticleRow {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  category_slug: string;
  author: string;
  author_role: string;
  image_url: string;
  thumbnail_url: string;
  published_at: string;
  is_published: boolean;
  read_time: string;
}

export default function MemePage() {
  const [memeArticles, setMemeArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("articles")
      .select("*")
      .eq("category_slug", "meme")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const mapped: Article[] = (data || []).map((row: ArticleRow) => ({
          id: row.id,
          title: row.title,
          summary: row.summary,
          content: row.content,
          category: row.category,
          categorySlug: row.category_slug,
          imageUrl: row.image_url,
          thumbnailUrl: row.thumbnail_url || "",
          author: row.author,
          authorRole: row.author_role,
          publishedAt: row.published_at,
          isPublished: row.is_published,
          featured: false,
          trending: false,
          editorPick: false,
          readTime: row.read_time,
        }));
        setMemeArticles(mapped);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <BreakingNews />
      <Navbar />
      <Masthead />
      <CategoryNav />
      <main className="newspaper-page">
        <div className="newspaper-container py-8">
          <div className="flex items-center gap-3 mb-2">
            <Smile className="w-5 h-5 text-sepia" />
            <div className="section-head">Meme Section</div>
          </div>
          <div className="newspaper-rule-thick max-w-[60px] mb-1" />
          <h1 className="font-serif text-3xl sm:text-4xl font-black text-ink tracking-tight leading-[1.05]">
            WCCBM Memes
          </h1>
          <p className="byline-serif mt-1">
            The lighter side of campus life &mdash; relatable, hilarious, and 100% WCCBM.
          </p>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {loading ? (
                <div className="text-center py-16">
                  <div className="inline-block w-5 h-5 border border-ink/20 border-t-ink rounded-full animate-spin" />
                </div>
              ) : memeArticles.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {memeArticles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 border-2 border-dashed border-border">
                  <Smile className="w-10 h-10 text-ink-faded mx-auto mb-3" />
                  <p className="text-ink-faded font-body">No memes yet. The fun starts soon!</p>
                </div>
              )}
            </div>
            <aside className="space-y-6 border-l border-border pl-6">
              <TrendingSidebar articles={memeArticles} />
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
