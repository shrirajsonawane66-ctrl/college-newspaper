"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save, CheckCircle, XCircle, Eye, EyeOff, Star,
  TrendingUp, ArrowUpDown, Search, Pencil, Trash2, Plus,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { fetchCategories, invalidateCache, type CategoryItem } from "@/lib/categories";
import CategoryStepIndicator from "@/components/admin/CategoryStepIndicator";
import CategoryLivePreview from "@/components/admin/CategoryLivePreview";
import { useAuth } from "@/hooks/useAuth";

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

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  icon: "Folder",
  visible: true,
  sort_order: 0,
  seo_title: "",
  seo_description: "",
  image_url: "",
  hero_url: "",
};

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default function CategoryStudioPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoading: authLoading } = useAuth();
  const editSlug = searchParams.get("edit");

  const [step, setStep] = useState("details");
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const notifTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [articleSearch, setArticleSearch] = useState("");
  const [allArticles, setAllArticles] = useState<ArticleRow[]>([]);

  const showNotification = useCallback((type: "success" | "error", message: string) => {
    if (notifTimer.current) clearTimeout(notifTimer.current);
    setNotification({ type, message });
    notifTimer.current = setTimeout(() => setNotification(null), 3500);
  }, []);

  useEffect(() => {
    return () => {
      if (notifTimer.current) clearTimeout(notifTimer.current);
    };
  }, []);

  // Load existing category for editing
  useEffect(() => {
    if (authLoading || !editSlug) return;
    fetchCategories().then((cats) => {
      const cat = cats.find((c) => c.slug === editSlug);
      if (cat) {
        setEditingId(cat.id);
        setForm({
          name: cat.name,
          slug: cat.slug,
          description: cat.description || "",
          icon: cat.icon || "Folder",
          visible: cat.visible,
          sort_order: cat.sort_order || 0,
          seo_title: "",
          seo_description: "",
          image_url: "",
          hero_url: "",
        });
      }
    });
  }, [authLoading, editSlug]);

  // Load articles for this category
  useEffect(() => {
    if (authLoading || !editSlug) return;
    supabase
      .from("articles")
      .select("*")
      .eq("category_slug", editSlug)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setAllArticles((data as ArticleRow[]) || []);
      });
  }, [authLoading, editSlug]);

  const updateForm = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const record = {
      name: form.name,
      slug: form.slug,
      description: form.description,
      icon: form.icon,
      visible: form.visible,
      sort_order: form.sort_order,
    };

    const { error } = editingId
      ? await supabase.from("categories").update(record).eq("id", editingId)
      : await supabase.from("categories").insert(record).select();

    setSaving(false);
    if (error) throw new Error(error.message);
    invalidateCache();
  };

  const handlePublishConfirm = async (action: "publish" | "draft") => {
    await handleSave();
  };

  const handleStepChange = (newStep: string) => {
    setStep(newStep);
  };

  const toggleArticleFlag = async (id: string, field: string, value: boolean) => {
    await supabase.from("articles").update({ [field]: value }).eq("id", id);
    setAllArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  const deleteArticle = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    await supabase.from("articles").delete().eq("id", id);
    setAllArticles((prev) => prev.filter((a) => a.id !== id));
    showNotification("success", "Article deleted.");
  };

  const filteredArticles = allArticles.filter(
    (a) =>
      a.title.toLowerCase().includes(articleSearch.toLowerCase()) ||
      a.author.toLowerCase().includes(articleSearch.toLowerCase())
  );

  const previewData = {
    name: form.name,
    slug: form.slug,
    description: form.description,
    visible: form.visible,
    image_url: form.image_url,
    article_count: allArticles.length,
  };

  const stepContent = (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -16 }}
        transition={{ duration: 0.2 }}
        className="space-y-5"
      >
        {/* ─── STEP 1: DETAILS ─── */}
        {step === "details" && (
          <>
            <div>
              <div className="section-head">Step 1 of 5</div>
              <h2 className="font-serif text-xl font-bold text-ink mt-0.5 tracking-tight">Category Details</h2>
              <p className="text-sm text-ink-faded font-sans mt-0.5">
                {editingId ? `Editing "${form.name}"` : "Create a new section for your newspaper"}
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.15em] text-ink-lighter font-semibold mb-1.5 font-sans">
                    Section Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setForm({ ...form, name, slug: editingId ? form.slug : slugify(name) });
                    }}
                    placeholder="e.g., Campus News"
                    className="w-full px-4 py-3 text-lg font-serif font-bold text-ink border border-border bg-paper focus:outline-none placeholder:text-ink-faded/40 transition-all duration-200 focus:border-gold-light/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.15em] text-ink-lighter font-semibold mb-1.5 font-sans">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => updateForm("slug", slugify(e.target.value))}
                    placeholder="campus-news"
                    className="w-full px-3 py-3 text-sm font-mono text-ink border border-border bg-paper focus:outline-none placeholder:text-ink-faded/40 transition-all duration-200 focus:border-gold-light/50"
                  />
                  <p className="text-[10px] text-ink-faded mt-1 font-sans">
                    /category/<span className="font-mono text-sepia">{form.slug || "slug"}</span>
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.15em] text-ink-lighter font-semibold mb-1.5 font-sans">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                  placeholder="A brief description of this section..."
                  className="w-full px-3 py-2 text-sm border border-border bg-paper focus:outline-none font-body placeholder:text-ink-faded/40 resize-none transition-all duration-200 focus:border-gold-light/50"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={form.visible}
                    onChange={(e) => updateForm("visible", e.target.checked)}
                    className="w-3.5 h-3.5 accent-sepia"
                  />
                  <span className="text-sm font-sans text-ink-light group-hover:text-ink transition-colors">
                    Visible in navigation
                  </span>
                </label>
              </div>
            </div>
          </>
        )}

        {/* ─── STEP 2: BANNER ─── */}
        {step === "banner" && (
          <>
            <div>
              <div className="section-head">Step 2 of 5</div>
              <h2 className="font-serif text-xl font-bold text-ink mt-0.5 tracking-tight">Banner &amp; Hero Image</h2>
              <p className="text-sm text-ink-faded font-sans mt-0.5">Set section banner and hero imagery for the category page header.</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.15em] text-ink-lighter font-semibold mb-1.5 font-sans">
                  Section Banner Image
                </label>
                <div className="border-2 border-dashed border-border hover:border-gold-light hover:bg-paper-dark/50 transition-all p-8 text-center cursor-pointer"
                  onClick={() => {
                    const url = prompt("Paste image URL for the section banner:");
                    if (url) updateForm("image_url", url);
                  }}
                >
                  {form.image_url ? (
                    <div className="relative group">
                      <div className="aspect-[21/9] border border-border overflow-hidden bg-paper-dark">
                        <img src={form.image_url} alt="Banner" loading="lazy" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <button onClick={(e) => { e.stopPropagation(); updateForm("image_url", ""); }}
                            className="px-3 py-1.5 bg-red-500/80 text-white text-[10px] uppercase tracking-wider font-sans font-semibold">
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center">
                        <svg className="w-5 h-5 text-ink-faded" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                        </svg>
                      </div>
                      <p className="text-sm font-sans text-ink-light"><span className="font-semibold text-ink">Click to add</span> banner image URL</p>
                      <p className="text-[11px] text-ink-faded font-sans">21:9 ratio recommended</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.15em] text-ink-lighter font-semibold mb-1.5 font-sans">
                  Hero Image (optional)
                </label>
                <div className="border-2 border-dashed border-border hover:border-gold-light hover:bg-paper-dark/50 transition-all p-8 text-center cursor-pointer"
                  onClick={() => {
                    const url = prompt("Paste hero image URL:");
                    if (url) updateForm("hero_url", url);
                  }}
                >
                  {form.hero_url ? (
                    <div className="relative group">
                      <div className="aspect-video border border-border overflow-hidden bg-paper-dark">
                        <img src={form.hero_url} alt="Hero" loading="lazy" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <button onClick={(e) => { e.stopPropagation(); updateForm("hero_url", ""); }}
                            className="px-3 py-1.5 bg-red-500/80 text-white text-[10px] uppercase tracking-wider font-sans font-semibold">
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center">
                        <svg className="w-5 h-5 text-ink-faded" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                        </svg>
                      </div>
                      <p className="text-sm font-sans text-ink-light"><span className="font-semibold text-ink">Click to add</span> hero image URL</p>
                      <p className="text-[11px] text-ink-faded font-sans">16:9 ratio recommended</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ─── STEP 3: SETTINGS ─── */}
        {step === "settings" && (
          <>
            <div>
              <div className="section-head">Step 3 of 5</div>
              <h2 className="font-serif text-xl font-bold text-ink mt-0.5 tracking-tight">Category Settings</h2>
              <p className="text-sm text-ink-faded font-sans mt-0.5">SEO metadata and advanced section configuration.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.15em] text-ink-lighter font-semibold mb-1.5 font-sans">
                  Custom Meta Title
                </label>
                <input
                  type="text"
                  value={form.seo_title}
                  onChange={(e) => updateForm("seo_title", e.target.value)}
                  placeholder={`${form.name || "Section Name"} — WCCBM TIMELINE`}
                  className="w-full px-3 py-2 text-sm border border-border bg-paper focus:outline-none font-body placeholder:text-ink-faded/40 transition-all duration-200 focus:border-gold-light/50"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.15em] text-ink-lighter font-semibold mb-1.5 font-sans">
                  SEO Meta Description
                </label>
                <textarea
                  rows={2}
                  value={form.seo_description}
                  onChange={(e) => updateForm("seo_description", e.target.value)}
                  placeholder={form.description || "A short description for search engines..."}
                  className="w-full px-3 py-2 text-sm border border-border bg-paper focus:outline-none font-body placeholder:text-ink-faded/40 resize-none transition-all duration-200 focus:border-gold-light/50"
                />
                <p className="text-[10px] text-ink-faded mt-1 font-sans">
                  {form.seo_description.length} / 160 characters
                  {form.seo_description.length > 160 && (
                    <span className="text-amber-600 ml-1">(recommended max 160)</span>
                  )}
                </p>
              </div>

              <div className="pt-2">
                <p className="text-[10px] uppercase tracking-[0.15em] text-ink-lighter font-semibold mb-2 font-sans">
                  Visibility &amp; Promotion
                </p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={form.visible}
                      onChange={(e) => updateForm("visible", e.target.checked)}
                      className="w-3.5 h-3.5 accent-sepia"
                    />
                    <span className="text-sm font-sans text-ink-light group-hover:text-ink transition-colors">
                      Show in Navigation
                    </span>
                    <span className="text-[10px] text-ink-faded font-sans ml-auto">
                      Appears in navbar and footer
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ─── STEP 4: MANAGE ARTICLES ─── */}
        {step === "articles" && (
          <>
            <div>
              <div className="section-head">Step 4 of 5</div>
              <h2 className="font-serif text-xl font-bold text-ink mt-0.5 tracking-tight">Manage Articles</h2>
              <p className="text-sm text-ink-faded font-sans mt-0.5">
                {editingId
                  ? `Manage all articles in "${form.name}" section`
                  : "Save the category first to manage articles"}
              </p>
            </div>

            {!editingId ? (
              <div className="border-2 border-dashed border-border p-10 text-center">
                <p className="text-sm text-ink-faded font-sans">
                  Complete the previous steps and publish this category to start managing articles.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Search + New Article */}
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                  <div className="relative flex-1 max-w-xs w-full">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-faded" />
                    <input type="text" value={articleSearch} onChange={(e) => setArticleSearch(e.target.value)}
                      placeholder="Search articles in this section..."
                      className="w-full pl-8 pr-3 py-1.5 text-sm border border-border bg-paper focus:outline-none font-sans placeholder:text-ink-faded" />
                  </div>
                  <a href="/admin/studio"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-ink text-paper text-[10px] uppercase tracking-wider font-sans font-semibold hover:bg-ink-light transition-colors shrink-0">
                    <Plus className="w-3.5 h-3.5" /> New Article
                  </a>
                </div>

                {/* Article count */}
                <p className="text-[11px] text-ink-faded font-sans">
                  {allArticles.length} article{allArticles.length !== 1 ? "s" : ""} in this section
                </p>

                {/* Article list */}
                {filteredArticles.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-border">
                    <p className="text-sm text-ink-faded font-sans">
                      {articleSearch ? "No articles match your search." : "No articles in this section yet."}
                    </p>
                    {!articleSearch && (
                      <a href="/admin/studio" className="mt-2 inline-block text-sm text-sepia hover:underline font-sans">
                        Create the first article &rarr;
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredArticles.map((article) => (
                      <div key={article.id} className="flex items-center gap-3 px-3 py-2.5 border border-border hover:bg-paper-dark/30 transition-colors">
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => toggleArticleFlag(article.id, "featured", !article.featured)}
                            className={`p-1 rounded transition-colors ${article.featured ? "text-gold" : "text-ink-faded hover:text-gold"}`}
                            title="Toggle featured"
                          >
                            <Star className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => toggleArticleFlag(article.id, "trending", !article.trending)}
                            className={`p-1 rounded transition-colors ${article.trending ? "text-orange-500" : "text-ink-faded hover:text-orange-500"}`}
                            title="Toggle trending"
                          >
                            <TrendingUp className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ink truncate font-sans">{article.title}</p>
                          <p className="text-[11px] text-ink-faded font-sans">
                            {article.author} &middot; {article.published_at} &middot; {article.read_time}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 font-sans ${
                            article.is_published ? "bg-sepia/10 text-sepia-dark" : "bg-paper-dark text-ink-faded"
                          }`}>
                            {article.is_published ? "Live" : "Draft"}
                          </span>
                          <a href={`/admin/studio?edit=${article.id}`}
                            className="p-1 hover:bg-paper-dark transition-colors rounded">
                            <Pencil className="w-3 h-3 text-ink-faded" />
                          </a>
                          <button onClick={() => deleteArticle(article.id, article.title)}
                            className="p-1 hover:bg-red-50 transition-colors rounded">
                            <Trash2 className="w-3 h-3 text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ─── STEP 5: PUBLISH ─── */}
        {step === "publish" && (
          <>
            <div>
              <div className="section-head">Step 5 of 5</div>
              <h2 className="font-serif text-xl font-bold text-ink mt-0.5 tracking-tight">Publish Section</h2>
              <p className="text-sm text-ink-faded font-sans mt-0.5">
                Your section configuration is ready. Choose how to release it.
              </p>
            </div>

            {/* Summary card */}
            <div className="border border-border bg-paper-light p-4 space-y-2">
              <h3 className="font-serif font-bold text-ink text-base leading-snug">
                {form.name || "Untitled Section"}
              </h3>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-ink-faded font-sans">
                <span>/{form.slug || "slug"}</span>
                <span className={`inline-flex items-center gap-1 ${form.visible ? "text-emerald-600" : "text-zinc-400"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${form.visible ? "bg-emerald-400" : "bg-zinc-300"}`} />
                  {form.visible ? "Visible" : "Hidden"}
                </span>
                <span>{allArticles.length} article{allArticles.length !== 1 ? "s" : ""}</span>
              </div>
              {form.description && (
                <p className="text-sm text-ink-light font-body leading-relaxed line-clamp-2 border-t border-border pt-2">
                  {form.description}
                </p>
              )}
            </div>

            {/* Validation */}
            {!form.name && (
              <div className="border border-amber-200 bg-amber-50/50 px-4 py-3">
                <p className="text-[11px] text-amber-800 font-sans font-semibold flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5 shrink-0" />
                  Section name is required
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="space-y-2.5">
              <button
                onClick={async () => {
                  try {
                    await handleSave();
                    showNotification("success", editingId ? "Section updated successfully!" : "Section created successfully!");
                    invalidateCache();
                    setTimeout(() => router.push("/admin/dashboard?tab=categories"), 1500);
                  } catch (e: unknown) {
                    showNotification("error", e instanceof Error ? e.message : "Failed to save section.");
                  }
                }}
                disabled={!form.name || saving}
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
                    {editingId ? "Update Section" : "Create Section"}
                  </>
                )}
              </button>

              <button
                onClick={async () => {
                  try {
                    await handleSave();
                    showNotification("success", "Draft saved!");
                    invalidateCache();
                  } catch (e: unknown) {
                    showNotification("error", e instanceof Error ? e.message : "Failed to save.");
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
                    Save as Draft
                  </>
                )}
              </button>

              {editingId && (
                <a
                  href="/admin/dashboard?tab=categories"
                  className="block w-full text-center py-2.5 border border-border text-xs uppercase tracking-wider text-ink-faded font-sans font-semibold hover:bg-paper-dark transition-colors"
                >
                  Back to Categories
                </a>
              )}
            </div>
          </>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <button
            onClick={() => {
              const steps = ["details", "banner", "settings", "articles", "publish"];
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
              const steps = ["details", "banner", "settings", "articles", "publish"];
              const idx = steps.indexOf(step);
              if (idx < steps.length - 1) setStep(steps[idx + 1]);
            }}
            disabled={step === "publish"}
            className="px-4 py-1.5 bg-ink text-paper text-[10px] uppercase tracking-wider font-sans font-semibold hover:bg-ink-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next &rarr;
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen bg-paper flex">
      <CategoryStepIndicator currentStep={step} onStepClick={handleStepChange} />

      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-paper-light border-b border-border px-4 lg:px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-lg lg:text-xl font-bold text-ink tracking-tight">
              {editingId ? `Edit Section: ${form.name}` : "New Section"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/admin/dashboard?tab=categories"
              className="text-[10px] uppercase tracking-[0.15em] text-ink-lighter hover:text-ink font-sans font-semibold transition-colors"
            >
              Categories
            </a>
          </div>
        </header>

        {/* Split layout */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-5">
            {stepContent}
          </div>

          {/* Right: Live preview panel */}
          <aside className="w-72 lg:w-80 xl:w-88 border-l border-border bg-paper-light overflow-y-auto shrink-0 hidden lg:block">
            <div className="p-4">
              <CategoryLivePreview data={previewData} />
            </div>
          </aside>
        </div>

        {/* Notification */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className={`fixed bottom-4 right-4 z-50 px-4 py-2.5 text-sm font-sans flex items-center gap-2 shadow-lg border ${
                notification.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-red-50 text-red-800 border-red-200"
              }`}
            >
              {notification.type === "success" ? <CheckCircle className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
              {notification.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
