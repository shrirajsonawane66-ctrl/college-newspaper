"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/layout/Footer";
import { getSupabase } from "@/lib/supabase";
import { getArticleImage, type Article } from "@/lib/data";

interface ArticleRow {
  id: string;
  title: string;
  subheadline: string;
  summary: string;
  content: string;
  category: string;
  category_slug: string;
  author: string;
  author_role: string;
  image_url: string;
  thumbnail_url: string;
  cover_image: string;
  image_caption: string;
  image_credit: string;
  published_at: string;
  is_published: boolean;
  featured: boolean;
  trending: boolean;
  editor_pick: boolean;
  drop_cap: boolean;
  read_time: string;
  is_new: boolean;
  tags: string;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

export default function Home() {
  const [articlesList, setArticlesList] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      const { data, error: err } = await getSupabase()
        .from("articles")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(8);

      if (err) { setError("Failed to load articles."); setLoading(false); return; }

      const mapped: Article[] = (data || []).map((row: ArticleRow) => {
        const imgUrl = row.image_url || row.thumbnail_url || row.cover_image || "";
        return {
          id: row.id, title: row.title, subheadline: row.subheadline || "",
          summary: row.summary, content: row.content, category: row.category,
          categorySlug: row.category_slug, imageUrl: imgUrl, thumbnailUrl: imgUrl,
          coverImage: imgUrl, imageCaption: row.image_caption || "",
          imageCredit: row.image_credit || "", author: row.author,
          authorRole: row.author_role, publishedAt: row.published_at,
          isPublished: row.is_published, featured: row.featured || false,
          trending: row.trending || false, editorPick: row.editor_pick || false,
          dropCap: row.drop_cap !== false, readTime: row.read_time,
          isNew: row.is_new, tags: row.tags || "",
        };
      });
      setArticlesList(mapped);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading || error || articlesList.length === 0) {
    const msg = loading ? "Loading articles\u2026" : error || "No articles yet.";
    return (
      <main className="home-surface min-h-screen flex items-center justify-center" style={{ fontFamily: "var(--font-archivo), sans-serif" }}>
        <div className="text-center">
          <h1 className="home-masthead-title mb-6 home-text-primary">THE CHRONICLE</h1>
          {loading ? (
            <span className="home-label-tight home-text-on-surface-variant">{msg}</span>
          ) : (
            <>
              <p className="home-body-sm home-text-on-surface-variant mb-4">{msg}</p>
              {msg === "No articles yet." && (
                <Link href="/" className="home-subhead-caps home-text-secondary underline underline-offset-4">Refresh</Link>
              )}
            </>
          )}
        </div>
      </main>
    );
  }

  const a = articlesList;
  const featured = a[0];
  const secondary = a.slice(1, 3);
  const editorial = a.slice(3, 5);
  const artsArticle = a[5];

  return (
    <>
      {/* ─── HEADER ─── */}
      <header className="w-full home-surface">
        <div className="flex flex-col items-center w-full px-8 max-w-screen-2xl mx-auto">
          <div className="w-full flex justify-between items-center py-2" style={{ borderBottom: "1px solid #000" }}>
            <div className="flex gap-4">
              <span className="home-label-tight home-text-primary">Vol. CXIV ... No. 34,102</span>
              <span className="home-label-tight home-text-primary px-4" style={{ borderLeft: "1px solid #000", borderRight: "1px solid #000" }}>Campus - City - World</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="home-label-tight home-text-primary">Edition:</span>
              <span className="home-label-tight home-text-primary">{formatDate(a[0]?.publishedAt || new Date().toISOString())}</span>
            </div>
          </div>
          <div className="w-full py-6 text-center" style={{ borderBottom: "4px solid #000" }}>
            <h1 className="home-masthead-title home-text-primary tracking-tighter">THE CHRONICLE</h1>
            <div className="flex justify-between items-center mt-2 px-1">
              <span className="home-subhead-caps home-text-primary">Founded 2026</span>
              <div className="flex gap-8">
                <span className="home-subhead-caps home-text-primary tracking-widest">{formatDate(a[0]?.publishedAt || new Date().toISOString()).toUpperCase()}</span>
              </div>
              <span className="home-subhead-caps home-text-primary">Free Edition</span>
            </div>
          </div>
          <nav className="w-full flex justify-center py-3" style={{ borderBottom: "1px solid #000" }}>
            <ul className="flex gap-8">
              {["Politics", "Campus", "Arts", "Opinion", "Tech", "Archive"].map((item) => (
                <li key={item}>
                  <a className={`home-subhead-caps px-1 ${item === "Politics" ? "font-bold" : ""}`}
                    href={item === "Archive" ? "/archive" : `/category/${item.toLowerCase()}`}
                    style={{ color: item === "Politics" ? "#000" : "#444748", borderBottom: item === "Politics" ? "2px solid #000" : "none" }}>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      {/* ─── MAIN GRID ─── */}
      <main className="max-w-screen-2xl mx-auto px-8 py-8 home-surface">
        <div className="grid grid-cols-12 gap-6">
          {/* LEFT SIDEBAR (3 cols) */}
          <aside className="col-span-3 flex flex-col gap-8">
            {/* Financials */}
            <section style={{ border: "1px solid #000", padding: "16px", backgroundColor: "#fbf3df" }}>
              <h2 className="home-subhead-caps home-text-primary uppercase" style={{ borderBottom: "1px solid #000", paddingBottom: "4px", marginBottom: "12px" }}>Campus Dashboard</h2>
              <div className="flex justify-between items-end mb-2">
                <span className="home-label-tight home-text-primary">Enrolled</span>
                <span className="home-headline-md home-text-primary" style={{ fontSize: "20px" }}>+12.4%</span>
              </div>
              <div className="space-y-2" style={{ borderTop: "1px solid rgba(0,0,0,0.2)", paddingTop: "8px" }}>
                <div className="flex justify-between home-label-tight home-text-primary"><span>Freshmen</span><span>2,450</span></div>
                <div className="flex justify-between home-label-tight home-text-primary"><span>Sophomores</span><span>1,980</span></div>
                <div className="flex justify-between home-label-tight home-text-primary"><span>Juniors</span><span>1,720</span></div>
              </div>
              <p className="home-body-sm home-text-on-surface-variant italic mt-4 text-center">"Record enrollment this academic year."</p>
            </section>

            {/* Foreign Intelligence */}
            {secondary.length > 0 && (
              <section style={{ borderTop: "4px solid #000", paddingTop: "16px" }}>
                <h3 className="home-subhead-caps home-text-secondary mb-2">Around Campus</h3>
                {secondary.map((art) => (
                  <Link key={art.id} href={`/article/${art.id}`} className="block no-underline mb-6 group">
                    <h2 className="home-headline-md home-text-primary mb-3 leading-tight" style={{ fontSize: "20px" }}>{art.title}</h2>
                    <p className="home-body-sm home-text-on-surface-variant home-justified">{art.summary}</p>
                    <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(0,0,0,0.2)" }}>
                      <span className="home-subhead-caps text-[11px] home-text-on-surface-variant" style={{ letterSpacing: "0" }}>By {art.author} | {art.category}</span>
                    </div>
                  </Link>
                ))}
              </section>
            )}

            {/* Archive Promo */}
            <div className="flex flex-col gap-4 py-6" style={{ borderTop: "1px solid #000", borderBottom: "1px solid #000" }}>
              <div style={{ backgroundColor: "#000", color: "#fff9ee", padding: "16px" }}>
                <h4 className="home-subhead-caps home-text-surface uppercase mb-2">The Archive</h4>
                <p className="home-body-sm home-text-surface">Browse every edition published by our college newspaper.</p>
              </div>
            </div>
          </aside>

          {/* CENTER — MAIN STORY (6 cols) */}
          <article className="col-span-6" style={{ borderLeft: "1px solid #000", borderRight: "1px solid #000", padding: "0 24px" }}>
            <div className="mb-6">
              <span className="home-subhead-caps home-text-secondary">Feature Exposition</span>
              <h2 className="home-headline-lg home-text-primary leading-none mb-4 mt-2">{featured.title}</h2>
              {featured.subheadline && (
                <h3 className="home-headline-md home-text-on-surface-variant italic font-normal mb-6">{featured.subheadline}</h3>
              )}
            </div>

            {getArticleImage(featured) && (
              <figure className="mb-6 home-halftone" style={{ border: "1px solid #000", padding: "4px", backgroundColor: "#fff" }}>
                <Image src={getArticleImage(featured)!} alt={featured.title} width={800} height={400}
                  className="w-full h-auto" style={{ display: "block" }} priority />
                {featured.imageCaption && (
                  <figcaption className="home-body-sm home-text-primary italic mt-2 px-1">
                    {featured.imageCaption}
                    {featured.imageCredit && <span> &mdash; Photo: {featured.imageCredit}</span>}
                  </figcaption>
                )}
              </figure>
            )}

            <div className="home-newspaper-columns home-justified">
              <p className="home-body-main home-dropcap" style={{ marginBottom: "1rem" }}>
                {featured.summary || featured.content?.replace(/<[^>]*>/g, "").slice(0, 400) || "Read the full article on the dedicated page."}
              </p>
              <div style={{ marginTop: "1rem" }}>
                <Link href={`/article/${featured.id}`} className="home-subhead-caps home-text-secondary underline underline-offset-4 hover:opacity-80">
                  Continue Reading →
                </Link>
              </div>
            </div>

            <div className="mt-8 pt-4 flex justify-between items-center" style={{ borderTop: "2px solid #000" }}>
              <span className="home-subhead-caps home-text-primary">By {featured.author}{featured.authorRole ? `, ${featured.authorRole}` : ""}</span>
            </div>
          </article>

          {/* RIGHT SIDEBAR (3 cols) */}
          <aside className="col-span-3 flex flex-col gap-8">
            {/* Editorial Desk */}
            <section style={{ borderBottom: "1px solid #000", paddingBottom: "32px" }}>
              <h2 className="home-subhead-caps home-text-primary uppercase mb-4" style={{ backgroundColor: "#e6e2df", padding: "4px 8px", display: "inline-block" }}>The Editorial Desk</h2>
              {editorial.map((art) => (
                <Link key={art.id} href={`/article/${art.id}`} className="block no-underline mb-6 group">
                  <h3 className="home-headline-md home-text-primary hover:underline decoration-1 underline-offset-4">{art.title}</h3>
                  <p className="home-body-sm home-text-on-surface-variant mt-2">{art.summary}</p>
                </Link>
              ))}
            </section>

            {/* Arts Section */}
            {artsArticle && (
              <section>
                <span className="home-subhead-caps home-text-secondary tracking-widest block mb-4">■ THE CULTURAL REVIEW ■</span>
                <div style={{ border: "1px solid #000", padding: "16px" }}>
                  <Link href={`/article/${artsArticle.id}`} className="no-underline">
                    <h2 className="home-headline-md home-text-primary leading-tight">{artsArticle.title}</h2>
                    <p className="home-body-sm home-text-on-surface-variant mt-2">{artsArticle.summary}</p>
                  </Link>
                </div>
              </section>
            )}

            {/* The Almanac */}
            <section style={{ borderTop: "4px solid #000", paddingTop: "16px", marginTop: "auto" }}>
              <div style={{ backgroundColor: "#eae2ce", padding: "16px", display: "flex", flexDirection: "column", alignItems: "center", border: "1px solid rgba(0,0,0,0.1)" }}>
                <span className="home-subhead-caps home-text-secondary uppercase">The Almanac</span>
                <div className="flex items-center gap-4 my-2">
                  <span className="home-headline-lg" style={{ fontSize: "32px", lineHeight: 1 }}>68°</span>
                  <div className="text-center">
                    <div className="home-label-tight home-text-primary uppercase">Fair</div>
                  </div>
                </div>
                <p className="home-body-sm home-text-on-surface-variant text-center">Sunset at 6:14 PM. Clear skies expected.</p>
              </div>
            </section>
          </aside>
        </div>
      </main>

      {/* ─── FOOTER ─── */}
      <Footer />
    </>
  );
}
