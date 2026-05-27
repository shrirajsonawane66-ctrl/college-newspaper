"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Article } from "@/lib/data";
import CategoryBadge from "./CategoryBadge";
import { getArticleThumbnail } from "@/lib/thumbnails";

function getThumbnailSrc(article: Article): string {
  return article.thumbnailUrl || article.imageUrl || getArticleThumbnail(article.id);
}

export default function FeaturedHeadline({
  article,
}: {
  article: Article;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/article/${article.id}`} className="group block">
        <div className="bg-paper-dark border-2 border-ink/15 p-4 sm:p-6 md:p-8 relative overflow-hidden transition-all duration-700 hover:border-gold/30 hover:shadow-xl animate-gold-sweep aged-edge">
          <div className="absolute inset-0 opacity-[0.15] bg-cover bg-center pointer-events-none transition-all duration-700 group-hover:scale-105 group-hover:opacity-[0.2]"
            style={{ backgroundImage: `url(${getThumbnailSrc(article)})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-paper-dark/60 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <CategoryBadge category={article.category} slug={article.categorySlug} size="lg" plain />
              <span className="vintage-stamp">Exclusive</span>
            </div>
            <div className="newspaper-rule-ink max-w-[60px] mb-3" />
            <h2 className="font-serif font-black text-ink text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-[1.05] tracking-tight group-hover:text-sepia-dark transition-colors max-w-4xl">
              {article.title}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-ink-light max-w-2xl leading-relaxed font-body line-clamp-2">
              {article.summary}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2 byline paper-texture px-3 py-2 bg-paper/50 border-l-2 border-sepia/50 max-w-max">
              <span className="text-ink">{article.author}</span>
              <span className="text-ink-faded">&middot;</span>
              <span className="dateline">{article.publishedAt}</span>
              <span className="text-ink-faded">&middot;</span>
              <span className="text-sepia font-serif text-xs italic group-hover:not-italic transition-all">
                Continue reading &rarr;
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
