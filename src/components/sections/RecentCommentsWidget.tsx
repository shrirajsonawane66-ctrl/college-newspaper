"use client";

import { comments } from "@/lib/data";
import SidebarWidget from "@/components/ui/SidebarWidget";

export default function RecentCommentsWidget() {
  const recent = comments.slice(0, 4);

  return (
    <SidebarWidget title="Recent Comments">
      <div className="space-y-3">
        {recent.map((comment) => (
          <div key={comment.id} className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full bg-zinc-200 flex items-center justify-center text-[10px] font-semibold text-ink-light shrink-0 mt-0.5">
              {comment.avatar}
            </div>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-ink">{comment.username}</span>
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
