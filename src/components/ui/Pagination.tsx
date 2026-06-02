"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

function getPageWindow(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [];
  if (current <= 3) {
    pages.push(1, 2, 3, 4, "...", total);
  } else if (current >= total - 2) {
    pages.push(1, "...", total - 3, total - 2, total - 1, total);
  } else {
    pages.push(1, "...", current - 1, current, current + 1, "...", total);
  }
  return pages;
}

export default function Pagination({ current, total, onPageChange }: { current: number; total: number; onPageChange: (page: number) => void }) {
  if (total <= 1) return null;

  const pages = getPageWindow(current, total);

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button
        disabled={current <= 1}
        onClick={() => onPageChange(current - 1)}
        className="px-2 py-1 border border-border hover:bg-paper-dark disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>
      {pages.map((page, i) =>
        page === "..." ? (
          <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-ink-faded">...</span>
        ) : (
          <button key={page}
            onClick={() => onPageChange(page)}
            className={`w-8 h-8 text-xs font-body transition-colors ${
              page === current ? "bg-ink text-paper font-bold" : "text-ink-light hover:bg-paper-dark border border-border"
            }`}>
            {page}
          </button>
        )
      )}
      <button
        disabled={current >= total}
        onClick={() => onPageChange(current + 1)}
        className="px-2 py-1 border border-border hover:bg-paper-dark disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
