"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BreakingNews from "@/components/layout/BreakingNews";
import Navbar from "@/components/layout/Navbar";
import Masthead from "@/components/layout/Masthead";
import CategoryNav from "@/components/layout/CategoryNav";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/lib/supabase";
import { fetchCategories, type CategoryItem } from "@/lib/categories";
import type { Article } from "@/lib/data";
import ArticleCard from "@/components/ui/ArticleCard";
import TrendingSidebar from "@/components/sections/TrendingSidebar";
import SidebarWidget from "@/components/ui/SidebarWidget";

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
}

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [category, setCategory] = useState<CategoryItem | null>(null);
  const [articleList, setArticleList] = useState<Article[]>([]);
  const [cats, setCats] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories().then((allCats) => {
      setCats(allCats);
      const found = allCats.find((c) => c.slug === slug);
      setCategory(found || null);
    });
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    supabase
      .from("articles")
      .select("*")
      .eq("category_slug", slug)
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
          featured: row.featured || false,
          trending: row.trending || false,
          editorPick: row.editor_pick || false,
          readTime: row.read_time,
        }));
        setArticleList(mapped);
        setLoading(false);
      });
  }, [slug]);

  if (!category && !loading) {
    return (
      <>
        <BreakingNews />
        <Navbar />
        <CategoryNav />
        <main className="newspaper-container py-16 text-center">
          <h1 className="font-serif text-3xl font-bold text-ink">Category not found</h1>
          <Link href="/" className="mt-3 inline-block text-sm vintage-link">&larr; Back to home</Link>
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
      <main className="newspaper-container py-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-6">
          <div>
            <div className="section-head">Section</div>
            <div className="newspaper-rule-thick max-w-[40px] mt-1 mb-2" />
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink tracking-tight">
              {category?.name || "Loading..."}
            </h1>
            <p className="byline mt-0.5">{articleList.length} article{articleList.length !== 1 ? "s" : ""}</p>
          </div>
          <Link href="/" className="byline hover:text-ink transition-colors">&larr; All News</Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block w-5 h-5 border border-ink/20 border-t-ink rounded-full animate-spin" />
              </div>
            ) : articleList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {articleList.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border border-dashed border-border">
                <p className="text-ink-faded font-body">No articles in this category yet.</p>
              </div>
            )}
          </div>
          <aside className="space-y-6">
            <TrendingSidebar articles={articleList} />
            <SidebarWidget title="Sections">
              <div className="space-y-1">
                {cats.filter((c) => c.visible).map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    className={`block px-2.5 py-1.5 text-sm font-body transition-colors ${
                      cat.slug === slug
                        ? "bg-paper-dark text-ink font-semibold border-l-2 border-sepia"
                        : "text-ink-light hover:bg-paper-dark"
                    }`}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </SidebarWidget>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
