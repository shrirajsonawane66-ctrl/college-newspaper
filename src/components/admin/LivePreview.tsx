"use client";

import { motion } from "framer-motion";
import { getArticleThumbnail } from "@/lib/thumbnails";

interface PreviewData {
  title: string;
  summary: string;
  content: string;
  category: string;
  categorySlug: string;
  author: string;
  authorRole: string;
  imageUrl: string;
  publishedAt: string;
  readTime: string;
}

export default function LivePreview({
  data,
  articleId,
}: {
  data: PreviewData;
  articleId: string;
}) {
  const imageUrl = data.imageUrl || getArticleThumbnail(articleId);
  const wordCount = data.content ? data.content.split(/\s+/).filter(Boolean).length : 0;
  const charCount = data.content ? data.content.length : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-sm font-bold text-ink">Live Preview</h3>
        <span className="text-[9px] uppercase tracking-[0.2em] text-emerald-600 font-body font-semibold flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse-glow" />
          Live
        </span>
      </div>

      {/* Mini newspaper preview */}
      <motion.div
        layout
        className="border border-border bg-paper overflow-hidden shadow-sm"
      >
        {/* Thumbnail */}
        <div className="aspect-[16/9] bg-paper-dark border-b border-border relative overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 mx-auto border border-border/50 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-ink-faded/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                  </svg>
                </div>
                <p className="text-[9px] text-ink-faded/50 mt-1 font-body">No thumbnail</p>
              </div>
            </div>
          )}
          {/* Category badge on image */}
          {data.category && (
            <div className="absolute top-2 left-2 bg-ink/80 text-paper text-[8px] uppercase tracking-[0.15em] px-2 py-0.5 font-body font-semibold">
              {data.category}
            </div>
          )}
        </div>

        {/* Content preview */}
        <div className="p-3 space-y-2">
          <motion.h3
            layout
            className="font-serif font-bold text-ink text-sm leading-snug line-clamp-2"
          >
            {data.title || (
              <span className="text-ink-faded/40 italic font-normal text-xs">Article title&hellip;</span>
            )}
          </motion.h3>

          <motion.p
            layout
            className="text-[11px] text-ink-light font-body leading-relaxed line-clamp-2"
          >
            {data.summary || (
              <span className="text-ink-faded/30 italic">Article summary will appear here&hellip;</span>
            )}
          </motion.p>

          {/* Content preview */}
          {data.content && (
            <div
              className="text-[10px] text-ink-lighter font-body leading-relaxed line-clamp-3 border-t border-border pt-2 mt-1"
              dangerouslySetInnerHTML={{ __html: data.content.slice(0, 300) }}
            />
          )}

          <div className="flex items-center gap-2 text-[9px] text-ink-faded font-body border-t border-border pt-2">
            {data.author ? (
              <>
                <span className="font-medium text-ink-light">{data.author}</span>
                <span className="text-border">|</span>
              </>
            ) : null}
            <span>{data.readTime || "— min read"}</span>
            <span className="text-border">|</span>
            <span>{wordCount} words</span>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="border border-border bg-paper-dark/30 p-2.5 text-center">
          <p className="text-lg font-bold font-serif text-ink tabular-nums">{wordCount}</p>
          <p className="text-[9px] uppercase tracking-[0.15em] text-ink-faded font-body font-semibold">Words</p>
        </div>
        <div className="border border-border bg-paper-dark/30 p-2.5 text-center">
          <p className="text-lg font-bold font-serif text-ink tabular-nums">{charCount}</p>
          <p className="text-[9px] uppercase tracking-[0.15em] text-ink-faded font-body font-semibold">Characters</p>
        </div>
        <div className="border border-border bg-paper-dark/30 p-2.5 text-center">
          <p className="text-lg font-bold font-serif text-ink tabular-nums">{data.readTime || "—"}</p>
          <p className="text-[9px] uppercase tracking-[0.15em] text-ink-faded font-body font-semibold">Read Time</p>
        </div>
        <div className="border border-border bg-paper-dark/30 p-2.5 text-center">
          <p className="text-lg font-bold font-serif text-ink tabular-nums tabular-nums">
            {data.publishedAt || "—"}
          </p>
          <p className="text-[9px] uppercase tracking-[0.15em] text-ink-faded font-body font-semibold">Published</p>
        </div>
      </div>
    </div>
  );
}
