"use client";

import { useEffect, useState } from "react";
import BreakingNews from "@/components/layout/BreakingNews";
import Navbar from "@/components/layout/Navbar";
import Masthead from "@/components/layout/Masthead";
import CategoryNav from "@/components/layout/CategoryNav";
import NewsTicker from "@/components/layout/NewsTicker";
import Footer from "@/components/layout/Footer";
import NewspaperFoldSection from "@/components/ui/NewspaperFoldSection";
import HeroSection from "@/components/sections/HeroSection";
import LatestNewsGrid from "@/components/sections/LatestNewsGrid";
import TrendingSidebar from "@/components/sections/TrendingSidebar";
import EditorPicks from "@/components/sections/EditorPicks";
import CategoriesSection from "@/components/sections/CategoriesSection";
import ArticleCard from "@/components/ui/ArticleCard";
import { supabase } from "@/lib/supabase";
import type { Article } from "@/lib/data";

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
  featured: boolean;
  trending: boolean;
  editor_pick: boolean;
  read_time: string;
  is_new: boolean;
}

export default function Home() {
  const [articlesList, setArticlesList] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchArticles() {
      const { data, error: fetchError } = await supabase
        .from("articles")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (fetchError) {
        setError("Failed to load articles.");
        setLoading(false);
        return;
      }

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
        featured: row.featured || false,
        trending: row.trending || false,
        editorPick: row.editor_pick || false,
        readTime: row.read_time,
        isNew: row.is_new,
      }));

      setArticlesList(mapped);
      setLoading(false);
    }

    fetchArticles();
  }, []);

  const latestArticles = articlesList.slice(0, 4);

  if (loading) {
    return (
      <>
        <BreakingNews />
        <Navbar />
        <Masthead />
        <CategoryNav />
        <main className="newspaper-container py-16 text-center">
          <div className="flex items-center justify-center gap-2 text-ink-faded text-sm font-body">
            <span className="inline-block w-4 h-4 border border-ink/20 border-t-ink rounded-full animate-spin" />
            Loading articles&hellip;
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <BreakingNews />
        <Navbar />
        <Masthead />
        <CategoryNav />
        <main className="newspaper-container py-16 text-center">
          <p className="text-sm text-red-700 font-body bg-red-50 border border-red-200 inline-block px-4 py-2">{error}</p>
        </main>
        <Footer />
      </>
    );
  }

  if (articlesList.length === 0) {
    return (
      <>
        <BreakingNews />
        <Navbar />
        <Masthead />
        <CategoryNav />
        <main className="newspaper-container py-16 text-center">
          <div className="border-2 border-dashed border-border max-w-md mx-auto p-8">
            <h2 className="font-serif text-xl font-bold text-ink mb-2">No Articles Yet</h2>
            <p className="text-sm text-ink-faded font-body">Published articles will appear here once they are created in the admin panel.</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <BreakingNews />
      <Navbar />
      <Masthead />
      <CategoryNav />
      <NewsTicker articles={articlesList} />
      <main className="newspaper-page">
        <div className="newspaper-container py-8">
          <NewspaperFoldSection>
            <HeroSection articles={articlesList} />
          </NewspaperFoldSection>

          <div className="newspaper-rule-double my-10" />

          <div className="broadsheet-grid">
            <div className="lead-col space-y-10">
              <NewspaperFoldSection foldIntensity={0.7}>
                <LatestNewsGrid articles={articlesList} />
              </NewspaperFoldSection>

              <div className="newspaper-rule-dashed my-6" />

              <NewspaperFoldSection foldIntensity={0.7}>
                <EditorPicks articles={articlesList} />
              </NewspaperFoldSection>

              <div className="newspaper-rule-dashed my-6" />

              <NewspaperFoldSection foldIntensity={0.5}>
                <CategoriesSection articles={articlesList} />
              </NewspaperFoldSection>
            </div>
            <aside className="space-y-6 border-l border-border pl-6">
              <NewspaperFoldSection foldIntensity={0.5}>
                <TrendingSidebar articles={articlesList} />
              </NewspaperFoldSection>
              <NewspaperFoldSection foldIntensity={0.4}>
                <div className="newspaper-card">
                  <div className="px-4 pt-3.5 pb-2 border-b border-border">
                    <h3 className="font-serif text-sm font-bold text-ink uppercase tracking-[0.1em]">Latest Updates</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    {latestArticles.map((article) => (
                      <ArticleCard key={article.id} article={article} variant="compact" />
                    ))}
                  </div>
                </div>
              </NewspaperFoldSection>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
