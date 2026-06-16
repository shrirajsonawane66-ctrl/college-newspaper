"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Upload, Trash2, Check, X, GripVertical,
  ImageUp, Save, ImageIcon,
} from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import {
  slugify,
  uploadInvestigationPage,
  uploadInvestigationCover,
  deleteInvestigationPageImage,
  type Investigation,
  type InvestigationPage,
} from "@/lib/investigations";

function showNotification(type: "success" | "error", message: string) {
  const el = document.createElement("div");
  el.className = `fixed top-4 right-4 z-[100] px-4 py-2.5 text-sm font-sans flex items-center gap-2 shadow-lg border ${
    type === "success" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-red-50 text-red-800 border-red-200"
  }`;
  el.innerHTML = `${type === "success"
    ? `<svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`
    : `<svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`} ${message}`;
  document.body.appendChild(el);
  setTimeout(() => { el.style.opacity = "0"; el.style.transition = "opacity 0.3s"; setTimeout(() => el.remove(), 300); }, 3000);
}

function compressImage(file: File, maxDim = 1200, quality = 0.7): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let w = img.width;
      let h = img.height;
      if (w > maxDim || h > maxDim) {
        const ratio = Math.min(maxDim / w, maxDim / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas context unavailable")); return; }
      ctx.drawImage(img, 0, 0, w, h);
      const tryFormat = (fmt: string, q: number) =>
        new Promise<Blob>((res, rej) => {
          canvas.toBlob((b) => { if (b) res(b); else rej(null); }, fmt, q);
        });
      tryFormat("image/webp", quality)
        .catch(() => tryFormat("image/jpeg", 0.85))
        .then(resolve)
        .catch(() => reject(new Error("Compression failed")));
    };
    img.onerror = () => reject(new Error("Failed to load image for compression"));
    img.src = URL.createObjectURL(file);
  });
}

export default function AdminEditInvestigationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { isLoading: authLoading, isAdmin } = useAuth();

  const [investigation, setInvestigation] = useState<Investigation | null>(null);
  const [pages, setPages] = useState<InvestigationPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ title: "", slug: "", summary: "", category: "", cover_image_url: "" });

  const [coverUploading, setCoverUploading] = useState(false);

  const [pageUploading, setPageUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadTotal, setUploadTotal] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(0);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);

  const [editingCaption, setEditingCaption] = useState<string | null>(null);
  const [captionValue, setCaptionValue] = useState("");

  const [dirty, setDirty] = useState(false);

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    const [invRes, pagesRes] = await Promise.all([
      getSupabase().from("investigations").select("*").eq("id", id).single(),
      getSupabase()
        .from("investigation_pages")
        .select("*")
        .eq("investigation_id", id)
        .order("page_number", { ascending: true }),
    ]);
    if (invRes.error) {
      showNotification("error", "Investigation not found.");
      router.push("/admin/investigations");
      return;
    }
    const inv = invRes.data as Investigation;
    setInvestigation(inv);
    setForm({
      title: inv.title,
      slug: inv.slug,
      summary: inv.summary || "",
      category: inv.category || "",
      cover_image_url: inv.cover_image_url || "",
    });
    setPages((pagesRes.data as InvestigationPage[]) || []);
    setLoading(false);
  }, [id, router]);

  useEffect(() => {
    if (!authLoading && isAdmin) fetchData();
  }, [authLoading, isAdmin, fetchData]);

  const saveInvestigation = async () => {
    if (!form.title) { showNotification("error", "Title is required."); return; }
    setSaving(true);
    const { error } = await getSupabase()
      .from("investigations")
      .update({
        title: form.title,
        slug: form.slug || slugify(form.title),
        summary: form.summary || null,
        category: form.category || null,
        cover_image_url: form.cover_image_url || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) {
      showNotification("error", `Save failed: ${error.message}`);
    } else {
      showNotification("success", "Investigation saved.");
      setDirty(false);
    }
    setSaving(false);
  };

  const handleCoverUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) { showNotification("error", "Please select an image."); return; }
    setCoverUploading(true);
    try {
      const compressed = await compressImage(file, 800, 0.7);
      const compressedFile = new File([compressed], "cover.webp", { type: "image/webp" });
      const url = await uploadInvestigationCover(compressedFile, id);
      setForm((prev) => ({ ...prev, cover_image_url: url }));
      setDirty(true);
      showNotification("success", "Cover image uploaded.");
    } catch (err: any) {
      showNotification("error", `Cover upload failed: ${err.message}`);
    }
    setCoverUploading(false);
  };

  const handleSaveCaption = async (pageId: string) => {
    const { error } = await getSupabase()
      .from("investigation_pages")
      .update({ caption: captionValue || null })
      .eq("id", pageId);
    if (error) showNotification("error", "Failed to save caption.");
    else {
      setPages((prev) =>
        prev.map((p) => (p.id === pageId ? { ...p, caption: captionValue || null } : p))
      );
      showNotification("success", "Caption saved.");
      setEditingCaption(null);
    }
  };

  const handleDeletePage = async (page: InvestigationPage) => {
    if (!window.confirm(`Delete page ${page.page_number}?`)) return;
    await deleteInvestigationPageImage(id, page.page_number);
    const { error } = await getSupabase()
      .from("investigation_pages")
      .delete()
      .eq("id", page.id);
    if (error) {
      showNotification("error", "Delete failed.");
    } else {
      showNotification("success", `Page ${page.page_number} deleted.`);
      fetchData();
    }
  };

  const handleUploadFiles = async (files: FileList) => {
    const errs: string[] = [];
    setUploadErrors([]);
    const fileArray = Array.from(files);
    const startPage = pages.length + 1;
    setUploadTotal(fileArray.length);
    setUploadComplete(0);
    setUploadProgress(0);
    setPageUploading(true);

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const pageNum = startPage + i;
      try {
        const compressed = await compressImage(file);
        const compressedFile = new File([compressed], file.name.replace(/\.[^.]+$/, ".webp"), {
          type: "image/webp",
        });
        const url = await uploadInvestigationPage(compressedFile, id, pageNum, (pct) => {
          setUploadProgress(Math.round((i * 100 + pct) / fileArray.length));
        });
        const { error } = await getSupabase().from("investigation_pages").insert({
          investigation_id: id,
          page_number: pageNum,
          image_url: url,
          caption: null,
        });
        if (error) {
          errs.push(`Page ${pageNum}: ${error.message}`);
        }
      } catch (err: any) {
        errs.push(`Page ${pageNum}: ${err.message}`);
      }
      setUploadComplete(i + 1);
      setUploadProgress(Math.round(((i + 1) / fileArray.length) * 100));
    }

    setUploadErrors(errs);
    setPageUploading(false);
    if (errs.length === 0) {
      showNotification("success", `${fileArray.length} page(s) uploaded.`);
    }
    fetchData();
  };

  const handleDragStart = (idx: number) => {
    dragItem.current = idx;
  };

  const handleDragEnter = (idx: number) => {
    dragOverItem.current = idx;
  };

  const handleDragEnd = async () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) return;

    const reordered = [...pages];
    const [moved] = reordered.splice(dragItem.current, 1);
    reordered.splice(dragOverItem.current, 0, moved);

    const updated = reordered.map((p, i) => ({ ...p, page_number: i + 1 }));
    setPages(updated);

    for (const p of updated) {
      await getSupabase()
        .from("investigation_pages")
        .update({ page_number: p.page_number })
        .eq("id", p.id);
    }

    dragItem.current = null;
    dragOverItem.current = null;
    showNotification("success", "Pages reordered.");
  };

  if (authLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-2 text-ink-faded text-sm font-sans">
          <span className="inline-block w-4 h-4 border border-ink/20 border-t-ink rounded-full animate-spin" />
          Loading&hellip;
        </div>
      </div>
    );
  }

  if (!isAdmin || !investigation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-red-600 text-sm font-sans">Access denied.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto relative">
      <header className="bg-paper-light border-b border-border px-4 lg:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/admin/investigations"
            className="p-1.5 -ml-1.5 text-ink-lighter hover:text-ink transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </a>
          <h1 className="font-serif text-xl lg:text-2xl font-bold text-ink tracking-tight">
            {investigation.title}
          </h1>
          <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 font-sans ${
            investigation.status === "published" ? "bg-sepia/10 text-sepia-dark" : "bg-paper-dark text-ink-faded"
          }`}>
            {investigation.status}
          </span>
        </div>
        <button onClick={saveInvestigation} disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-ink text-paper text-xs uppercase tracking-wider font-sans font-semibold hover:bg-ink-light transition-colors disabled:opacity-50">
          <Save className="w-3.5 h-3.5" /> {saving ? "Saving..." : "Save"}
        </button>
      </header>

      <div className="p-4 lg:p-6 space-y-6">
        <div className="newspaper-card">
          <div className="px-5 pt-4 pb-3 border-b border-border">
            <h2 className="font-serif text-lg font-bold text-ink">Details</h2>
          </div>
          <div className="p-5 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] uppercase tracking-[0.15em] text-ink-lighter font-semibold mb-1 font-sans">Title</label>
                <input type="text" value={form.title} onChange={(e) => {
                  setForm({ ...form, title: e.target.value, slug: slugify(e.target.value) });
                  setDirty(true);
                }}
                  className="w-full px-2.5 py-1.5 text-sm border border-border bg-paper focus:outline-none font-sans" />
              </div>
              <div>
                <label className="block text-[9px] uppercase tracking-[0.15em] text-ink-lighter font-semibold mb-1 font-sans">Slug</label>
                <input type="text" value={form.slug} onChange={(e) => { setForm({ ...form, slug: e.target.value }); setDirty(true); }}
                  className="w-full px-2.5 py-1.5 text-sm border border-border bg-paper focus:outline-none font-sans" />
              </div>
            </div>
            <div>
              <label className="block text-[9px] uppercase tracking-[0.15em] text-ink-lighter font-semibold mb-1 font-sans">Summary</label>
              <input type="text" value={form.summary} onChange={(e) => { setForm({ ...form, summary: e.target.value }); setDirty(true); }}
                className="w-full px-2.5 py-1.5 text-sm border border-border bg-paper focus:outline-none font-sans" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] uppercase tracking-[0.15em] text-ink-lighter font-semibold mb-1 font-sans">Category</label>
                <input type="text" value={form.category} onChange={(e) => { setForm({ ...form, category: e.target.value }); setDirty(true); }}
                  className="w-full px-2.5 py-1.5 text-sm border border-border bg-paper focus:outline-none font-sans" />
              </div>
              <div>
                <label className="block text-[9px] uppercase tracking-[0.15em] text-ink-lighter font-semibold mb-1 font-sans">Cover Image</label>
                <div className="flex gap-2">
                  {form.cover_image_url ? (
                    <div className="relative group w-full">
                      <img src={form.cover_image_url} alt="Cover"
                        className="w-full h-20 object-cover border border-border" />
                      <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex gap-1">
                          <button onClick={() => coverInputRef.current?.click()}
                            className="px-2 py-1 bg-paper/90 text-ink text-[9px] uppercase tracking-wider font-semibold hover:bg-paper transition-colors">
                            Change
                          </button>
                          <button onClick={() => { setForm({ ...form, cover_image_url: "" }); setDirty(true); }}
                            className="px-2 py-1 bg-red-500/80 text-white text-[9px] uppercase tracking-wider font-semibold hover:bg-red-500 transition-colors">
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => coverInputRef.current?.click()} disabled={coverUploading}
                      className="w-full h-20 border-2 border-dashed border-border flex items-center justify-center gap-2 text-xs text-ink-faded font-sans hover:border-gold-light hover:bg-paper-dark/50 transition-all disabled:opacity-50">
                      {coverUploading ? (
                        <span className="inline-block w-4 h-4 border border-ink/20 border-t-ink rounded-full animate-spin" />
                      ) : (
                        <><ImageIcon className="w-4 h-4" /> Upload Cover</>
                      )}
                    </button>
                  )}
                  <input ref={coverInputRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCoverUpload(f); }} />
                </div>
              </div>
            </div>
            {dirty && (
              <p className="text-[10px] text-amber-600 font-sans">Unsaved changes &mdash; click Save above.</p>
            )}
          </div>
        </div>

        <div className="newspaper-card">
          <div className="px-5 pt-4 pb-3 border-b border-border flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-ink">
              Pages <span className="text-ink-faded text-base font-sans font-normal ml-1">({pages.length})</span>
            </h2>
            <div className="flex items-center gap-2">
              <button onClick={() => fileInputRef.current?.click()} disabled={pageUploading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-ink text-paper text-xs uppercase tracking-wider font-sans font-semibold hover:bg-ink-light transition-colors disabled:opacity-50">
                <ImageUp className="w-3.5 h-3.5" /> Add Pages
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files && handleUploadFiles(e.target.files)}
              />
            </div>
          </div>

          {pageUploading && (
            <div className="px-5 py-4 border-b border-border bg-paper-dark/30">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-ink-faded font-sans">
                  Uploading {uploadComplete}/{uploadTotal} pages&hellip;
                </span>
                <span className="text-xs text-ink-faded font-sans">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden">
                <div className="h-full bg-gold rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}

          {uploadErrors.length > 0 && (
            <div className="px-5 py-3 border-b border-border">
              {uploadErrors.map((err, i) => (
                <p key={i} className="text-xs text-red-600 font-sans flex items-center gap-1">
                  <X className="w-3 h-3 shrink-0" /> {err}
                </p>
              ))}
            </div>
          )}

          <div className="p-5">
            {pages.length === 0 && !pageUploading && (
              <div
                className="border-2 border-dashed border-border p-8 text-center cursor-pointer hover:border-gold-light hover:bg-paper-dark/50 transition-all"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 mx-auto text-ink-faded/50 mb-2" />
                <p className="text-sm text-ink-light font-sans">
                  <span className="font-semibold text-ink">Click to upload</span> or drag and drop
                </p>
                <p className="text-[11px] text-ink-faded mt-1 font-sans">
                  Images will be compressed to WebP &mdash; ordered by file selection
                </p>
              </div>
            )}

            {pages.length > 0 && (
              <div className="space-y-2">
                {pages.map((page, idx) => (
                  <div
                    key={page.id}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragEnter={() => handleDragEnter(idx)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    className="flex items-start gap-3 p-3 border border-border bg-paper-dark/20 hover:bg-paper-dark/40 transition-colors group"
                  >
                    <div className="mt-1 cursor-grab active:cursor-grabbing text-ink-faded/30 hover:text-ink-faded transition-colors">
                      <GripVertical className="w-4 h-4" />
                    </div>

                    <div className="w-20 h-28 shrink-0 border border-border overflow-hidden bg-paper">
                      <img
                        src={page.image_url}
                        alt={`Page ${page.page_number}`}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-ink font-sans">Page {page.page_number}</span>
                        <span className="text-[10px] text-ink-faded font-sans">{page.image_url.split(".").pop()}.</span>
                      </div>

                      {editingCaption === page.id ? (
                        <div className="flex gap-1">
                          <input
                            type="text" value={captionValue}
                            onChange={(e) => setCaptionValue(e.target.value)}
                            placeholder="Add a caption..."
                            className="flex-1 px-2 py-1 text-xs border border-border bg-paper focus:outline-none font-sans"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveCaption(page.id);
                              if (e.key === "Escape") setEditingCaption(null);
                            }}
                          />
                          <button onClick={() => handleSaveCaption(page.id)}
                            className="p-1 hover:bg-emerald-50 transition-colors rounded">
                            <Check className="w-3 h-3 text-emerald-600" />
                          </button>
                          <button onClick={() => setEditingCaption(null)}
                            className="p-1 hover:bg-red-50 transition-colors rounded">
                            <X className="w-3 h-3 text-red-400" />
                          </button>
                        </div>
                      ) : (
                        <p
                          onClick={() => { setEditingCaption(page.id); setCaptionValue(page.caption || ""); }}
                          className="text-xs text-ink-light font-sans cursor-text hover:bg-paper-dark/50 px-2 py-1 rounded -mx-2 transition-colors"
                        >
                          {page.caption || <span className="text-ink-faded/50 italic">Click to add caption&hellip;</span>}
                        </p>
                      )}
                    </div>

                    <button onClick={() => handleDeletePage(page)}
                      className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all rounded shrink-0" title="Delete page">
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
