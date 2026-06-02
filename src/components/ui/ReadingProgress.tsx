"use client";

import { useEffect, useState } from "react";

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const article = document.querySelector("[data-article-body]");
      if (!article) {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0);
        return;
      }
      const rect = article.getBoundingClientRect();
      const total = rect.height;
      const remaining = rect.bottom - window.innerHeight;
      const read = Math.max(0, total - remaining);
      setProgress(total > 0 ? Math.min((read / total) * 100, 100) : 0);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="reading-progress" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
      <div className="reading-progress-fill" style={{ width: `${progress}%` }} />
    </div>
  );
}
