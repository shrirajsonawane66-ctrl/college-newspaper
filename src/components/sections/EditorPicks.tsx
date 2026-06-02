"use client";

import ArticleCard from "@/components/ui/ArticleCard";
import { motion } from "framer-motion";
import type { Article } from "@/lib/data";

export default function EditorPicks({ articles }: { articles: Article[] }) {
  const picks = articles.filter((a) => a.editorPick).slice(0, 4);

  if (picks.length === 0) return null;

  return (
    <section>
      <div className="section-head mb-3">Editor&apos;s Picks</div>
      <div className="newspaper-rule-thick mb-4" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {picks.map((article, index) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.35, delay: index * 0.08 }}
          >
            <ArticleCard article={article} variant="horizontal" />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
