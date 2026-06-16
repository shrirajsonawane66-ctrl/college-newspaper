"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BreakingNews from "@/components/layout/BreakingNews";
import Navbar from "@/components/layout/Navbar";
import Masthead from "@/components/layout/Masthead";
import CategoryNav from "@/components/layout/CategoryNav";
import Footer from "@/components/layout/Footer";
import InvestigationCard from "@/components/investigations/InvestigationCard";
import { getSupabase } from "@/lib/supabase";
import type { Investigation } from "@/lib/investigations";

export default function InvestigationsPage() {
  const [list, setList] = useState<Investigation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getSupabase()
      .from("investigations")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .then(({ data, error: err }) => {
        if (err) {
          setError("Failed to load investigations.");
        } else {
          setList((data as Investigation[]) || []);
        }
        setLoading(false);
      });
  }, []);

  return (
    <>
      <BreakingNews />
      <Navbar />
      <Masthead />
      <CategoryNav />

      <main className="newspaper-container py-8">
        <div className="border-b border-border pb-4 mb-8">
          <h1 className="font-serif text-3xl lg:text-4xl font-bold text-ink">
            Investigations
          </h1>
          <p className="text-ink-lighter font-body mt-1 text-sm">
            In-depth student investigative journalism presented as manga-style storyboards
          </p>
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] bg-paper-dark rounded-sm" />
                <div className="p-4 space-y-2">
                  <div className="h-3 w-16 bg-paper-dark rounded" />
                  <div className="h-5 w-full bg-paper-dark rounded" />
                  <div className="h-4 w-3/4 bg-paper-dark rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-16 border border-dashed border-border">
            <div className="w-12 h-12 mx-auto border border-red-200 bg-red-50 flex items-center justify-center mb-4">
              <span className="text-red-500 text-xl font-bold">!</span>
            </div>
            <p className="text-ink-faded font-sans text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-ink text-paper text-xs uppercase tracking-wider font-sans font-semibold hover:bg-ink-light transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && list.length === 0 && (
          <div className="text-center py-16 border border-dashed border-border">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-paper-dark flex items-center justify-center">
              <span className="text-2xl font-serif text-ink-faded/50">?</span>
            </div>
            <h2 className="font-serif text-xl font-bold text-ink mb-2">
              No investigations yet
            </h2>
            <p className="text-ink-faded font-sans text-sm max-w-md mx-auto">
              Student investigative pieces are being prepared. Check back soon for the first manga-style storyboard.
            </p>
            <Link
              href="/"
              className="inline-block mt-6 px-4 py-2 bg-ink text-paper text-xs uppercase tracking-wider font-sans font-semibold hover:bg-ink-light transition-colors"
            >
              Back to Home
            </Link>
          </div>
        )}

        {!loading && !error && list.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {list.map((inv) => (
              <InvestigationCard key={inv.id} investigation={inv} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
