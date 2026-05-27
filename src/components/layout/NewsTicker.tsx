"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Article } from "@/lib/data";

export default function NewsTicker({ articles }: { articles: Article[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (articles.length === 0) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % articles.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [articles.length]);

  if (articles.length === 0) return null;

  return (
    <div className="bg-ink border-b-2 border-sepia-dark">
      <div className="newspaper-container flex items-center gap-3 py-2">
        <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-sepia-light shrink-0 bg-sepia-dark/40 px-2.5 py-0.5">
          Latest
        </span>
        <div className="overflow-hidden relative h-5 flex-1">
          <Link
            href={`/article/${articles[index].id}`}
            className="absolute inset-0 flex items-center text-sm text-paper/85 hover:text-paper transition-colors truncate font-body"
          >
            {articles[index].title}
          </Link>
        </div>
      </div>
    </div>
  );
}
