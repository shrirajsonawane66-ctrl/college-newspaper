"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import SidebarWidget from "@/components/ui/SidebarWidget";

interface RecentComment {
  id: string;
  author_name: string;
  content: string;
}

export default function RecentCommentsWidget() {
  const [recent, setRecent] = useState<RecentComment[]>([]);

  useEffect(() => {
    supabase
      .from("comments")
      .select("id, author_name, content")
      .eq("approved", true)
      .order("created_at", { ascending: false })
      .limit(4)
      .then(({ data }) => {
        if (data) setRecent(data as RecentComment[]);
      });
  }, []);

  if (recent.length === 0) return null;

  return (
    <SidebarWidget title="Recent Comments">
      <div className="space-y-3">
        {recent.map((comment) => (
          <div key={comment.id} className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full bg-zinc-200 flex items-center justify-center text-[10px] font-semibold text-ink-light shrink-0 mt-0.5">
              {comment.author_name?.charAt(0).toUpperCase() || "?"}
            </div>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-ink">{comment.author_name}</span>
              <p className="text-xs text-ink-light leading-relaxed line-clamp-2 mt-0.5">
                {comment.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </SidebarWidget>
  );
}
