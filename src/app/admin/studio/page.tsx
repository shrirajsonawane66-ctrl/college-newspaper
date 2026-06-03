"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  Save, CheckCircle, XCircle, Eye,
} from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import StepIndicator from "@/components/admin/StepIndicator";
import ImageUploader from "@/components/admin/ImageUploader";
import LivePreview from "@/components/admin/LivePreview";
import PublishModal from "@/components/admin/PublishModal";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import type { ArticleForm } from "@/lib/data";

const CATEGORIES = ["Campus News", "Announcements", "Events", "Publicity", "Meme", "Achievements"];

const emptyForm: ArticleForm = {
  title: "",
  subheadline: "",
  summary: "",
  content: "",
  category: "Campus News",
  author: "",
  author_role: "Staff Reporter",
  image_url: "",
  image_caption: "",
  image_credit: "",
  tags: "",
  seo_description: "",
  featured: false,
  trending: false,
  editor_pick: false,
  drop_cap: true,
};

function calcReadTime(text: string) {
  const wc = text.split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(wc / 200))} min read`;
}

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, "-");
}

export default function StudioPage() {
  const { isLoading: authLoading } = useAuth();
  const [step, setStep] = useState("details");
  const [form, setForm] = useState<ArticleForm>({ ...emptyForm });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSavedRef = useRef("");
  const formRef = useRef(form);
  const editingIdRef = useRef(editingId);

  const showNotification = useCallback((type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    const params = new URLSearchParams(window.location.search);
    const editId = params.get("edit");
    if (editId) {
      setEditingId(editId);
      getSupabase().from("articles").select("*").eq("id", editId).single().then(({ data }) => {
        if (data) {
          const imgUrl = data.image_url || data.thumbnail_url || data.cover_image || "";
          const loadedForm = {
            title: data.title || "",
            subheadline: data.subheadline || "",
            summary: data.summary || "",
            content: data.content || "",
            category: data.category || "Campus News",
            author: data.author || "",
            author_role: data.author_role || "Staff Reporter",
            image_url: imgUrl,
            image_caption: data.image_caption || "",
            image_credit: data.image_credit || "",
            tags: data.tags || "",
            seo_description: data.seo_description || "",
            featured: data.featured || false,
            trending: data.trending || false,
            editor_pick: data.editor_pick || false,
            drop_cap: data.drop_cap !== false,
          };
          setForm(loadedForm);
          lastSavedRef.current = JSON.stringify(loadedForm);
        }
      });
    }
  }, [authLoading]);

  useEffect(() => { formRef.current = form; }, [form]);
  useEffect(() => { editingIdRef.current = editingId; }, [editingId]);

  const formString = JSON.stringify(form);

  // Debounced auto-save — only runs when dirty and idle for 3s
  useEffect(() => {
    if (autoSaveTimer.current) clearInterval(autoSaveTimer.current);

    autoSaveTimer.current = setInterval(async () => {
      if (lastSavedRef.current === formString) return;
      const f = formRef.current;
      const eid = editingIdRef.current;
      if (!f.title || !f.author) return;

      setAutoSaveStatus("saving");
      const imageUrl = f.image_url;
      const record = {
        title: f.title,
        subheadline: f.subheadline,
        summary: f.summary,
        content: f.content,
        category: f.category,
        category_slug: slugify(f.category),
        author: f.author,
        author_name: f.author,
        author_role: f.author_role,
        image_url: imageUrl,
        thumbnail_url: imageUrl,
        cover_image: imageUrl,
        image_caption: f.image_caption,
        image_credit: f.image_credit,
        tags: f.tags,
        seo_description: f.seo_description,
        featured: f.featured,
        trending: f.trending,
        editor_pick: f.editor_pick,
        drop_cap: f.drop_cap,
        published_at: new Date().toISOString(),
        is_published: false,
        status: "draft",
        is_new: false,
        read_time: calcReadTime(f.content),
      };

      const { data, error } = eid
        ? await getSupabase().from("articles").update(record).eq("id", eid)
        : await getSupabase().from("articles").insert(record).select();

      if (!error) {
        if (data && Array.isArray(data) && data.length > 0 && !eid) {
          editingIdRef.current = data[0].id;
          setEditingId(data[0].id);
        }
        lastSavedRef.current = JSON.stringify(f);
        setAutoSaveStatus("saved");
        setTimeout(() => setAutoSaveStatus("idle"), 2000);
      } else {
        setAutoSaveStatus("error");
      }
    }, 20000);

    return () => {
      if (autoSaveTimer.current) clearInterval(autoSaveTimer.current);
    };
  }, [formString]);

  const contentStats = useMemo(() => ({
    words: form.content ? form.content.split(/\s+/).filter(Boolean).length : 0,
    chars: form.content ? form.content.length : 0,
  }), [form.content]);

  const previewData = useMemo(() => ({
    title: form.title,
    subheadline: form.subheadline,
    summary: form.summary,
    content: form.content,
    category: form.category,
    categorySlug: slugify(form.category),
    author: form.author,
    authorRole: form.author_role,
    imageUrl: form.image_url,
    imageCaption: form.image_caption || "",
    imageCredit: form.image_credit || "",
    publishedAt: new Date().toISOString().split("T")[0],
    readTime: calcReadTime(form.content),
    dropCap: form.drop_cap,
  }), [form.title, form.subheadline, form.summary, form.content, form.category, form.author, form.author_role, form.image_url, form.image_caption, form.image_credit, form.drop_cap]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="flex items-center gap-2 text-ink-faded text-sm font-body">
          <span className="inline-block w-4 h-4 border border-ink/20 border-t-ink rounded-full animate-spin" />
          Verifying session&hellip;
        </div>
      </div>
    );
  }

  const updateForm = (key: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (isPublished: boolean) => {
    setSaving(true);
    const imageUrl = form.image_url;
    const record = {
      title: form.title,
      subheadline: form.subheadline,
      summary: form.summary,
      content: form.content,
      category: form.category,
      category_slug: slugify(form.category),
      author: form.author,
      author_name: form.author,
      author_role: form.author_role,
      image_url: imageUrl,
      thumbnail_url: imageUrl,
      cover_image: imageUrl,
      image_caption: form.image_caption,
      image_credit: form.image_credit,
      tags: form.tags,
      seo_description: form.seo_description,
      featured: form.featured,
      trending: form.trending,
      editor_pick: form.editor_pick,
      drop_cap: form.drop_cap,
      published_at: new Date().toISOString(),
      is_published: isPublished,
      status: isPublished ? "published" : "draft",
      is_new: isPublished,
      read_time: calcReadTime(form.content),
    };

    const { error } = editingId
      ? await getSupabase().from("articles").update(record).eq("id", editingId)
      : await getSupabase().from("articles").insert(record).select();

    setSaving(false);

    if (error) {
      throw new Error(error.message);
    } else {
      lastSavedRef.current = JSON.stringify(form);
    }
  };

  const handlePublishConfirm = async (action: "publish" | "draft") => {
    await handleSave(action === "publish");
  };

  const stepContent = (
    <div className="space-y-5">
      {/* STEP 1: DETAILS */}
      {step === "details" && (
        <>
          <div>
            <div className="section-head">Step 1 of 5</div>
            <h2 className="font-serif text-xl font-bold text-ink mt-0.5 tracking-tight">Article Details</h2>
            <p className="text-sm text-ink-faded font-sans mt-0.5">Write your article headline, summary, and full content.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-ink-lighter font-semibold mb-1.5 font-sans">
                Headline <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateForm("title", e.target.value)}
                placeholder="Enter a compelling headline for your article..."
                required
                className="w-full px-4 py-3 text-xl font-serif font-bold text-ink border border-border bg-paper focus:outline-none placeholder:text-ink-faded/50 transition-all duration-200 focus:border-gold/60"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-ink-lighter font-semibold mb-1.5 font-sans">
                Subheadline / Deck
              </label>
              <input
                type="text"
                value={form.subheadline}
                onChange={(e) => updateForm("subheadline", e.target.value)}
                placeholder="A short editorial summary or introduction below the headline..."
                className="w-full px-3 py-2.5 text-base border border-border bg-paper focus:outline-none font-serif italic text-ink-light placeholder:text-ink-faded/50 transition-all duration-200 focus:border-gold/60"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-ink-lighter font-semibold mb-1.5 font-sans">
                Summary <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={2}
                value={form.summary}
                onChange={(e) => updateForm("summary", e.target.value)}
                placeholder="A brief summary that appears in article cards and previews..."
                required
                className="w-full px-3 py-2.5 text-base border border-border bg-paper focus:outline-none font-body text-ink placeholder:text-ink-faded/50 resize-none transition-all duration-200 focus:border-gold/60"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs uppercase tracking-[0.15em] text-ink-lighter font-semibold font-sans">
                  Article Body
                </label>
                <span className="text-[11px] text-ink-faded font-sans font-medium">
                  {contentStats.words} words &middot; {contentStats.chars} characters
                </span>
              </div>
              <RichTextEditor
                content={form.content}
                onChange={(html) => updateForm("content", html)}
                placeholder="Write your article content here..."
              />
            </div>

            <div className="flex items-center gap-3 pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={form.drop_cap}
                  onChange={(e) => updateForm("drop_cap", e.target.checked)}
                  className="w-3.5 h-3.5 accent-sepia"
                />
                <span className="text-sm font-sans text-ink-light group-hover:text-ink transition-colors font-medium">
                  Enable drop cap on first paragraph
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-ink-lighter font-semibold mb-1.5 font-sans">
                  Author <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.author}
                  onChange={(e) => updateForm("author", e.target.value)}
                  placeholder="Author name"
                  required
                  className="w-full px-3 py-2.5 text-base border border-border bg-paper focus:outline-none font-body text-ink placeholder:text-ink-faded/50 transition-all duration-200 focus:border-gold/60"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-ink-lighter font-semibold mb-1.5 font-sans">
                  Author Role
                </label>
                <input
                  type="text"
                  value={form.author_role}
                  onChange={(e) => updateForm("author_role", e.target.value)}
                  placeholder="Staff Reporter"
                  className="w-full px-3 py-2.5 text-base border border-border bg-paper focus:outline-none font-body text-ink placeholder:text-ink-faded/50 transition-all duration-200 focus:border-gold/60"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-ink-lighter font-semibold mb-1.5 font-sans">
                Category <span className="text-red-400">*</span>
              </label>
              <select
                value={form.category}
                onChange={(e) => updateForm("category", e.target.value)}
                className="w-full px-3 py-2.5 text-base border border-border bg-paper focus:outline-none font-body text-ink transition-all duration-200 focus:border-gold/60"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </>
      )}

      {/* STEP 2: THUMBNAIL */}
      {step === "thumbnail" && (
        <>
          <div>
            <div className="section-head">Step 2 of 5</div>
            <h2 className="font-serif text-xl font-bold text-ink mt-0.5 tracking-tight">Thumbnail Image</h2>
            <p className="text-sm text-ink-faded font-sans mt-0.5">Upload a banner image or paste a URL.</p>
          </div>

          <ImageUploader
            initialValue={form.image_url}
            onUploadComplete={(url) => updateForm("image_url", url)}
          />
          {form.image_url && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-ink-lighter font-semibold mb-1.5 font-sans">
                  Image Caption
                </label>
                <input
                  type="text"
                  value={form.image_caption}
                  onChange={(e) => updateForm("image_caption", e.target.value)}
                  placeholder="A descriptive caption for the hero image..."
                  className="w-full px-3 py-2.5 text-base border border-border bg-paper focus:outline-none font-body text-ink placeholder:text-ink-faded/50 transition-all duration-200 focus:border-gold/60"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-ink-lighter font-semibold mb-1.5 font-sans">
                  Image Credit
                </label>
                <input
                  type="text"
                  value={form.image_credit}
                  onChange={(e) => updateForm("image_credit", e.target.value)}
                  placeholder="Photo by Author Name / WCCBM"
                  className="w-full px-3 py-2.5 text-base border border-border bg-paper focus:outline-none font-body text-ink placeholder:text-ink-faded/50 transition-all duration-200 focus:border-gold/60"
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* STEP 3: SETTINGS */}
      {step === "settings" && (
        <>
          <div>
            <div className="section-head">Step 3 of 5</div>
            <h2 className="font-serif text-xl font-bold text-ink mt-0.5 tracking-tight">Article Settings</h2>
            <p className="text-sm text-ink-faded font-sans mt-0.5">Set SEO metadata, tags, and visibility options.</p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-ink-lighter font-semibold mb-1.5 font-sans">
                SEO Meta Description
              </label>
              <textarea
                rows={2}
                value={form.seo_description}
                onChange={(e) => updateForm("seo_description", e.target.value)}
                placeholder="A short description for search engines (recommended: 150-160 characters)"
                className="w-full px-3 py-2.5 text-base border border-border bg-paper focus:outline-none font-body text-ink placeholder:text-ink-faded/50 resize-none transition-all duration-200 focus:border-gold/60"
              />
              <p className="text-[11px] text-ink-faded mt-1 font-sans font-medium">
                {form.seo_description.length} / 160 characters
                {form.seo_description.length > 160 && (
                  <span className="text-amber-600 ml-1">(recommended max 160)</span>
                )}
              </p>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-ink-lighter font-semibold mb-1.5 font-sans">
                Tags
              </label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => updateForm("tags", e.target.value)}
                placeholder="campus, news, events, achievements (comma-separated)"
                className="w-full px-3 py-2.5 text-base border border-border bg-paper focus:outline-none font-body text-ink placeholder:text-ink-faded/50 transition-all duration-200 focus:border-gold/60"
              />
              <p className="text-[11px] text-ink-faded mt-1 font-sans font-medium">
                Separate tags with commas
              </p>
            </div>

            <div className="pt-2">
              <p className="text-xs uppercase tracking-[0.15em] text-ink-lighter font-semibold mb-3 font-sans">
                Visibility &amp; Promotion
              </p>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => updateForm("featured", e.target.checked)}
                    className="w-4 h-4 accent-sepia"
                  />
                  <span className="text-sm font-sans text-ink-light group-hover:text-ink transition-colors font-medium">
                    Featured Article
                  </span>
                  <span className="text-[11px] text-ink-faded font-sans ml-auto">
                    Appears in featured section
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={form.trending}
                    onChange={(e) => updateForm("trending", e.target.checked)}
                    className="w-4 h-4 accent-sepia"
                  />
                  <span className="text-sm font-sans text-ink-light group-hover:text-ink transition-colors font-medium">
                    Trending
                  </span>
                  <span className="text-[11px] text-ink-faded font-sans ml-auto">
                    Shows in trending sidebar
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={form.editor_pick}
                    onChange={(e) => updateForm("editor_pick", e.target.checked)}
                    className="w-4 h-4 accent-sepia"
                  />
                  <span className="text-sm font-sans text-ink-light group-hover:text-ink transition-colors font-medium">
                    Editor&apos;s Pick
                  </span>
                  <span className="text-[11px] text-ink-faded font-sans ml-auto">
                    Highlighted in editor pick section
                  </span>
                </label>
              </div>
            </div>
          </div>
        </>
      )}

      {/* STEP 4: PREVIEW */}
      {step === "preview" && (
        <>
          <div>
            <div className="section-head">Step 4 of 5</div>
            <h2 className="font-serif text-xl font-bold text-ink mt-0.5 tracking-tight">Article Preview</h2>
            <p className="text-sm text-ink-faded font-sans mt-0.5">
              See exactly how your article will appear to readers.
            </p>
          </div>

          <div className="border-2 border-ink/15 bg-paper-dark overflow-hidden">
            <div className="px-4 sm:px-6 pt-4 pb-2 text-center border-b border-border">
              <p className="text-[9px] uppercase tracking-[0.2em] text-ink-faded font-sans font-semibold">
                WCCBM TIMELINE &mdash; Article Preview
              </p>
              <div className="newspaper-rule-thick max-w-[60px] mx-auto mt-1" />
            </div>

            <div className="px-4 sm:px-6 py-4">
              {form.category && (
                <div className="inline-block bg-paper-dark border border-border text-ink text-[9px] uppercase tracking-[0.15em] px-2 py-0.5 font-sans font-semibold mb-2">
                  {form.category}
                </div>
              )}

              <h1 className="font-serif font-bold text-ink text-xl sm:text-2xl md:text-3xl leading-tight tracking-tight mt-1">
                {form.title || (
                  <span className="text-ink-faded/30 italic font-normal text-lg">Article headline&hellip;</span>
                )}
              </h1>

              {(form.author || form.author_role) && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs uppercase tracking-[0.15em] text-ink-lighter font-sans font-medium">
                  {form.author && <span>{form.author}</span>}
                  {form.author && form.author_role && <span className="text-border">|</span>}
                  {form.author_role && <span>{form.author_role}</span>}
                  <span className="text-border">|</span>
                  <span className="italic lowercase text-[11px] text-ink-faded not-italic">
                    {calcReadTime(form.content)}
                  </span>
                </div>
              )}

              {form.image_url && (
                <div className="mt-4 border border-border overflow-hidden bg-paper-dark">
                  <img
                    src={form.image_url}
                    alt="Article banner"
                    className="w-full h-auto object-contain max-h-[400px]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}

              {form.summary && (
                <p className="mt-4 text-sm text-ink-light font-body leading-relaxed italic border-l-2 border-gold/30 pl-3">
                  {form.summary}
                </p>
              )}

              {form.content ? (
                <div
                  className="mt-4 text-sm leading-relaxed text-ink-light font-body [&>p]:mb-4 [&>p]:leading-[1.7] dropcap"
                  dangerouslySetInnerHTML={{ __html: form.content }}
                />
              ) : (
                <div className="mt-4 py-8 text-center border border-dashed border-border">
                  <p className="text-sm text-ink-faded/50 font-body italic">
                    Article content will appear here&hellip;
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* STEP 5: PUBLISH */}
      {step === "publish" && (
        <>
          <div>
            <div className="section-head">Step 5 of 5</div>
            <h2 className="font-serif text-xl font-bold text-ink mt-0.5 tracking-tight">Publish Article</h2>
            <p className="text-sm text-ink-faded font-sans mt-0.5">
              Your article is ready. Choose how you want to release it.
            </p>
          </div>

          <div className="border border-border bg-paper-light p-4 space-y-2">
            <h3 className="font-serif font-bold text-ink text-base leading-snug">
              {form.title || "Untitled Article"}
            </h3>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-ink-faded font-sans">
              <span>By {form.author || "Unknown"}</span>
              <span>{form.category}</span>
              <span>{calcReadTime(form.content)}</span>
              <span>{contentStats.words} words</span>
            </div>
            {form.summary && (
              <p className="text-sm text-ink-light font-body leading-relaxed line-clamp-2 border-t border-border pt-2">
                {form.summary}
              </p>
            )}
          </div>

          {(!form.title || !form.author || !form.content) && (
            <div className="border border-amber-200 bg-amber-50/50 px-4 py-3">
              <p className="text-[11px] text-amber-800 font-sans font-semibold flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5 shrink-0" />
                Required fields missing
              </p>
              <ul className="mt-1 text-[11px] text-amber-700 font-sans list-disc list-inside space-y-0.5">
                {!form.title && <li>Headline is required</li>}
                {!form.author && <li>Author is required</li>}
                {!form.content && <li>Content is required</li>}
              </ul>
            </div>
          )}

          <div className="space-y-2.5">
            <button
              onClick={() => setPublishModalOpen(true)}
              disabled={!form.title || !form.author || !form.content || saving}
              className="w-full py-3 bg-gold text-paper text-sm uppercase tracking-wider font-sans font-bold hover:bg-gold/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
            >
              {saving ? (
                <>
                  <span className="inline-block w-3.5 h-3.5 border border-paper/40 border-t-paper rounded-full animate-spin" />
                  Saving&hellip;
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  {editingId ? "Update & Publish" : "Publish Article"}
                </>
              )}
            </button>

            <button
              onClick={async () => {
                try {
                  await handleSave(false);
                  showNotification("success", "Draft saved successfully!");
                } catch (err: unknown) {
                  showNotification("error", err instanceof Error ? err.message : "Failed to save draft.");
                }
              }}
              disabled={saving}
              className="w-full py-2.5 border border-border text-xs uppercase tracking-wider text-ink-light font-sans font-semibold hover:bg-paper-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <span className="inline-block w-3 h-3 border border-ink/20 border-t-ink rounded-full animate-spin" />
                  Saving&hellip;
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  {editingId ? "Update Draft" : "Save as Draft"}
                </>
              )}
            </button>

            {editingId && (
              <a
                href="/admin/dashboard"
                className="block w-full text-center py-2.5 border border-border text-xs uppercase tracking-wider text-ink-faded font-sans font-semibold hover:bg-paper-dark transition-colors"
              >
                Back to Dashboard
              </a>
            )}
          </div>
        </>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <button
          onClick={() => {
            const steps = ["details", "thumbnail", "settings", "preview", "publish"];
            const idx = steps.indexOf(step);
            if (idx > 0) setStep(steps[idx - 1]);
          }}
          disabled={step === "details"}
          className="px-3 py-1.5 border border-border text-[10px] uppercase tracking-wider text-ink-light font-sans font-semibold hover:bg-paper-dark transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          &larr; Previous
        </button>

        <button
          onClick={() => {
            const steps = ["details", "thumbnail", "settings", "preview", "publish"];
            const idx = steps.indexOf(step);
            if (idx < steps.length - 1) setStep(steps[idx + 1]);
          }}
          disabled={step === "publish"}
          className="px-4 py-1.5 bg-ink text-paper text-[10px] uppercase tracking-wider font-sans font-semibold hover:bg-ink-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Next &rarr;
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-paper flex">
      <StepIndicator currentStep={step} onStepClick={setStep} />

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-paper-light border-b border-border px-4 lg:px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-lg lg:text-xl font-bold text-ink tracking-tight">
              {editingId ? "Edit Article" : "New Article"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[10px] font-sans">
              {autoSaveStatus === "saving" && (
                <span className="text-ink-faded flex items-center gap-1">
                  <span className="inline-block w-2.5 h-2.5 border border-ink/20 border-t-ink rounded-full animate-spin" />
                  Saving&hellip;
                </span>
              )}
              {autoSaveStatus === "saved" && (
                <span className="text-emerald-600 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Saved
                </span>
              )}
              {autoSaveStatus === "error" && (
                <span className="text-red-500 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  Save failed
                </span>
              )}
            </div>

            <a
              href="/admin/dashboard"
              className="text-[10px] uppercase tracking-[0.15em] text-ink-lighter hover:text-ink font-sans font-semibold transition-colors"
            >
              Dashboard
            </a>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-5">
            {stepContent}
          </div>

          <aside className="w-72 lg:w-80 xl:w-88 border-l border-border bg-paper-light overflow-y-auto shrink-0 hidden lg:block">
            <div className="p-4">
              <LivePreview data={previewData} articleId={editingId || "preview"} />
            </div>
          </aside>
        </div>

        {notification && (
          <div className={`fixed bottom-4 right-4 z-20 px-4 py-2.5 text-sm font-sans flex items-center gap-2 shadow-lg border ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}>
            {notification.type === "success" ? <CheckCircle className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
            {notification.message}
          </div>
        )}
      </div>

      <PublishModal
        open={publishModalOpen}
        onClose={() => setPublishModalOpen(false)}
        onConfirm={handlePublishConfirm}
        title={form.title || "Untitled Article"}
      />
    </div>
  );
}
