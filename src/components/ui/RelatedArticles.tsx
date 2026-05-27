import ArticleCard from "./ArticleCard";
import type { Article } from "@/lib/data";

export default function RelatedArticles({ currentId, category, articles }: { currentId: string; category: string; articles: Article[] }) {
  const related = articles.filter((a) => a.id !== currentId && a.category === category).slice(0, 3);
  if (related.length === 0) return null;

  return (
    <div>
      <div className="section-head mb-3">Related Articles</div>
      <div className="newspaper-rule-thick mb-4" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {related.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}
