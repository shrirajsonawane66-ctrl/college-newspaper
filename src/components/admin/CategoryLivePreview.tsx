"use client";

interface CategoryPreviewData {
  name: string;
  slug: string;
  description: string;
  visible: boolean;
  image_url: string;
  article_count: number;
}

export default function CategoryLivePreview({
  data,
}: {
  data: CategoryPreviewData;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-sm font-bold text-ink">Live Preview</h3>
        <span className="text-[9px] uppercase tracking-[0.2em] text-emerald-600 font-body font-semibold flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse-glow" />
          Live
        </span>
      </div>

      <div className="border border-border bg-paper overflow-hidden shadow-sm">
        {/* Banner */}
        <div className="aspect-[21/9] bg-ink/5 border-b border-border relative overflow-hidden">
          {data.image_url ? (
            <img
              src={data.image_url}
              alt="Category banner"
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-10 h-10 mx-auto border border-border/50 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-ink-faded/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                  </svg>
                </div>
                <p className="text-[9px] text-ink-faded/50 mt-1 font-body">No banner</p>
              </div>
            </div>
          )}
          {data.name && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink/70 to-transparent p-4">
              <h3 className="font-serif font-bold text-paper text-lg tracking-tight">{data.name}</h3>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-ink-faded">/{data.slug || "category-slug"}</span>
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${data.visible ? "bg-emerald-400" : "bg-zinc-300"}`} />
            <span className="text-[9px] uppercase tracking-[0.1em] text-ink-faded font-body font-semibold">
              {data.visible ? "Visible" : "Hidden"}
            </span>
          </div>

          {data.description && (
            <p className="text-[11px] text-ink-light font-body leading-relaxed line-clamp-2">
              {data.description}
            </p>
          )}

          <div className="flex items-center gap-2 text-[9px] text-ink-faded font-body border-t border-border pt-2">
            <span className="font-medium text-ink-light">{data.article_count} article{data.article_count !== 1 ? "s" : ""}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="border border-border bg-paper-dark/30 p-2.5 text-center">
          <p className="text-lg font-bold font-serif text-ink tabular-nums">{data.article_count}</p>
          <p className="text-[9px] uppercase tracking-[0.15em] text-ink-faded font-body font-semibold">Articles</p>
        </div>
        <div className="border border-border bg-paper-dark/30 p-2.5 text-center">
          <p className="text-lg font-bold font-serif text-ink tabular-nums">/{data.slug || "—"}</p>
          <p className="text-[9px] uppercase tracking-[0.15em] text-ink-faded font-body font-semibold">URL Slug</p>
        </div>
        <div className="border border-border bg-paper-dark/30 p-2.5 text-center">
          <p className={`text-lg font-bold font-serif tabular-nums ${data.visible ? "text-emerald-600" : "text-zinc-400"}`}>
            {data.visible ? "Live" : "Hidden"}
          </p>
          <p className="text-[9px] uppercase tracking-[0.15em] text-ink-faded font-body font-semibold">Status</p>
        </div>
        <div className="border border-border bg-paper-dark/30 p-2.5 text-center">
          <p className="text-lg font-bold font-serif text-ink tabular-nums">{data.description ? data.description.length : 0}</p>
          <p className="text-[9px] uppercase tracking-[0.15em] text-ink-faded font-body font-semibold">Desc. Chars</p>
        </div>
      </div>
    </div>
  );
}
