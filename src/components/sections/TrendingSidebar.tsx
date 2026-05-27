"use client";

import SidebarWidget from "@/components/ui/SidebarWidget";
import ArticleCard from "@/components/ui/ArticleCard";
import type { Article } from "@/lib/data";

export default function TrendingSidebar({ articles }: { articles: Article[] }) {
  const trending = articles.slice(0, 4);

  if (trending.length === 0) return null;

  return (
    <SidebarWidget title="Trending">
      <div className="space-y-3">
        {trending.map((article) => (
          <ArticleCard key={article.id} article={article} variant="horizontal" />
        ))}
      </div>
    </SidebarWidget>
  );
}
