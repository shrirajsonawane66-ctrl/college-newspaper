"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

export default function CommentForm({ articleId, onSuccess }: { articleId: string; onSuccess?: () => void }) {
  const [username, setUsername] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

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
          },
        ]);

      if (error) {
        return;
      }

      setSuccess(true);
      setUsername("");
      setContent("");
      onSuccess?.();
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(() => setSuccess(false), 3000);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="newspaper-card p-4"
    >
      <h3 className="font-serif text-base font-bold text-ink mb-3">Leave a Comment</h3>
      <div className="space-y-2.5">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Your name"
          required
          className="w-full px-3 py-2 text-sm border border-border bg-paper focus:outline-none font-sans placeholder:text-ink-faded"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts..."
          rows={3}
          required
          className="w-full px-3 py-2 text-sm border border-border bg-paper focus:outline-none font-sans placeholder:text-ink-faded resize-none"
        />
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-ink-faded font-sans">Share your thoughts with the community.</p>
          {success ? (
            <span className="text-xs text-emerald-600 font-sans font-semibold">
              Comment posted!
            </span>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-ink text-paper text-xs font-sans font-semibold hover:bg-ink-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="inline-block w-3 h-3 border border-paper/40 border-t-paper rounded-full animate-spin" />
              ) : (
                <>
                  Submit <Send className="w-3 h-3" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </motion.form>
  );
}
