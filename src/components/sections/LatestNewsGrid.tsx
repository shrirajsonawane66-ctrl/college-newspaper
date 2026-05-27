"use client";

import ArticleCard from "@/components/ui/ArticleCard";
import { motion } from "framer-motion";
import type { Article } from "@/lib/data";

export default function LatestNewsGrid({ articles }: { articles: Article[] }) {
  const latest = articles.slice(1, 5);

  if (latest.length === 0) return null;

  return (
    <section>
      <div className="section-head mb-3">Latest News</div>
      <div className="newspaper-rule-thick mb-4" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {latest.map((article, index) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.35, delay: index * 0.06 }}
          >
            <ArticleCard article={article} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
