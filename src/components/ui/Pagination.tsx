"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ current, total }: { current: number; total: number; baseUrl: string }) {
  if (total <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button disabled={current <= 1} className="px-2 py-1 border border-border hover:bg-paper-dark disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>
      {Array.from({ length: total }, (_, i) => i + 1).map((page) => (
        <button key={page}
          className={`w-8 h-8 text-xs font-body transition-colors ${
            page === current ? "bg-ink text-paper font-bold" : "text-ink-light hover:bg-paper-dark border border-border"
          }`}>
          {page}
        </button>
      ))}
      <button disabled={current >= total} className="px-2 py-1 border border-border hover:bg-paper-dark disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
