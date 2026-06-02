import { supabase } from "./supabase";
import { categories as fallbackCategories } from "./data";

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  visible: boolean;
  sort_order: number;
  created_at: string;
}

const CACHE_TTL = 5 * 60 * 1000;
let cached: { data: CategoryItem[]; timestamp: number } | null = null;

export async function fetchCategories(): Promise<CategoryItem[]> {
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.data;
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    if (data && data.length > 0) {
      cached = { data: data as CategoryItem[], timestamp: Date.now() };
      return cached.data;
    }
  } catch {}
  return fallbackCategories.map((c, i) => ({
    id: c.slug,
    name: c.name,
    slug: c.slug,
    description: "",
    icon: "Folder",
    visible: true,
    sort_order: i + 1,
    created_at: "",
  }));
}

export function invalidateCache() {
  cached = null;
}
