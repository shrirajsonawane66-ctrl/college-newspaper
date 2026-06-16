export interface Investigation {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  cover_image_url: string | null;
  category: string | null;
  author_id: string | null;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvestigationPage {
  id: string;
  investigation_id: string;
  page_number: number;
  image_url: string;
  caption: string | null;
  created_at: string;
}

export interface InvestigationWithPages extends Investigation {
  pages: InvestigationPage[];
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export { slugify };

const STORAGE_BUCKET = "investigation-pages";

export async function uploadInvestigationPage(
  file: File,
  investigationId: string,
  pageNumber: number,
  onProgress?: (pct: number) => void
): Promise<string> {
  const supabase = (await import("@/lib/supabase")).getSupabase();
  const ext = file.name.split(".").pop() || "jpg";
  const filePath = `${investigationId}/page-${String(pageNumber).padStart(2, "0")}.${ext}`;

  onProgress?.(10);

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  onProgress?.(90);

  const {
    data: { publicUrl },
  } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(data.path);

  onProgress?.(100);
  return publicUrl;
}

export async function deleteInvestigationPageImage(
  investigationId: string,
  pageNumber: number
): Promise<void> {
  const supabase = (await import("@/lib/supabase")).getSupabase();
  const prefix = `${investigationId}/page-${String(pageNumber).padStart(2, "0")}`;

  const { data: files } = await supabase.storage
    .from(STORAGE_BUCKET)
    .list(investigationId, {
      search: `page-${String(pageNumber).padStart(2, "0")}`,
    });

  if (files && files.length > 0) {
    const paths = files.map((f) => `${investigationId}/${f.name}`);
    await supabase.storage.from(STORAGE_BUCKET).remove(paths);
  }
}

export async function uploadInvestigationCover(
  file: File,
  investigationId: string,
  onProgress?: (pct: number) => void
): Promise<string> {
  const supabase = (await import("@/lib/supabase")).getSupabase();
  const ext = file.name.split(".").pop() || "jpg";
  const filePath = `${investigationId}/cover.${ext}`;

  onProgress?.(10);

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) throw new Error(`Cover upload failed: ${error.message}`);

  onProgress?.(90);

  const {
    data: { publicUrl },
  } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(data.path);

  onProgress?.(100);
  return publicUrl;
}
