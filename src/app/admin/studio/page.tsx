"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save, CheckCircle, XCircle, Eye, EyeOff,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import StepIndicator from "@/components/admin/StepIndicator";
import ThumbnailUploader from "@/components/admin/ThumbnailUploader";
import LivePreview from "@/components/admin/LivePreview";
import PublishModal from "@/components/admin/PublishModal";

const CATEGORIES = ["Campus News", "Announcements", "Events", "Publicity"];

const emptyForm = {
  title: "",
  summary: "",
  content: "",
  category: "Campus News",
  author: "",
  author_role: "Staff Reporter",
  image_url: "",
  tags: "",
  seo_description: "",
  featured: false,
  trending: false,
  editor_pick: false,
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
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const dirtyRef = useRef(false);
  const lastSavedRef = useRef("");

  const showNotification = useCallback((type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  }, []);

  // Load editing article from query param
  useEffect(() => {
    if (authLoading) return;
    const params = new URLSearchParams(window.location.search);
    const editId = params.get("edit");
    if (editId) {
      setEditingId(editId);
      supabase.from("articles").select("*").eq("id", editId).single().then(({ data, error }) => {
        if (data && !error) {
          setForm({
            title: data.title || "",
            summary: data.summary || "",
            content: data.content || "",
            category: data.category || "Campus News",
            author: data.author || "",
            author_role: data.author_role || "Staff Reporter",
            image_url: data.image_url || "",
            tags: data.tags || "",
            seo_description: data.seo_description || "",
            featured: data.featured || false,
            trending: data.trending || false,
            editor_pick: data.editor_pick || false,
          });
          lastSavedRef.current = JSON.stringify(form);
        }
      });
    }
  }, [authLoading]);

  // Track dirty state
  const formString = JSON.stringify(form);
  useEffect(() => {
    dirtyRef.current = formString !== lastSavedRef.current;
  }, [formString]);

  // Auto-save
  useEffect(() => {
    if (autoSaveTimer.current) clearInterval(autoSaveTimer.current);
    autoSaveTimer.current = setInterval(() => {
      if (!dirtyRef.current) return;
      if (!form.title || !form.author) return;

      setAutoSaveStatus("saving");
      const record = {
        title: form.title,
        summary: form.summary,
        content: form.content,
        category: form.category,
        category_slug: slugify(form.category),
        author: form.author,
        author_role: form.author_role,
        image_url: form.image_url,
        tags: form.tags,
        seo_description: form.seo_description,
        featured: form.featured,
        trending: form.trending,
        editor_pick: form.editor_pick,
        published_at: new Date().toISOString(),
        is_published: false,
        is_new: false,
        read_time: calcReadTime(form.content),
      };

      (async () => {
        const { error } = editingId
          ? await supabase.from("articles").update(record).eq("id", editingId)
          : await supabase.from("articles").insert(record).select();

        if (!error) {
          lastSavedRef.current = JSON.stringify(form);
          dirtyRef.current = false;
          setAutoSaveStatus("saved");
          setTimeout(() => setAutoSaveStatus("idle"), 2500);
        } else {
          setAutoSaveStatus("error");
        }
      })();
    }, 15000);

    return () => {
      if (autoSaveTimer.current) clearInterval(autoSaveTimer.current);
    };
  }, [form, editingId]);

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

  const updateForm = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (isPublished: boolean) => {
    setSaving(true);
    const record = {
      title: form.title,
      summary: form.summary,
      content: form.content,
      category: form.category,
      category_slug: slugify(form.category),
      author: form.author,
      author_role: form.author_role,
      image_url: form.image_url,
      tags: form.tags,
      seo_description: form.seo_description,
      featured: form.featured,
      trending: form.trending,
      editor_pick: form.editor_pick,
      published_at: new Date().toISOString(),
      is_published: isPublished,
      is_new: isPublished,
      read_time: calcReadTime(form.content),
    };

    const { error } = editingId
      ? await supabase.from("articles").update(record).eq("id", editingId)
      : await supabase.from("articles").insert(record).select();

    setSaving(false);

    if (error) {
      throw new Error(error.message);
    } else {
      lastSavedRef.current = JSON.stringify(form);
      dirtyRef.current = false;
    }
  };

  const handlePublishConfirm = async (action: "publish" | "draft") => {
    await handleSave(action === "publish");
  };

  const handleStepChange = (newStep: string) => {
    setStep(newStep);
  };

  const contentStats = {
    words: form.content ? form.content.split(/\s+/).filter(Boolean).length : 0,
    chars: form.content ? form.content.length : 0,
  };

  const previewData = {
    title: form.title,
    summary: form.summary,
    content: form.content,
    category: form.category,
    categorySlug: slugify(form.category),
    author: form.author,
    authorRole: form.author_role,
    imageUrl: form.image_url,
    publishedAt: new Date().toISOString().split("T")[0],
    readTime: calcReadTime(form.content),
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
              <h2 className="font-serif text-xl font-bold text-ink mt-0.5 tracking-tight">Article Details</h2>
              <p className="text-sm text-ink-faded font-body mt-0.5">Write your article headline, summary, and full content.</p>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.15em] text-ink-lighter font-semibold mb-1.5 font-body">
                  Headline <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => updateForm("title", e.target.value)}
                  placeholder="Enter a compelling headline for your article..."
                  required
                  className="w-full px-4 py-3 text-lg font-serif font-bold text-ink border border-border bg-paper focus:outline-none placeholder:text-ink-faded/40 transition-all duration-200 focus:border-gold-light/50"
                />
              </div>

              {/* Summary */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.15em] text-ink-lighter font-semibold mb-1.5 font-body">
                  Summary <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={2}
                  value={form.summary}
                  onChange={(e) => updateForm("summary", e.target.value)}
                  placeholder="A brief summary that appears in article cards and previews..."
                  required
                  className="w-full px-3 py-2 text-sm border border-border bg-paper focus:outline-none font-body placeholder:text-ink-faded/40 resize-none transition-all duration-200 focus:border-gold-light/50"
                />
              </div>

              {/* Content */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[10px] uppercase tracking-[0.15em] text-ink-lighter font-semibold font-body">
                    Content (HTML supported)
                  </label>
                  <span className="text-[10px] text-ink-faded font-body">
                    {contentStats.words} words &middot; {contentStats.chars} characters
                  </span>
                </div>
                <textarea
                  rows={14}
                  value={form.content}
                  onChange={(e) => updateForm("content", e.target.value)}
                  placeholder="Write your full article content here. HTML tags like &lt;p&gt;, &lt;h2&gt;, &lt;strong&gt; are supported for formatting.&#10;&#10;Start writing to see a live preview update in real-time..."
                  className="w-full px-3 py-3 text-sm border border-border bg-paper focus:outline-none font-body placeholder:text-ink-faded/40 transition-all duration-200 focus:border-gold-light/50 resize-none leading-relaxed"
                />
              </div>

              {/* Author row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.15em] text-ink-lighter font-semibold mb-1.5 font-body">
                    Author <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.author}
                    onChange={(e) => updateForm("author", e.target.value)}
                    placeholder="Author name"
                    required
                    className="w-full px-3 py-2 text-sm border border-border bg-paper focus:outline-none font-body placeholder:text-ink-faded/40 transition-all duration-200 focus:border-gold-light/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.15em] text-ink-lighter font-semibold mb-1.5 font-body">
                    Author Role
                  </label>
                  <input
                    type="text"
                    value={form.author_role}
                    onChange={(e) => updateForm("author_role", e.target.value)}
                    placeholder="Staff Reporter"
                    className="w-full px-3 py-2 text-sm border border-border bg-paper focus:outline-none font-body placeholder:text-ink-faded/40 transition-all duration-200 focus:border-gold-light/50"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.15em] text-ink-lighter font-semibold mb-1.5 font-body">
                  Category <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.category}
                  onChange={(e) => updateForm("category", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-border bg-paper focus:outline-none font-body transition-all duration-200 focus:border-gold-light/50"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}

        {/* ─── STEP 2: THUMBNAIL ─── */}
        {step === "thumbnail" && (
          <>
            <div>
              <div className="section-head">Step 2 of 5</div>
              <h2 className="font-serif text-xl font-bold text-ink mt-0.5 tracking-tight">Thumbnail Image</h2>
              <p className="text-sm text-ink-faded font-body mt-0.5">Upload a banner image or paste a URL. 16:9 ratio recommended.</p>
            </div>

            <ThumbnailUploader
              value={form.image_url}
              onChange={(url) => updateForm("image_url", url)}
            />
          </>
        )}

        {/* ─── STEP 3: SETTINGS ─── */}
        {step === "settings" && (
          <>
            <div>
              <div className="section-head">Step 3 of 5</div>
              <h2 className="font-serif text-xl font-bold text-ink mt-0.5 tracking-tight">Article Settings</h2>
              <p className="text-sm text-ink-faded font-body mt-0.5">Set SEO metadata, tags, and visibility options.</p>
            </div>

            <div className="space-y-4">
              {/* SEO Description */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.15em] text-ink-lighter font-semibold mb-1.5 font-body">
                  SEO Meta Description
                </label>
                <textarea
                  rows={2}
                  value={form.seo_description}
                  onChange={(e) => updateForm("seo_description", e.target.value)}
                  placeholder="A short description for search engines (recommended: 150-160 characters)"
                  className="w-full px-3 py-2 text-sm border border-border bg-paper focus:outline-none font-body placeholder:text-ink-faded/40 resize-none transition-all duration-200 focus:border-gold-light/50"
                />
                <p className="text-[10px] text-ink-faded mt-1 font-body">
                  {form.seo_description.length} / 160 characters
                  {form.seo_description.length > 160 && (
                    <span className="text-amber-600 ml-1">(recommended max 160)</span>
                  )}
                </p>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.15em] text-ink-lighter font-semibold mb-1.5 font-body">
                  Tags
                </label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => updateForm("tags", e.target.value)}
                  placeholder="campus, news, events, achievements (comma-separated)"
                  className="w-full px-3 py-2 text-sm border border-border bg-paper focus:outline-none font-body placeholder:text-ink-faded/40 transition-all duration-200 focus:border-gold-light/50"
                />
                <p className="text-[10px] text-ink-faded mt-1 font-body">
                  Separate tags with commas
                </p>
              </div>

              {/* Visibility Toggles */}
              <div className="pt-2">
                <p className="text-[10px] uppercase tracking-[0.15em] text-ink-lighter font-semibold mb-2 font-body">
                  Visibility &amp; Promotion
                </p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) => updateForm("featured", e.target.checked)}
                      className="w-3.5 h-3.5 accent-sepia"
                    />
                    <span className="text-sm font-body text-ink-light group-hover:text-ink transition-colors">
                      Featured Article
                    </span>
                    <span className="text-[10px] text-ink-faded font-body ml-auto">
                      Appears in featured section
                    </span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={form.trending}
                      onChange={(e) => updateForm("trending", e.target.checked)}
                      className="w-3.5 h-3.5 accent-sepia"
                    />
                    <span className="text-sm font-body text-ink-light group-hover:text-ink transition-colors">
                      Trending
                    </span>
                    <span className="text-[10px] text-ink-faded font-body ml-auto">
                      Shows in trending sidebar
                    </span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={form.editor_pick}
                      onChange={(e) => updateForm("editor_pick", e.target.checked)}
                      className="w-3.5 h-3.5 accent-sepia"
                    />
                    <span className="text-sm font-body text-ink-light group-hover:text-ink transition-colors">
                      Editor&apos;s Pick
                    </span>
                    <span className="text-[10px] text-ink-faded font-body ml-auto">
                      Highlighted in editor pick section
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ─── STEP 4: PREVIEW ─── */}
        {step === "preview" && (
          <>
            <div>
              <div className="section-head">Step 4 of 5</div>
              <h2 className="font-serif text-xl font-bold text-ink mt-0.5 tracking-tight">Article Preview</h2>
              <p className="text-sm text-ink-faded font-body mt-0.5">
                See exactly how your article will appear to readers.
              </p>
            </div>

            <div className="border-2 border-ink/15 bg-paper-dark overflow-hidden">
              {/* Newspaper-style preview header */}
              <div className="px-4 sm:px-6 pt-4 pb-2 text-center border-b border-border">
                <p className="text-[9px] uppercase tracking-[0.2em] text-ink-faded font-body font-semibold">
                  WCCBM TIMELINE &mdash; Article Preview
                </p>
                <div className="newspaper-rule-thick max-w-[60px] mx-auto mt-1" />
              </div>

              <div className="px-4 sm:px-6 py-4">
                {/* Category badge */}
                {form.category && (
                  <div className="inline-block bg-paper-dark border border-border text-ink text-[9px] uppercase tracking-[0.15em] px-2 py-0.5 font-body font-semibold mb-2">
                    {form.category}
                  </div>
                )}

                {/* Headline */}
                <h1 className="font-serif font-bold text-ink text-xl sm:text-2xl md:text-3xl leading-tight tracking-tight mt-1">
                  {form.title || (
                    <span className="text-ink-faded/30 italic font-normal text-lg">Article headline&hellip;</span>
                  )}
                </h1>

                {/* Byline */}
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

                {/* Thumbnail */}
                {form.image_url && (
                  <div className="mt-4 aspect-[16/9] border border-border overflow-hidden bg-paper-dark">
                    <img
                      src={form.image_url}
                      alt="Article banner"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}

                {/* Summary */}
                {form.summary && (
                  <p className="mt-4 text-sm text-ink-light font-body leading-relaxed italic border-l-2 border-gold/30 pl-3">
                    {form.summary}
                  </p>
                )}

                {/* Content */}
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

        {/* ─── STEP 5: PUBLISH ─── */}
        {step === "publish" && (
          <>
            <div>
              <div className="section-head">Step 5 of 5</div>
              <h2 className="font-serif text-xl font-bold text-ink mt-0.5 tracking-tight">Publish Article</h2>
              <p className="text-sm text-ink-faded font-body mt-0.5">
                Your article is ready. Choose how you want to release it.
              </p>
            </div>

            {/* Article summary card */}
            <div className="border border-border bg-paper-light p-4 space-y-2">
              <h3 className="font-serif font-bold text-ink text-base leading-snug">
                {form.title || "Untitled Article"}
              </h3>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-ink-faded font-body">
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

            {/* Validation */}
            {(!form.title || !form.author || !form.content) && (
              <div className="border border-amber-200 bg-amber-50/50 px-4 py-3">
                <p className="text-[11px] text-amber-800 font-body font-semibold flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5 shrink-0" />
                  Required fields missing
                </p>
                <ul className="mt-1 text-[11px] text-amber-700 font-body list-disc list-inside space-y-0.5">
                  {!form.title && <li>Headline is required</li>}
                  {!form.author && <li>Author is required</li>}
                  {!form.content && <li>Content is required</li>}
                </ul>
              </div>
            )}

            {/* Action buttons */}
            <div className="space-y-2.5">
              <button
                onClick={() => setPublishModalOpen(true)}
                disabled={!form.title || !form.author || !form.content || saving}
                className="w-full py-3 bg-gold text-paper text-sm uppercase tracking-wider font-body font-bold hover:bg-gold/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
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
                  } catch (e: any) {
                    showNotification("error", e.message || "Failed to save draft.");
                  }
                }}
                disabled={saving}
                className="w-full py-2.5 border border-border text-xs uppercase tracking-wider text-ink-light font-body font-semibold hover:bg-paper-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                  className="block w-full text-center py-2.5 border border-border text-xs uppercase tracking-wider text-ink-faded font-body font-semibold hover:bg-paper-dark transition-colors"
                >
                  Back to Dashboard
                </a>
              )}
            </div>
          </>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <button
            onClick={() => {
              const steps = ["details", "thumbnail", "settings", "preview", "publish"];
              const idx = steps.indexOf(step);
              if (idx > 0) setStep(steps[idx - 1]);
            }}
            disabled={step === "details"}
            className="px-3 py-1.5 border border-border text-[10px] uppercase tracking-wider text-ink-light font-body font-semibold hover:bg-paper-dark transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
            className="px-4 py-1.5 bg-ink text-paper text-[10px] uppercase tracking-wider font-body font-semibold hover:bg-ink-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next &rarr;
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen bg-paper flex">
      {/* Left sidebar — StepIndicator */}
      <StepIndicator currentStep={step} onStepClick={handleStepChange} />

      {/* Main content area + right panel */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-paper-light border-b border-border px-4 lg:px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-lg lg:text-xl font-bold text-ink tracking-tight">
              {editingId ? "Edit Article" : "New Article"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Auto-save status */}
            <div className="flex items-center gap-1.5 text-[10px] font-body">
              {autoSaveStatus === "saving" && (
                <span className="text-ink-faded flex items-center gap-1">
                  <span className="inline-block w-2.5 h-2.5 border border-ink/20 border-t-ink rounded-full animate-spin" />
                  Saving&hellip;
                </span>
              )}
              {autoSaveStatus === "saved" && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-emerald-600 flex items-center gap-1"
                >
                  <CheckCircle className="w-3 h-3" />
                  Saved
                </motion.span>
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
              className="text-[10px] uppercase tracking-[0.15em] text-ink-lighter hover:text-ink font-body font-semibold transition-colors"
            >
              Dashboard
            </a>
          </div>
        </header>

        {/* Split layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Step content */}
          <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-5">
            {stepContent}
          </div>

          {/* Right: Live preview panel */}
          <aside className="w-72 lg:w-80 xl:w-88 border-l border-border bg-paper-light overflow-y-auto shrink-0 hidden lg:block">
            <div className="p-4">
              <LivePreview data={previewData} articleId={editingId || "preview"} />
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
              className={`absolute bottom-4 right-4 z-20 px-4 py-2.5 text-sm font-body flex items-center gap-2 shadow-lg border ${
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

      {/* Publish Modal */}
      <PublishModal
        open={publishModalOpen}
        onClose={() => {
          setPublishModalOpen(false);
          if (!editingId) {
            // After publish, go back to dashboard
            // We let user manually navigate
          }
        }}
        onConfirm={handlePublishConfirm}
        title={form.title || "Untitled Article"}
      />
    </div>
  );
}
