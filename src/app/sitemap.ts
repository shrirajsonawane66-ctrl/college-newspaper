import type { MetadataRoute } from "next";

const BASE_URL = "https://campus-timeline.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "hourly" as const, priority: 1 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${BASE_URL}/archive`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${BASE_URL}/meme`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.5 },
  ];

  let articleRoutes: MetadataRoute.Sitemap = [];

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    );
    const { data } = await supabase
      .from("articles")
      .select("id, updated_at")
      .eq("is_published", true);

    if (data) {
      articleRoutes = data.map((article) => ({
        url: `${BASE_URL}/article/${article.id}`,
        lastModified: new Date(article.updated_at || Date.now()),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
    }
  } catch {
    // Silently fail - static routes still work
  }

  return [...staticRoutes, ...articleRoutes];
}
