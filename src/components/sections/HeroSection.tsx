import FeaturedHeadline from "@/components/ui/FeaturedHeadline";
import type { Article } from "@/lib/data";

export default function HeroSection({ articles }: { articles: Article[] }) {
  const [featured] = articles;
  if (!featured) return null;

  return (
    <section>
      <FeaturedHeadline article={featured} />
    </section>
  );
}
