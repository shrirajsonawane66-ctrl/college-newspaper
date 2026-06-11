"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import type { Comment } from "@/lib/data";

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default function CommentForm({ articleId, onSuccess }: { articleId: string; onSuccess?: () => void }) {
  const [username, setUsername] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !content.trim()) return;
    try {
      setLoading(true);
      const { error } = await getSupabase()
        .from("comments")
        .insert([
          {
            article_id: articleId,
            author_name: username.trim(),
            content: content.trim(),
            approved: true,
          },
        ]);
      if (error) return;
      setUsername("");
      setContent("");
      setFocused(false);
      onSuccess?.();
    } catch {
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sepia to-gold flex items-center justify-center text-paper text-sm font-bold shrink-0 font-sans">
          {(username || "?").charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your name..."
            required
            className="w-full px-0 py-1.5 text-sm border-0 border-b border-border bg-transparent focus:outline-none focus:border-ink font-sans placeholder:text-ink-faded mb-2"
          />
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder="Add a comment..."
            rows={focused ? 3 : 1}
            required
            className="w-full px-0 py-1.5 text-sm border-0 border-b border-border bg-transparent focus:outline-none focus:border-ink font-sans placeholder:text-ink-faded resize-none transition-all"
          />
          {focused && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mt-2"
            >
              <button
                type="submit"
                disabled={loading || !username.trim() || !content.trim()}
                className="px-4 py-1.5 bg-ink text-paper text-xs font-semibold font-sans rounded-full hover:bg-ink-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="inline-block w-3 h-3 border border-paper/40 border-t-paper rounded-full animate-spin" />
                ) : (
                  "Comment"
                )}
              </button>
              <button
                type="button"
                onClick={() => { setFocused(false); setContent(""); }}
                className="px-4 py-1.5 text-xs font-semibold font-sans text-ink-faded hover:text-ink transition-colors rounded-full hover:bg-paper-dark"
              >
                Cancel
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </form>
  );
}

export function CommentCard({ comment }: { comment: Comment & { onReply?: () => void } }) {
  return (
    <div className="flex gap-3 py-4">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sepia to-gold flex items-center justify-center text-paper text-sm font-bold shrink-0 font-sans">
        {comment.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-ink font-sans">{comment.authorName}</span>
          <span className="text-xs text-ink-faded font-sans">{timeAgo(comment.createdAt)}</span>
        </div>
        <p className="mt-0.5 text-sm text-ink-light leading-relaxed font-sans">{comment.content}</p>
        <div className="flex items-center gap-4 mt-1.5">
          <button className="flex items-center gap-1 text-ink-faded hover:text-ink transition-colors">
            <ThumbsUp className="w-4 h-4" />
            <span className="text-xs font-sans font-medium">0</span>
          </button>
          <button className="flex items-center gap-1 text-ink-faded hover:text-ink transition-colors">
            <ThumbsDown className="w-4 h-4" />
          </button>
          <button className="text-xs font-semibold font-sans text-ink-faded hover:text-ink transition-colors">
            Reply
          </button>
        </div>
      </div>
    </div>
  );
}

export type { Comment };
