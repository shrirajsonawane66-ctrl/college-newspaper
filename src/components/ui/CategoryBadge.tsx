import Link from "next/link";

export default function CategoryBadge({
  category,
  slug,
  size = "sm",
  plain,
}: {
  category: string;
  slug: string;
  size?: "sm" | "lg";
  plain?: boolean;
}) {
  const cls = `inline-block uppercase tracking-[0.2em] font-bold bg-paper-dark text-sepia-dark border border-sepia/30 font-body ${
    size === "lg" ? "px-2.5 py-0.5 text-[11px]" : "px-2 py-0.5 text-[10px]"
  }`;

  if (plain) {
    return <span className={cls}>{category}</span>;
  }

  return (
    <Link href={`/category/${slug}`} className={`${cls} hover:bg-sepia/10 transition-colors`}>
      {category}
    </Link>
  );
}
