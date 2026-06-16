"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import MangaReader from "@/components/investigations/MangaReader";
import { getSupabase } from "@/lib/supabase";
import type { Investigation, InvestigationPage } from "@/lib/investigations";

export default function InvestigationReaderPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [investigation, setInvestigation] = useState<Investigation | null>(null);
  const [pages, setPages] = useState<InvestigationPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;

    Promise.all([
      getSupabase()
        .from("investigations")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single(),
      getSupabase()
        .from("investigation_pages")
        .select("*")
        .order("page_number", { ascending: true }),
    ]).then(([invRes, pagesRes]) => {
      if (invRes.error || !invRes.data) {
        setError("Investigation not found.");
      } else {
        setInvestigation(invRes.data as Investigation);

        const filtered = ((pagesRes.data as InvestigationPage[]) || []).filter(
          (p) => p.investigation_id === invRes.data.id
        );
        setPages(filtered);
      }
      setLoading(false);
    });
  }, [slug]);

  useEffect(() => {
    if (investigation) {
      document.title = `${investigation.title} — Campus TIMELINE`;
    }
  }, [investigation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
          <p className="text-zinc-500 text-sm font-sans">Loading investigation&hellip;</p>
        </div>
      </div>
    );
  }

  if (error || !investigation) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-12 h-12 mx-auto border border-red-900/50 bg-red-950/30 flex items-center justify-center mb-4">
            <span className="text-red-400 text-xl font-bold">!</span>
          </div>
          <h2 className="font-serif text-xl font-bold text-white mb-2">
            {error || "Investigation not found"}
          </h2>
          <p className="text-zinc-400 text-sm font-sans mb-6">
            This investigation may have been removed or is not yet published.
          </p>
          <Link
            href="/investigations"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-white text-xs uppercase tracking-wider font-sans font-semibold hover:bg-white/20 transition-colors rounded"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Investigations
          </Link>
        </div>
      </div>
    );
  }

  return <MangaReader pages={pages} title={investigation.title} />;
}
