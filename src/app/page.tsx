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
        <main className="newspaper-container py-16 text-center">
          <div className="flex items-center justify-center gap-2 text-ink-faded text-sm font-sans">
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
          <p className="text-sm text-red-700 font-sans bg-red-50 border border-red-200 inline-block px-4 py-2">{error}</p>
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
            <p className="text-sm text-ink-faded font-sans">Published articles will appear here once they are created in the admin panel.</p>
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
      <main className="nyt-body" style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
        <div className="nyt-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            padding: '14px 0 6px',
            color: '#000',
            borderBottom: '1px solid #e2e2e2',
            marginBottom: '0',
          }}>
            Top Stories
          </div>

          <div className="nyt-grid">
            <div style={{ padding: '20px 16px 20px 0' }}>
              {secondary.map((article) => {
                const imgUrl = getArticleImage(article);
                return (
                  <Link key={article.id} href={`/article/${article.id}`}
                    style={{ display: 'block', textDecoration: 'none', paddingBottom: '16px', marginBottom: '16px', borderBottom: '1px solid #e2e2e2' }}>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#a67c3e', marginBottom: '4px' }}>
                      {article.category}
                    </div>
                    <h3 style={{
                      fontFamily: 'var(--font-source-serif)',
                      fontSize: '16px',
                      fontWeight: 600,
                      lineHeight: 1.3,
                      color: '#121212',
                      margin: 0,
                    }}>
                      {article.title}
                    </h3>
                    <p style={{
                      fontFamily: 'var(--font-source-serif)',
                      fontSize: '13px',
                      lineHeight: 1.5,
                      color: '#555',
                      marginTop: '6px',
                      marginBottom: 0,
                    }}>
                      {article.summary}
                    </p>
                  </Link>
                );
              })}
            </div>

            <div className="nyt-divider" style={{ width: '1px', backgroundColor: '#e2e2e2' }} />

            <div style={{ padding: '20px 16px' }}>
              <Link key={featured.id} href={`/article/${featured.id}`} style={{ display: 'block', textDecoration: 'none' }}>
                {(() => {
                  const imgUrl = getArticleImage(featured);
                  return imgUrl ? (
                    <div style={{ position: 'relative', width: '100%', height: 'clamp(200px, 50vw, 300px)', overflow: 'hidden' }}>
                      <Image src={imgUrl} alt={featured.title} fill sizes="(max-width: 768px) 100vw, 50vw"
                        style={{ objectFit: 'cover' }} priority={true} />
                    </div>
                  ) : null;
                })()}
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#a67c3e', marginTop: '12px', marginBottom: '4px' }}>
                  {featured.category}
                </div>
                <h2 style={{
                  fontFamily: 'var(--font-source-serif)',
                  fontSize: '28px',
                  fontWeight: 600,
                  lineHeight: 1.2,
                  color: '#121212',
                  margin: '4px 0 8px',
                }}>
                  {featured.title}
                </h2>
                <p style={{
                  fontFamily: 'var(--font-source-serif)',
                  fontSize: '14px',
                  lineHeight: 1.5,
                  color: '#555',
                  margin: '0 0 8px',
                }}>
                  {featured.subheadline || featured.summary}
                </p>
                <p style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '11px',
                  color: '#888',
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.3px',
                }}>
                  By {featured.author}
                </p>
              </Link>
            </div>

            <div className="nyt-divider" style={{ width: '1px', backgroundColor: '#e2e2e2' }} />

            <div style={{ padding: '20px 0 20px 16px' }}>
              {smallArticles.map((article) => {
                const imgUrl = getArticleImage(article);
                return (
                  <Link key={article.id} href={`/article/${article.id}`}
                    style={{ display: 'block', textDecoration: 'none', paddingBottom: '16px', marginBottom: '16px', borderBottom: '1px solid #e2e2e2' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      {imgUrl && (
                        <div style={{ position: 'relative', width: '96px', height: '64px', flexShrink: 0, overflow: 'hidden' }}>
                          <Image src={imgUrl} alt={article.title} fill sizes="96px"
                            style={{ objectFit: 'cover' }} loading="lazy" />
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#a67c3e', marginBottom: '2px' }}>
                          {article.category}
                        </div>
                        <h3 style={{
                          fontFamily: 'var(--font-source-serif)',
                          fontSize: '15px',
                          fontWeight: 600,
                          lineHeight: 1.3,
                          color: '#121212',
                          margin: 0,
                        }}>
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
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '0',
                borderTop: '1px solid #e2e2e2',
              }}>
                <Link key={bottomArticle.id} href={`/article/${bottomArticle.id}`}
                  style={{ display: 'flex', textDecoration: 'none', padding: '20px 0', gap: '20px', alignItems: 'center' }}>
                  {imgUrl && (
                    <img src={imgUrl} alt={bottomArticle.title} loading="lazy" decoding="async"
                      style={{ width: '200px', height: '120px', objectFit: 'cover', display: 'block', flexShrink: 0 }} />
                  )}
                  <div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#a67c3e', marginBottom: '4px' }}>
                      {bottomArticle.category}
                    </div>
                    <h3 style={{
                      fontFamily: 'var(--font-source-serif)',
                      fontSize: '18px',
                      fontWeight: 600,
                      lineHeight: 1.3,
                      color: '#121212',
                      margin: '0 0 6px',
                    }}>
                      {bottomArticle.title}
                    </h3>
                    <p style={{
                      fontFamily: 'var(--font-source-serif)',
                      fontSize: '13px',
                      lineHeight: 1.5,
                      color: '#555',
                      margin: 0,
                    }}>
                      {bottomArticle.summary}
                    </p>
                  </div>
                </Link>
              </div>
            );
          })()}

          <div style={{
            textAlign: 'center',
            padding: '16px 0',
            borderTop: '1px solid #e2e2e2',
            marginBottom: '48px',
          }}>
            <a href="/archive" style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '11px',
              fontWeight: '700',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: '#1a1a1a',
              textDecoration: 'none',
              borderBottom: '1px solid #1a1a1a',
              paddingBottom: '2px',
            }}>View All College News →</a>
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
