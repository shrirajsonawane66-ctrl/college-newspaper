"use client";

import { motion } from "framer-motion";
import type { Comment } from "@/lib/data";

export default function CommentCard({ comment }: { comment: Comment }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-2.5 py-3 border-b border-border last:border-0"
    >
      <div className="w-8 h-8 border border-border bg-paper-dark flex items-center justify-center text-xs font-bold text-ink-faded shrink-0 font-sans">
        {comment.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-ink font-serif">{comment.authorName}</span>
          <span className="text-[11px] text-ink-faded font-sans">
            {new Date(comment.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
          </span>
        </div>
        <p className="mt-0.5 text-sm text-ink-light leading-relaxed font-body">{comment.content}</p>
      </div>
    </motion.div>
  );
}
