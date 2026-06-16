"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import BreakingNews from "@/components/layout/BreakingNews";
import Navbar from "@/components/layout/Navbar";
import Masthead from "@/components/layout/Masthead";
import CategoryNav from "@/components/layout/CategoryNav";
import NewsTicker from "@/components/layout/NewsTicker";
import Footer from "@/components/layout/Footer";
import { getSupabase } from "@/lib/supabase";
import { getArticleImage, type Article } from "@/lib/data";
import { TechNewsSection } from "@/components/sections/TechNewsSection";

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
  featured: boolean;
  trending: boolean;
  editor_pick: boolean;
  drop_cap: boolean;
  read_time: string;
  is_new: boolean;
  tags: string;
}

export default function Home() {
  const [articlesList, setArticlesList] = useState<Article[]>([]);
  const [techNewsData, setTechNewsData] = useState<{ news: any[]; totalPages: number }>({ news: [], totalPages: 4 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTechNewsInitial = useCallback(async () => {
    try {
      const res = await fetch("/api/tech-news?page=1");
      return await res.json();
    } catch {
      return { news: [], totalPages: 4 };
    }
  }, []);

  useEffect(() => {
    async function fetchData() {
      const [articlesResult, techNewsResult] = await Promise.all([
        getSupabase()
          .from("articles")
          .select("*")
          .eq("is_published", true)
          .order("created_at", { ascending: false })
          .limit(6),
        fetchTechNewsInitial(),
      ]);

      if (articlesResult.error) {
        setError("Failed to load articles.");
        setLoading(false);
        return;
      }

      const mapped: Article[] = (articlesResult.data || []).map((row: ArticleRow) => {
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
          featured: row.featured || false,
          trending: row.trending || false,
          editorPick: row.editor_pick || false,
          dropCap: row.drop_cap !== false,
          readTime: row.read_time,
          isNew: row.is_new,
          tags: row.tags || "",
        };
      });

      setArticlesList(mapped);
      setTechNewsData(techNewsResult);
      setLoading(false);
    }

    fetchData();
  }, [fetchTechNewsInitial]);

  if (loading) {
    return (
      <>
        <BreakingNews />
        <Navbar />
        <Masthead />
        <CategoryNav />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="flex items-center justify-center gap-2" style={{ fontFamily: "var(--font-archivo)", fontSize: "12px", color: "#5a5046" }}>
            <span className="inline-block w-4 h-4 border border-[#5a5046]/20 border-t-[#5a5046] rounded-full animate-spin" />
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
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <p className="vintage-body-sm" style={{ color: "#8b6f4e" }}>{error}</p>
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
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="border-2 border-dashed border-[#c8bfa8] max-w-md mx-auto p-8" style={{ fontFamily: "var(--font-source-serif)" }}>
            <h2 className="vintage-headline-md mb-2">No Articles Yet</h2>
            <p className="vintage-body-sm" style={{ color: "#5a5046" }}>Published articles will appear here once they are created in the admin panel.</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const articles = articlesList;
  const featured = articles[0];
  const secondary = articles.slice(1, 3);
  const smallArticles = articles.slice(3, 5);
  const bottomArticle = articles[5];

  return (
    <>
      <BreakingNews />
      <Navbar />
      <Masthead />
      <CategoryNav />
      <NewsTicker articles={articles} />
      <main className="home-surface" style={{ minHeight: "100vh" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 16px" }}>
          <div className="home-subhead-caps home-text-primary py-3" style={{ borderBottom: "1px solid #000", marginBottom: 0, letterSpacing: "0.15em" }}>
            Top Stories
          </div>

          <div className="nyt-grid" style={{ marginTop: 0 }}>
            {/* Left column */}
            <div style={{ padding: "20px 16px 20px 0" }}>
              {secondary.map((article) => {
                const imgUrl = getArticleImage(article);
                return (
                  <Link key={article.id} href={`/article/${article.id}`}
                    className="block no-underline" style={{ paddingBottom: "16px", marginBottom: "16px", borderBottom: "1px solid #000" }}>
                    <div className="home-subhead-caps home-text-secondary mb-1" style={{ fontSize: "10px", letterSpacing: "0.1em" }}>
                      {article.category}
                    </div>
                    <h3 className="vintage-headline-md" style={{ fontSize: "16px", margin: 0 }}>
                      {article.title}
                    </h3>
                    <p className="vintage-body-sm home-justified" style={{ color: "#5a5046", marginTop: "6px", marginBottom: 0 }}>
                      {article.summary}
                    </p>
                  </Link>
                );
              })}
            </div>

            <div className="nyt-divider" style={{ width: "1px", backgroundColor: "#000" }} />

            {/* Center column */}
            <div style={{ padding: "20px 16px" }}>
              <Link key={featured.id} href={`/article/${featured.id}`} className="block no-underline">
                {(() => {
                  const imgUrl = getArticleImage(featured);
                  return imgUrl ? (
                    <div className="home-halftone" style={{ border: "1px solid #000", padding: "3px", backgroundColor: "#fff" }}>
                      <div style={{ position: "relative", width: "100%", height: "clamp(200px, 50vw, 300px)", overflow: "hidden" }}>
                        <Image src={imgUrl} alt={featured.title} fill sizes="(max-width: 768px) 100vw, 50vw"
                          style={{ objectFit: "cover" }} priority />
                      </div>
                    </div>
                  ) : null;
                })()}
                <div className="home-subhead-caps home-text-secondary mt-3 mb-1" style={{ fontSize: "10px", letterSpacing: "0.1em" }}>
                  {featured.category}
                </div>
                <h2 className="vintage-headline home-text-primary" style={{ fontSize: "clamp(24px, 3vw, 36px)", margin: "4px 0 8px" }}>
                  {featured.title}
                </h2>
                <p className="vintage-body-sm" style={{ color: "#5a5046", margin: "0 0 8px" }}>
                  {featured.subheadline || featured.summary}
                </p>
                <p className="home-subhead-caps" style={{ fontSize: "11px", color: "#444748", letterSpacing: "0.05em", margin: 0 }}>
                  By {featured.author}
                </p>
              </Link>
            </div>

            <div className="nyt-divider" style={{ width: "1px", backgroundColor: "#000" }} />

            {/* Right column */}
            <div style={{ padding: "20px 0 20px 16px" }}>
              {smallArticles.map((article) => {
                const imgUrl = getArticleImage(article);
                return (
                  <Link key={article.id} href={`/article/${article.id}`}
                    className="block no-underline" style={{ paddingBottom: "16px", marginBottom: "16px", borderBottom: "1px solid #000" }}>
                    <div style={{ display: "flex", gap: "12px" }}>
                      {imgUrl && (
                        <div className="home-halftone" style={{ width: "96px", height: "64px", flexShrink: 0, border: "1px solid #000", padding: "2px", backgroundColor: "#fff", position: "relative", overflow: "hidden" }}>
                          <Image src={imgUrl} alt={article.title} fill sizes="96px" style={{ objectFit: "cover" }} loading="lazy" />
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="home-subhead-caps home-text-secondary mb-1" style={{ fontSize: "10px", letterSpacing: "0.1em" }}>
                          {article.category}
                        </div>
                        <h3 className="vintage-headline-md" style={{ fontSize: "15px", margin: 0 }}>
                          {article.title}
                        </h3>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {bottomArticle && (() => {
            const imgUrl = getArticleImage(bottomArticle);
            return (
              <div style={{ borderTop: "1px solid #000" }}>
                <Link key={bottomArticle.id} href={`/article/${bottomArticle.id}`}
                  className="block no-underline" style={{ padding: "20px 0", display: "flex", gap: "20px", alignItems: "center" }}>
                  {imgUrl && (
                    <div className="home-halftone" style={{ width: "200px", height: "120px", flexShrink: 0, border: "1px solid #000", padding: "3px", backgroundColor: "#fff", position: "relative", overflow: "hidden" }}>
                      <Image src={imgUrl} alt={bottomArticle.title} fill sizes="200px" style={{ objectFit: "cover" }} loading="lazy" />
                    </div>
                  )}
                  <div>
                    <div className="home-subhead-caps home-text-secondary mb-1" style={{ fontSize: "10px", letterSpacing: "0.1em" }}>
                      {bottomArticle.category}
                    </div>
                    <h3 className="vintage-headline-md" style={{ fontSize: "18px", margin: "0 0 6px" }}>
                      {bottomArticle.title}
                    </h3>
                    <p className="vintage-body-sm" style={{ color: "#5a5046", margin: 0 }}>
                      {bottomArticle.summary}
                    </p>
                  </div>
                </Link>
              </div>
            );
          })()}

          <div className="text-center py-4" style={{ borderTop: "1px solid #000", marginBottom: "48px" }}>
            <Link href="/archive" className="home-subhead-caps home-text-primary no-underline" style={{ borderBottom: "1px solid #000", paddingBottom: "2px" }}>
              View All College News →
            </Link>
          </div>
        </div>
      </main>
      <TechNewsSection
        initialNews={techNewsData.news ?? []}
        initialPage={1}
        initialTotalPages={techNewsData.totalPages ?? 4}
      />
      <Footer />
    </>
  );
}
