"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import BreakingNews from "@/components/layout/BreakingNews";
import Navbar from "@/components/layout/Navbar";
import CategoryNav from "@/components/layout/CategoryNav";
import Footer from "@/components/layout/Footer";
import NewspaperFoldSection from "@/components/ui/NewspaperFoldSection";
import { articles } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import { getArticleThumbnail } from "@/lib/thumbnails";
import CategoryBadge from "@/components/ui/CategoryBadge";
import CommentCard from "@/components/ui/CommentCard";
import CommentForm from "@/components/ui/CommentForm";
import RelatedArticles from "@/components/ui/RelatedArticles";
import SidebarWidget from "@/components/ui/SidebarWidget";
import TrendingSidebar from "@/components/sections/TrendingSidebar";
import type { Comment } from "@/lib/data";

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
  const article = articles.find((a) => a.id === params.id);
  const [commentsList, setCommentsList] = useState<Comment[]>([]);

  const fetchComments = useCallback(async () => {
    if (!params.id) return;
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("article_id", params.id)
      .order("created_at", { ascending: false });

    if (!error) {
      console.log("Fetched comments:", data);
      const mapped: Comment[] = (data || []).map((row: CommentRow) => ({
        id: row.id,
        articleId: row.article_id,
        username: row.author_name,
        content: row.content,
        createdAt: row.created_at,
        approved: true,
        avatar: row.author_name?.charAt(0).toUpperCase() || "?",
      }));
      setCommentsList(mapped);
    } else {
      console.error("Fetch comments error:", error);
    }
  }, [params.id]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

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

  return (
    <>
      <BreakingNews />
      <Navbar />
      <CategoryNav />
      <main className="newspaper-page">
        <div className="newspaper-container py-8">
          <div className="broadsheet-grid">
            <article className="lead-col">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link href="/" className="byline hover:text-ink transition-colors">
                  &larr; Back to Home
                </Link>

                <div className="mt-3 flex items-center gap-2">
                  <CategoryBadge category={article.category} slug={article.categorySlug} size="lg" />
                  <span className="vintage-stamp">Est. 1965</span>
                </div>

                <h1 className="mt-4 font-serif font-black text-ink text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.0] tracking-[-0.01em]">
                  {article.title}
                </h1>

                <div className="mt-3 byline-serif">
                  By <span className="font-semibold not-italic">{article.author}</span> &mdash; {article.authorRole}
                  <span className="mx-2">&middot;</span>
                  <span className="dateline">{article.publishedAt}</span>
                  <span className="mx-2">&middot;</span>
                  <span className="dateline">{article.readTime}</span>
                </div>

                <div className="mt-6 paper-curl">
                  <div className="aspect-[16/9] bg-paper-dark border-2 border-border relative overflow-hidden aged-edge">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-all duration-700 hover:scale-105"
                      style={{ backgroundImage: `url(${getArticleThumbnail(article.id)})` }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-paper/85 backdrop-blur-sm py-2 px-4 text-[10px] text-ink-faded uppercase tracking-[0.15em] font-body text-right border-t border-border">
                      WCCBM TIMELINE &mdash; Illustration
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-t-2 border-ink/10 pt-6">
                  <div
                    dangerouslySetInnerHTML={{ __html: article.content }}
                    className="dropcap-editorial article-body multi-col text-ink font-medium font-body"
                  />
                </div>

                <div className="newspaper-rule-ink my-10" />

                <div className="space-y-5">
                  <h2 className="font-serif text-xl font-bold text-ink flex items-center gap-2">
                    <span className="w-6 h-px bg-sepia/50" />
                    Comments ({commentsList.length})
                  </h2>
                  <CommentForm articleId={article.id} onSuccess={fetchComments} />
                  <div className="divide-y divide-border">
                    {commentsList.map((comment) => (
                      <CommentCard key={comment.id} comment={comment} />
                    ))}
                    {commentsList.length === 0 && (
                      <p className="text-sm text-ink-faded py-3 font-body">
                        No comments yet. Be the first to share your thoughts.
                      </p>
                    )}
                    {process.env.NODE_ENV === "development" && (
                      <details className="mt-2">
                        <summary className="text-[10px] text-ink-faded cursor-pointer font-mono">Debug: comments state</summary>
                        <pre className="text-[10px] text-ink-faded font-mono mt-1 bg-paper-dark p-2 overflow-x-auto">
                          {JSON.stringify(commentsList, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </motion.div>
            </article>

            <aside className="space-y-6 border-l border-border pl-6">
              <TrendingSidebar articles={articles} />
              <SidebarWidget title="Details">
                <div className="space-y-2 text-sm font-body">
                  <div className="flex justify-between py-1.5 border-b border-border">
                    <span className="text-ink-faded">Author</span>
                    <span className="font-semibold text-ink">{article.author}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border">
                    <span className="text-ink-faded">Category</span>
                    <span className="font-semibold text-ink">{article.category}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border">
                    <span className="text-ink-faded">Published</span>
                    <span className="font-semibold text-ink">{article.publishedAt}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-ink-faded">Read time</span>
                    <span className="font-semibold text-ink">{article.readTime}</span>
                  </div>
                </div>
              </SidebarWidget>
            </aside>
          </div>

          <div className="mt-12 border-t border-border pt-8">
            <NewspaperFoldSection foldIntensity={0.6}>
              <RelatedArticles currentId={article.id} category={article.category} articles={articles} />
            </NewspaperFoldSection>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
