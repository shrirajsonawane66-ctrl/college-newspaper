"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BreakingNews from "@/components/layout/BreakingNews";
import Navbar from "@/components/layout/Navbar";
import Masthead from "@/components/layout/Masthead";
import CategoryNav from "@/components/layout/CategoryNav";
import Footer from "@/components/layout/Footer";
import { articles, categories } from "@/lib/data";
import ArticleCard from "@/components/ui/ArticleCard";
import TrendingSidebar from "@/components/sections/TrendingSidebar";
import SidebarWidget from "@/components/ui/SidebarWidget";

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const category = categories.find((c) => c.slug === slug);
  const categoryArticles = articles.filter((a) => a.categorySlug === slug);

  if (!category) {
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
              {category.name}
            </h1>
            <p className="byline mt-0.5">{categoryArticles.length} article{categoryArticles.length !== 1 ? "s" : ""}</p>
          </div>
          <Link href="/" className="byline hover:text-ink transition-colors">&larr; All News</Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {categoryArticles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {categoryArticles.map((article) => (
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
            <TrendingSidebar articles={articles} />
            <SidebarWidget title="Sections">
              <div className="space-y-1">
                {categories.map((cat) => (
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
                    <span className="float-right text-xs text-ink-faded">{cat.count}</span>
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
