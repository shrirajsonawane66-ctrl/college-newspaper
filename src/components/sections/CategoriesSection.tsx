"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { categories } from "@/lib/data";
import { Newspaper, Megaphone, Calendar, Trophy } from "lucide-react";
import type { Article } from "@/lib/data";

const iconMap: Record<string, React.ReactNode> = {
  "campus-news": <Newspaper className="w-4 h-4" />,
  announcements: <Megaphone className="w-4 h-4" />,
  events: <Calendar className="w-4 h-4" />,
  publicity: <Trophy className="w-4 h-4" />,
};

export default function CategoriesSection({ articles }: { articles: Article[] }) {
  return (
    <section>
      <div className="section-head mb-3">Categories</div>
      <div className="newspaper-rule-thick mb-4" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {categories.map((cat, index) => {
          const count = articles.filter((a) => a.categorySlug === cat.slug).length;
          return (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.3, delay: index * 0.04 }}
            >
              <Link
                href={`/category/${cat.slug}`}
                className="group flex items-center gap-2.5 p-3 border border-border hover:bg-paper-dark transition-colors"
              >
                <span className="text-ink-faded group-hover:text-sepia transition-colors shrink-0">
                  {iconMap[cat.slug] || <Newspaper className="w-4 h-4" />}
                </span>
                <div className="min-w-0">
                  <span className="block text-xs font-serif font-bold text-ink group-hover:text-sepia transition-colors truncate">
                    {cat.name}
                  </span>
                  <span className="text-[10px] text-ink-faded">{count} article{count !== 1 ? "s" : ""}</span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
