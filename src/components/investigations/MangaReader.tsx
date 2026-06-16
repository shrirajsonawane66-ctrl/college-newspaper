"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { InvestigationPage } from "@/lib/investigations";

interface MangaReaderProps {
  pages: InvestigationPage[];
  title: string;
}

export default function MangaReader({ pages, title }: MangaReaderProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const total = pages.length;

  const goTo = useCallback(
    (idx: number) => {
      setCurrentIdx(Math.max(0, Math.min(idx, total - 1)));
    },
    [total]
  );

  const goNext = useCallback(() => {
    if (currentIdx < total - 1) goTo(currentIdx + 1);
  }, [currentIdx, total, goTo]);

  const goPrev = useCallback(() => {
    if (currentIdx > 0) goTo(currentIdx - 1);
  }, [currentIdx, goTo]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
  };

  const preloadNeighbors = useCallback(
    (idx: number) => {
      const toLoad = [idx, idx - 1, idx + 1, idx - 2, idx + 2].filter(
        (i) => i >= 0 && i < total
      );
      toLoad.forEach((i) => {
        if (!loaded.has(i)) {
          const img = new Image();
          img.onload = () => setLoaded((prev) => new Set(prev).add(i));
          img.onerror = () => setLoaded((prev) => new Set(prev).add(i));
          img.src = pages[i].image_url;
        }
      });
    },
    [pages, total, loaded]
  );

  useEffect(() => {
    setLoading(true);
    setLoaded(new Set());
    preloadNeighbors(0);
  }, [pages]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setLoading(true);
    preloadNeighbors(currentIdx);
  }, [currentIdx, preloadNeighbors]);

  const handleImgLoad = () => {
    setLoading(false);
  };

  if (total === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-zinc-500 font-sans text-sm">No pages available</p>
      </div>
    );
  }

  const page = pages[currentIdx];

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <button
          onClick={goPrev}
          disabled={currentIdx === 0}
          className="absolute left-0 top-0 bottom-0 w-1/4 z-10 flex items-center justify-start pl-4 opacity-0 hover:opacity-100 transition-opacity disabled:opacity-0 group"
          aria-label="Previous page"
        >
          <div className="p-2 rounded-full bg-white/10 backdrop-blur-sm group-hover:bg-white/20 transition-colors">
            <ChevronLeft className="w-6 h-6 text-white/80" />
          </div>
        </button>

        <div className="w-full h-full flex items-center justify-center p-4">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
            </div>
          )}
          <img
            src={page.image_url}
            alt={`${title} — Page ${page.page_number}`}
            className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
              loading ? "opacity-0" : "opacity-100"
            }`}
            onLoad={handleImgLoad}
            draggable={false}
          />
        </div>

        <button
          onClick={goNext}
          disabled={currentIdx === total - 1}
          className="absolute right-0 top-0 bottom-0 w-1/4 z-10 flex items-center justify-end pr-4 opacity-0 hover:opacity-100 transition-opacity disabled:opacity-0 group"
          aria-label="Next page"
        >
          <div className="p-2 rounded-full bg-white/10 backdrop-blur-sm group-hover:bg-white/20 transition-colors">
            <ChevronRight className="w-6 h-6 text-white/80" />
          </div>
        </button>
      </div>

      {page.caption && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 max-w-lg px-4 py-2 bg-black/60 backdrop-blur-sm rounded">
          <p className="text-white/90 text-sm text-center font-sans">
            {page.caption}
          </p>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-xs font-sans">
              {title}
            </span>
            <span className="text-white/80 text-xs font-sans tabular-nums">
              {currentIdx + 1} / {total}
            </span>
          </div>
          <div className="flex gap-0.5">
            {pages.map((p, i) => (
              <button
                key={p.id}
                onClick={() => goTo(i)}
                className={`h-1 flex-1 rounded-full transition-all duration-200 ${
                  i === currentIdx
                    ? "bg-white scale-y-150"
                    : i < currentIdx
                    ? "bg-white/40"
                    : "bg-white/15 hover:bg-white/30"
                }`}
                aria-label={`Go to page ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
