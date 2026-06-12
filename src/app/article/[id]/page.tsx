"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MessageCircle } from "lucide-react";
import BreakingNews from "@/components/layout/BreakingNews";
import Navbar from "@/components/layout/Navbar";
import CategoryNav from "@/components/layout/CategoryNav";
import Footer from "@/components/layout/Footer";
import { getSupabase } from "@/lib/supabase";
import { getArticleThumbnail } from "@/lib/thumbnails";
import CommentForm, { CommentCard } from "@/components/ui/CommentForm";
import RelatedArticles from "@/components/ui/RelatedArticles";
import { getArticleImage, type Article, type Comment } from "@/lib/data";
import { markSectionAsRead } from "@/lib/notifications";

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
  updated_at: string;
  is_published: boolean;
  featured: boolean;
  trending: boolean;
  editor_pick: boolean;
  drop_cap: boolean;
  read_time: string;
  is_new: boolean;
  tags: string;
}

interface CommentRow {
  id: string;
  article_id: string;
  author_name: string;
  content: string;
  created_at: string;
  approved: boolean;
}

export default function ArticlePage() {
  const params = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [commentsList, setCommentsList] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    setLoading(true);

    Promise.all([
      getSupabase().from("articles").select("*").eq("id", params.id).single(),
      getSupabase().from("articles").select("*").eq("is_published", true).order("created_at", { ascending: false }).limit(10),
    ]).then(([articleRes, allRes]) => {
      if (articleRes.data && !articleRes.error) {
        const row = articleRes.data as ArticleRow;
        const imgUrl = row.image_url || row.thumbnail_url || row.cover_image || "";
        setArticle({
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
          updatedAt: row.updated_at || "",
          isPublished: row.is_published,
          featured: row.featured || false,
          trending: row.trending || false,
          editorPick: row.editor_pick || false,
          dropCap: row.drop_cap !== false,
          readTime: row.read_time,
          isNew: row.is_new,
          tags: row.tags || "",
        });
        markSectionAsRead(row.category_slug);
      }
      if (allRes.data && !allRes.error) {
        const mapped: Article[] = (allRes.data as ArticleRow[]).map((row) => {
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
            updatedAt: row.updated_at || "",
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
        setAllArticles(mapped);
      }
      setLoading(false);
    });
  }, [params.id]);

  const fetchComments = useCallback(async () => {
    if (!params.id) return;
    const { data, error } = await getSupabase()
      .from("comments")
      .select("*")
      .eq("article_id", params.id)
      .order("created_at", { ascending: false });

    if (!error) {
      const mapped: Comment[] = (data || []).map((row: CommentRow) => ({
        id: row.id,
        articleId: row.article_id,
        authorName: row.author_name,
        content: row.content,
        createdAt: row.created_at,
        approved: row.approved,
        avatar: row.author_name?.charAt(0).toUpperCase() || "?",
      }));
      setCommentsList(mapped);
    }
  }, [params.id]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    if (!article) return;
    const jsonld = {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": article.title,
      "description": article.summary || article.subheadline,
      "image": imageUrl || undefined,
      "datePublished": article.publishedAt,
      "dateModified": article.updatedAt || article.publishedAt,
      "author": [{
        "@type": "Person",
        "name": article.author,
      }],
      "publisher": {
        "@type": "Organization",
        "name": "Campus TIMELINE",
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": window.location.href,
      },
    };
    const scriptId = "article-jsonld";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(jsonld);

    document.title = `${article.title} — Campus TIMELINE`;
    const ogDesc = article.summary || article.subheadline || "";
    const updateMeta = (prop: string, name: string, content: string) => {
      let el = document.querySelector(`meta[${prop}="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(prop, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    updateMeta("property", "og:title", `${article.title} — Campus TIMELINE`);
    updateMeta("property", "og:description", ogDesc);
    updateMeta("property", "og:type", "article");
    updateMeta("property", "og:url", window.location.href);
    updateMeta("name", "description", ogDesc);
    updateMeta("name", "twitter:card", "summary_large_image");
    updateMeta("name", "twitter:title", `${article.title} — Campus TIMELINE`);
    updateMeta("name", "twitter:description", ogDesc);
    if (imageUrl) {
      updateMeta("property", "og:image", imageUrl);
      updateMeta("name", "twitter:image", imageUrl);
    }
  }, [article]);

  if (loading) {
    return (
      <>
        <BreakingNews />
        <Navbar />
        <CategoryNav />
        <main className="newspaper-container py-16 text-center">
          <div className="inline-block w-5 h-5 border border-ink/20 border-t-ink rounded-full animate-spin" />
        </main>
        <Footer />
      </>
    );
  }

  if (!article) {
    return (
      <>
        <BreakingNews />
        <Navbar />
        <CategoryNav />
        <main className="newspaper-container py-16 text-center">
          <h1 className="font-serif text-3xl font-bold text-ink">Article not found</h1>
          <Link href="/" className="mt-3 inline-block text-sm vintage-link">
            &larr; Back to home
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  const imageUrl = getArticleImage(article) || getArticleThumbnail(article.id);

  return (
    <>
      <BreakingNews />
      <Navbar />
      <CategoryNav />
      <main style={{ backgroundColor: '#ffffff', minHeight: '100vh', padding: '40px 0' }}>
        <article style={{ maxWidth: '740px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            color: '#a67c3e',
            marginBottom: '16px',
          }}>
            <Link href={`/category/${article.categorySlug}`} style={{ color: '#a67c3e', textDecoration: 'none' }}>
              {article.category}
            </Link>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-source-serif)',
            fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: 600,
            lineHeight: 1.15,
            color: '#121212',
            margin: '0 0 12px',
          }}>
            {article.title}
          </h1>

          {article.subheadline && (
            <p style={{
              fontFamily: 'var(--font-source-serif)',
              fontSize: '18px',
              lineHeight: 1.4,
              color: '#555',
              fontStyle: 'italic',
              margin: '0 0 16px',
            }}>
              {article.subheadline}
            </p>
          )}

          <div style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '12px',
            color: '#666',
            paddingBottom: '16px',
            marginBottom: '24px',
            borderBottom: '1px solid #e2e2e2',
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
          }}>
            By <strong>{article.author}</strong>
            {article.authorRole && <span style={{ color: '#999' }}> | {article.authorRole}</span>}
            <span style={{ color: '#999' }}> | </span>
            <span style={{ color: '#999' }}>
              {new Date(article.publishedAt).toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              })}
            </span>
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('nova-read-article', {
                  detail: {
                    id: article.id,
                    title: article.title,
                    summary: article.summary,
                    content: article.content,
                    category: article.category,
                    author: article.author,
                  }
                }))
              }}
              style={{
                marginLeft: 'auto',
                fontFamily: 'var(--font-sans)',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                color: '#a67c3e',
                background: 'none',
                border: '1px solid #a67c3e',
                borderRadius: '4px',
                padding: '6px 14px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#a67c3e'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#a67c3e' }}
              title="Listen to this article with NOVA"
            >
              Listen with NOVA
            </button>
          </div>

          {imageUrl && (
            <figure style={{ margin: '0 0 32px 0', position: 'relative' }}>
              <div style={{ position: 'relative', width: '100%', height: 'clamp(240px, 50vw, 480px)', overflow: 'hidden' }}>
                <Image
                  src={imageUrl}
                  alt={article.imageCaption || article.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 740px"
                  style={{ objectFit: 'cover' }}
                  priority={true}
                />
              </div>
              {article.imageCaption && (
                <figcaption style={{
                  fontFamily: 'var(--font-source-serif)',
                  fontSize: '13px',
                  color: '#777',
                  fontStyle: 'italic',
                  marginTop: '8px',
                  paddingLeft: '4px',
                }}>
                  {article.imageCaption}
                  {article.imageCredit && <span> &mdash; Photo: {article.imageCredit}</span>}
                </figcaption>
              )}
            </figure>
          )}

          <div className="article-body-text"
            style={{
              fontFamily: 'var(--font-source-serif)',
              fontSize: '17px',
              lineHeight: 1.75,
              color: '#333',
            }}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          <div style={{
            borderTop: '1px solid #e2e2e2',
            marginTop: '40px',
            paddingTop: '32px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '24px',
            }}>
              <MessageCircle className="w-5 h-5" style={{ color: '#555' }} />
              <span style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '16px',
                fontWeight: 700,
                color: '#121212',
              }}>
                {commentsList.length} Comment{commentsList.length !== 1 ? 's' : ''}
              </span>
            </div>
            <CommentForm articleId={article.id} onSuccess={fetchComments} />
            <div>
              {commentsList.map((comment) => (
                <CommentCard key={comment.id} comment={comment} />
              ))}
              {commentsList.length === 0 && (
                <p style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '14px',
                  color: '#888',
                  padding: '24px 0',
                  textAlign: 'center',
                }}>
                  No comments yet. Be the first to share your thoughts.
                </p>
              )}
            </div>
          </div>
        </article>

        <div style={{
          maxWidth: '1200px',
          margin: '40px auto 0',
          padding: '0 16px',
          borderTop: '1px solid #e2e2e2',
          paddingTop: '32px',
        }}>
          <div style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            color: '#000',
            marginBottom: '16px',
          }}>
            More in {article.category}
          </div>
          <RelatedArticles currentId={article.id} category={article.category} articles={allArticles} />
        </div>
      </main>
      <Footer />
    </>
  );
}
