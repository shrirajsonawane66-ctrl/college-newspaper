"use client";

import { useMemo } from "react";
import type { Article } from "@/lib/data";

const NEW_ARTICLE_HOURS = 24;

export function isArticleNew(article: Article): boolean {
  if (article.isNew === true) return true;

  if (article.publishedAt) {
    const published = new Date(article.publishedAt);
    const now = new Date();
    const diffHours = (now.getTime() - published.getTime()) / (1000 * 60 * 60);
    return diffHours >= 0 && diffHours <= NEW_ARTICLE_HOURS;
  }

  return false;
}

export function useNewArticles(articles: Article[]) {
  return useMemo(() => {
    const newByCategory = new Map<string, boolean>();
    const anyNew = articles.some((a) => {
      const isNew = isArticleNew(a);
      if (isNew) {
        newByCategory.set(a.categorySlug, true);
      }
      return isNew;
    });
    return { anyNew, newByCategory };
  }, [articles]);
}
