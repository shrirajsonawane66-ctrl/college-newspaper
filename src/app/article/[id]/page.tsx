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
  id: number;
  article_id: number;
  author_name: string;
  content: string;
  created_at: string;
  updated_at: string;
  likes: number;
  is_approved: boolean;
}

export default function ArticlePage() {
  const params = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [commentsList, setCommentsList] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

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
      .select("id, article_id, author_name, content, created_at, updated_at, likes, is_approved")
      .eq("article_id", Number(params.id))
      .eq("is_approved", true)
      .order("created_at", { ascending: false });

    if (!error) {
      const mapped: Comment[] = (data || []).map((row: CommentRow) => ({
        id: row.id,
        article_id: row.article_id,
        author_name: row.author_name,
        content: row.content,
        created_at: row.created_at,
        updated_at: row.updated_at,
        likes: row.likes,
        is_approved: row.is_approved,
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

  const imageUrl = (!imageError && getArticleImage(article)) || getArticleThumbnail(article.id);

  return (
    <>
      <BreakingNews />
      <Navbar />
      <CategoryNav />
      <main className="max-w-4xl mx-auto px-6 py-8" style={{ backgroundColor: '#fdfaf0', minHeight: '100vh' }}>
        <article className="mb-10">
          <div className="mb-6">
            <p className="vintage-category mb-2" style={{ color: '#8b6f4e' }}>
              <Link href={`/category/${article.categorySlug}`} style={{ color: '#8b6f4e', textDecoration: 'none' }}>
                {article.category}
              </Link>
            </p>
            <h1 className="vintage-headline mb-4">
              {article.title}
            </h1>

            {article.subheadline && (
              <p className="vintage-body italic mb-4" style={{ color: '#5a5046' }}>
                {article.subheadline}
              </p>
            )}

            <div className="flex items-center gap-2 vintage-byline flex-wrap">
              <span>By <strong>{article.author}</strong></span>
              {article.authorRole && <><span style={{ opacity: 0.5 }}>|</span><span>{article.authorRole}</span></>}
              <span style={{ opacity: 0.5 }}>|</span>
              <span>
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
                className="vintage-btn ml-auto"
                title="Listen to this article with NOVA"
              >
                Listen with NOVA
              </button>
            </div>
          </div>

          {imageUrl && (
            <div className="mb-8 vintage-img-frame">
              <div style={{ position: 'relative', width: '100%', height: 'clamp(240px, 50vw, 480px)', overflow: 'hidden' }}>
                <Image
                  src={imageUrl}
                  alt={article.imageCaption || article.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 740px"
                  style={{ objectFit: 'cover', filter: 'grayscale(1) contrast(1.5)' }}
                  priority={true}
                  onError={() => setImageError(true)}
                />
              </div>
              {article.imageCaption && (
                <p className="vintage-img-caption">
                  {article.imageCaption}
                  {article.imageCredit && <span> &mdash; Photo: {article.imageCredit}</span>}
                </p>
              )}
            </div>
          )}

          <div
            className={`vintage-article-body vintage-body ${article.dropCap ? 'dropcap' : ''}`}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          <div className="hr-vintage-thick mt-12 mb-8"></div>

          <div>
            <div className="flex items-center gap-2 mb-6">
              <MessageCircle className="w-5 h-5" style={{ color: '#5a5046' }} />
              <span className="vintage-headline-md" style={{ fontSize: '16px' }}>
                {commentsList.length} Comment{commentsList.length !== 1 ? 's' : ''}
              </span>
            </div>
            <CommentForm articleId={article.id} onSuccess={fetchComments} />
            <div>
              {commentsList.map((comment) => (
                <CommentCard key={comment.id} comment={comment} />
              ))}
              {commentsList.length === 0 && (
                <p className="vintage-body-sm text-center py-6" style={{ color: '#8a7e72' }}>
                  No comments yet. Be the first to share your thoughts.
                </p>
              )}
            </div>
          </div>
        </article>

        <div className="hr-vintage mb-8"></div>

        <div className="mb-16">
          <p className="vintage-category mb-4" style={{ color: '#1a1a1a' }}>
            More in {article.category}
          </p>
          <RelatedArticles currentId={article.id} category={article.category} articles={allArticles} />
        </div>
      </main>
      <Footer />
    </>
  );
}
