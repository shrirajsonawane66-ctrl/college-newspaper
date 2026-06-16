"use client";

import Link from "next/link";
import type { Investigation } from "@/lib/investigations";

interface InvestigationCardProps {
  investigation: Investigation;
}

export default function InvestigationCard({ investigation }: InvestigationCardProps) {
  return (
    <Link
      href={`/investigations/${investigation.slug}`}
      className="group block newspaper-card overflow-hidden"
    >
      <div className="aspect-[4/3] bg-paper-dark overflow-hidden">
        {investigation.cover_image_url ? (
          <img
            src={investigation.cover_image_url}
            alt={investigation.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sepia/5 to-accent-light/30">
            <span className="text-ink-faded/40 font-serif text-4xl font-bold">
              ?
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        {investigation.category && (
          <span className="inline-block category-label text-sepia-dark mb-2">
            {investigation.category}
          </span>
        )}
        <h3 className="font-serif text-lg font-bold text-ink group-hover:text-sepia-dark transition-colors leading-tight mb-1">
          {investigation.title}
        </h3>
        {investigation.summary && (
          <p className="text-sm text-ink-lighter font-body line-clamp-2 mt-1">
            {investigation.summary}
          </p>
        )}
        {investigation.published_at && (
          <time className="text-[11px] text-ink-faded font-sans block mt-2">
            {new Date(investigation.published_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </time>
        )}
      </div>
    </Link>
  );
}
