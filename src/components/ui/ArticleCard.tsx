"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { getArticleImage, type Article } from "@/lib/data";
import CategoryBadge from "./CategoryBadge";
import { getArticleThumbnail } from "@/lib/thumbnails";
import NewLabel from "./NewLabel";
import { isArticleNew } from "@/hooks/useNewArticles";

function getThumbnailSrc(article: Article): string {
  return getArticleImage(article) || getArticleThumbnail(article.id);
}

export default function ArticleCard({
  article,
  variant = "default",
}: {
  article: Article;
  variant?: "default" | "horizontal" | "compact";
}) {
  if (variant === "horizontal") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.35 }}
      >
        <Link href={`/article/${article.id}`} className="group flex gap-3 items-start pb-3 border-b border-border last:border-b-0">
          <div
            className="w-20 h-20 shrink-0 border border-border overflow-hidden bg-cover bg-center transition-all duration-500 group-hover:border-gold-light group-hover:shadow-md"
            style={{ backgroundImage: `url(${getThumbnailSrc(article)})` }}
          />
          <div className="flex-1 min-w-0">
            <CategoryBadge category={article.category} slug={article.categorySlug} plain />
            <h3 className="mt-0.5 font-serif font-semibold text-ink text-sm group-hover:text-sepia transition-colors duration-300 leading-snug line-clamp-2">
              {article.title}
            </h3>
            {isArticleNew(article) && <NewLabel />}
            <div className="mt-1 font-sans text-[10px] uppercase tracking-[0.15em] text-ink-lighter font-medium">{article.author} &middot; {article.publishedAt}</div>
          </div>
        </Link>
      </motion.div>
    );
  }

  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.3 }}
      >
        <Link href={`/article/${article.id}`} className="group flex items-start gap-2.5 pb-2 border-b border-border last:border-b-0">
          <div
            className="w-10 h-10 shrink-0 border border-border bg-cover bg-center transition-all duration-500 group-hover:border-gold-light"
            style={{ backgroundImage: `url(${getThumbnailSrc(article)})` }}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="font-serif text-sm font-semibold text-ink group-hover:text-sepia transition-colors duration-300 leading-snug line-clamp-2">
                {article.title}
              </h4>
              {isArticleNew(article) && <NewLabel />}
            </div>
            <span className="text-[10px] text-ink-faded uppercase tracking-[0.12em] font-sans font-medium">{article.category} &middot; {article.publishedAt}</span>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.35 }}
      className="pb-4 border-b border-border"
    >
      <Link href={`/article/${article.id}`} className="group block">
        <div
          className="aspect-[16/9] border border-border mb-3 bg-cover bg-center transition-all duration-500 group-hover:border-gold-light group-hover:shadow-md"
          style={{ backgroundImage: `url(${getThumbnailSrc(article)})` }}
        />
        <div className="flex items-center gap-2 flex-wrap">
          <CategoryBadge category={article.category} slug={article.categorySlug} plain />
          {isArticleNew(article) && <NewLabel />}
        </div>
        <h3 className="mt-1.5 font-serif font-bold text-xl text-ink group-hover:text-sepia transition-colors duration-300 leading-snug">
          {article.title}
        </h3>
        <p className="mt-1.5 text-sm text-ink-light leading-relaxed line-clamp-2 font-body group-hover:text-ink transition-colors duration-300">
          {article.summary}
        </p>
        <div className="mt-2 font-sans text-[11px] uppercase tracking-[0.15em] text-ink-lighter font-medium">
          {article.author} &middot; {article.readTime}
        </div>
      </Link>
    </motion.article>
  );
}
