"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import BreakingNews from "@/components/layout/BreakingNews";
import Navbar from "@/components/layout/Navbar";
import Masthead from "@/components/layout/Masthead";
import CategoryNav from "@/components/layout/CategoryNav";
import NewsTicker from "@/components/layout/NewsTicker";
import Footer from "@/components/layout/Footer";
import { getSupabase } from "@/lib/supabase";
import { getArticleImage, type Article } from "@/lib/data";
import { TechNewsSection } from "@/components/sections/TechNewsSection";

interface WeatherData {
  temp: number;
  condition: string;
  city: string;
  icon: string;
}

const WMO_CODES: Record<number, { label: string; icon: string }> = {
  0: { label: "Clear", icon: "☀" },
  1: { label: "Mostly Clear", icon: "🌤" },
  2: { label: "Partly Cloudy", icon: "⛅" },
  3: { label: "Overcast", icon: "☁" },
  45: { label: "Foggy", icon: "🌫" },
  48: { label: "Rime Fog", icon: "🌫" },
  51: { label: "Light Drizzle", icon: "🌦" },
  53: { label: "Drizzle", icon: "🌦" },
  55: { label: "Heavy Drizzle", icon: "🌧" },
  61: { label: "Light Rain", icon: "🌦" },
  63: { label: "Rain", icon: "🌧" },
  65: { label: "Heavy Rain", icon: "🌧" },
  71: { label: "Light Snow", icon: "🌨" },
  73: { label: "Snow", icon: "🌨" },
  75: { label: "Heavy Snow", icon: "❄" },
  80: { label: "Light Showers", icon: "🌦" },
  81: { label: "Showers", icon: "🌧" },
  82: { label: "Heavy Showers", icon: "🌧" },
  95: { label: "Thunderstorm", icon: "⛈" },
  96: { label: "Thunderstorm", icon: "⛈" },
  99: { label: "Thunderstorm", icon: "⛈" },
};

function getSunPhase(): string {
  const h = new Date().getHours();
  if (h < 6) return "Night";
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  if (h < 20) return "Evening";
  return "Night";
}

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

export default function Home() {
  const [articlesList, setArticlesList] = useState<Article[]>([]);
  const [techNewsData, setTechNewsData] = useState<{ news: any[]; totalPages: number }>({ news: [], totalPages: 4 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  const fetchTechNewsInitial = useCallback(async () => {
    try {
      const res = await fetch("/api/tech-news?page=1");
      return await res.json();
    } catch {
      return { news: [], totalPages: 4 };
    }
  }, []);

  useEffect(() => {
    async function fetchData() {
      const [articlesResult, techNewsResult] = await Promise.all([
        getSupabase()
          .from("articles")
          .select("*")
          .eq("is_published", true)
          .order("created_at", { ascending: false })
          .limit(8),
        fetchTechNewsInitial(),
      ]);

      if (articlesResult.error) {
        setError("Failed to load articles.");
        setLoading(false);
        return;
      }

      const mapped: Article[] = (articlesResult.data || []).map((row: ArticleRow) => {
        const imgUrl = row.image_url || row.thumbnail_url || row.cover_image || "";
        return {
          id: row.id,
          title: row.title,
          subheadline: row.subheadline || "",
          summary: row.summary,
          content: row.content,
          category: row.category,
          categorySlug: row.category_slug,
          imageUrl: imgUrl,
          thumbnailUrl: imgUrl,
          coverImage: imgUrl,
          imageCaption: row.image_caption || "",
          imageCredit: row.image_credit || "",
          author: row.author,
          authorRole: row.author_role,
          publishedAt: row.published_at,
          isPublished: row.is_published,
          featured: row.featured || false,
          trending: row.trending || false,
          editorPick: row.editor_pick || false,
          dropCap: row.drop_cap !== false,
          readTime: row.read_time,
          isNew: row.is_new,
          tags: row.tags || "",
        };
      });

      setArticlesList(mapped);
      setTechNewsData(techNewsResult);
      setLoading(false);
    }

    fetchData();
  }, [fetchTechNewsInitial]);

  useEffect(() => {
    async function fetchWeather(lat: number, lon: number) {
      try {
        const [weatherRes, geoRes] = await Promise.all([
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`),
          fetch(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&count=1&language=en`),
        ]);
        const wdata = await weatherRes.json();
        const gdata = await geoRes.json();
        const code = wdata.current.weather_code as number;
        const entry = WMO_CODES[code] || { label: "Unknown", icon: "�" };
        const city = gdata.results?.[0]?.name || wdata.timezone?.split("/")[1]?.replace("_", " ") || "Local";
        setWeather({
          temp: Math.round(wdata.current.temperature_2m),
          condition: entry.label,
          icon: entry.icon,
          city,
        });
      } catch {
        setWeather(null);
      } finally {
        setWeatherLoading(false);
      }
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather(40.7128, -74.006),
        { timeout: 5000, enableHighAccuracy: false }
      );
    } else {
      fetchWeather(40.7128, -74.006);
    }
  }, []);

  if (loading) {
    return (
      <>
        <BreakingNews />
        <Navbar />
        <Masthead />
        <CategoryNav />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="flex items-center justify-center gap-2" style={{ fontFamily: "var(--font-archivo)", fontSize: "12px", color: "#5a5046" }}>
            <span className="inline-block w-4 h-4 border border-[#5a5046]/20 border-t-[#5a5046] rounded-full animate-spin" />
            Loading articles&hellip;
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <BreakingNews />
        <Navbar />
        <Masthead />
        <CategoryNav />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <p className="vintage-body-sm" style={{ color: "#8b6f4e" }}>{error}</p>
        </main>
        <Footer />
      </>
    );
  }

  if (articlesList.length === 0) {
    return (
      <>
        <BreakingNews />
        <Navbar />
        <Masthead />
        <CategoryNav />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="border-2 border-dashed border-[#c8bfa8] max-w-md mx-auto p-8" style={{ fontFamily: "var(--font-source-serif)" }}>
            <h2 className="vintage-headline-md mb-2">No Articles Yet</h2>
            <p className="vintage-body-sm" style={{ color: "#5a5046" }}>Published articles will appear here once they are created in the admin panel.</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const a = articlesList;
  const featured = a[0];
  const secondary = a.slice(1, 3);
  const editorial = a.slice(3, 5);
  const artsArticle = a[5];
  const featuredImg = getArticleImage(featured);

  return (
    <>
      <BreakingNews />
      <Navbar />
      <Masthead />
      <CategoryNav />
      <NewsTicker articles={a} />
      <main className="home-surface" style={{ minHeight: "100vh" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 2rem" }}>
          <div className="grid grid-cols-12 gap-6">
            {/* LEFT SIDEBAR (3 cols) */}
            <aside className="col-span-3 flex flex-col gap-8">
              <section style={{ border: "1px solid #000", padding: "16px", backgroundColor: "#fbf3df" }}>
                <h2 className="home-subhead-caps home-text-primary" style={{ borderBottom: "1px solid #000", paddingBottom: "4px", marginBottom: "12px" }}>Campus Dashboard</h2>
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

              {featuredImg && (
                <figure className="mb-6 home-halftone" style={{ border: "1px solid #000", padding: "4px", backgroundColor: "#fff" }}>
                  <Image src={featuredImg} alt={featured.title} width={800} height={400}
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

              {/* The Almanac — Live Weather */}
              <section style={{ borderTop: "4px solid #000", paddingTop: "16px", marginTop: "auto" }}>
                <div style={{ backgroundColor: "#eae2ce", padding: "16px", display: "flex", flexDirection: "column", alignItems: "center", border: "1px solid rgba(0,0,0,0.1)" }}>
                  <span className="home-subhead-caps home-text-secondary uppercase">The Almanac</span>
                  {weatherLoading ? (
                    <div className="home-label-tight home-text-on-surface-variant mt-2" style={{ fontSize: "11px" }}>Fetching conditions...</div>
                  ) : weather ? (
                    <>
                      <div className="home-body-sm home-text-on-surface-variant mt-1" style={{ fontSize: "11px" }}>{weather.city}</div>
                      <div className="flex items-center gap-3 my-2">
                        <span style={{ fontSize: "36px", lineHeight: 1 }}>{weather.icon}</span>
                        <span className="home-headline-lg" style={{ fontSize: "32px", lineHeight: 1 }}>{weather.temp}°</span>
                      </div>
                      <div className="home-label-tight home-text-primary uppercase">{weather.condition}</div>
                      <p className="home-body-sm home-text-on-surface-variant text-center mt-2">{getSunPhase()} edition</p>
                    </>
                  ) : (
                    <div className="home-label-tight home-text-on-surface-variant mt-2" style={{ fontSize: "11px" }}>Unavailable</div>
                  )}
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>
      <TechNewsSection
        initialNews={techNewsData.news ?? []}
        initialPage={1}
        initialTotalPages={techNewsData.totalPages ?? 4}
      />
      <Footer />
    </>
  );
}
