"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Search, Eye, EyeOff, Pencil, Trash2,
} from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { slugify, type Investigation } from "@/lib/investigations";

function showNotification(type: "success" | "error", message: string) {
  const el = document.createElement("div");
  el.className = `fixed top-4 right-4 z-50 px-4 py-2.5 text-sm font-sans flex items-center gap-2 shadow-lg border ${
    type === "success" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-red-50 text-red-800 border-red-200"
  }`;
  el.innerHTML = `${type === "success" ? `<svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>` : `<svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`} ${message}`;
  document.body.appendChild(el);
  setTimeout(() => { el.style.opacity = "0"; el.style.transition = "opacity 0.3s"; setTimeout(() => el.remove(), 300); }, 3000);
}

export default function AdminInvestigationsPage() {
  const router = useRouter();
  const { isLoading: authLoading, isAdmin } = useAuth();
  const [list, setList] = useState<Investigation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newForm, setNewForm] = useState({
    title: "",
    slug: "",
    summary: "",
    category: "",
    cover_image_url: "",
  });

  const fetchList = useCallback(() => {
    getSupabase()
      .from("investigations")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error) setList((data as Investigation[]) || []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!authLoading && isAdmin) fetchList();
  }, [authLoading, isAdmin, fetchList]);

  const handleCreate = async () => {
    if (!newForm.title) { showNotification("error", "Title is required."); return; }
    setIsCreating(true);
    const { error } = await getSupabase().from("investigations").insert({
      title: newForm.title,
      slug: newForm.slug || slugify(newForm.title),
      summary: newForm.summary || null,
      category: newForm.category || null,
      cover_image_url: newForm.cover_image_url || null,
      author_id: (await getSupabase().auth.getUser()).data.user?.id || null,
      status: "draft",
    });
    if (error) {
      showNotification("error", `Create failed: ${error.message}`);
      setIsCreating(false);
    } else {
      showNotification("success", "Investigation created.");
      setShowNew(false);
      setNewForm({ title: "", slug: "", summary: "", category: "", cover_image_url: "" });
      setIsCreating(false);
      fetchList();
    }
  };

  const handlePublish = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "published" ? "draft" : "published";
    const { error } = await getSupabase()
      .from("investigations")
      .update({
        status: newStatus,
        published_at: newStatus === "published" ? new Date().toISOString() : null,
      })
      .eq("id", id);
    if (error) showNotification("error", "Failed to update.");
    else {
      showNotification("success", `Investigation ${newStatus === "published" ? "published" : "unpublished"}.`);
      fetchList();
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete investigation "${title}"? This will also delete all pages.`)) return;
    const { error } = await getSupabase().from("investigations").delete().eq("id", id);
    if (error) showNotification("error", "Delete failed.");
    else { showNotification("success", "Investigation deleted."); fetchList(); }
  };

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-2 text-ink-faded text-sm font-sans">
          <span className="inline-block w-4 h-4 border border-ink/20 border-t-ink rounded-full animate-spin" />
          Verifying session&hellip;
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-red-600 text-sm font-sans">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  const filtered = list.filter(
    (inv) =>
      inv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.category || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-auto relative">
      <header className="bg-paper-light border-b border-border px-4 lg:px-6 py-3 flex items-center justify-between">
        <h1 className="font-serif text-xl lg:text-2xl font-bold text-ink tracking-tight">
          Investigations
        </h1>
      </header>

      <div className="p-4 lg:p-6">
        <div className="newspaper-card">
          <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-xs w-full">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-faded" />
              <input
                type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search investigations..."
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-border bg-paper focus:outline-none font-sans placeholder:text-ink-faded"
              />
            </div>
            <button onClick={() => setShowNew(!showNew)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-ink text-paper text-xs uppercase tracking-wider font-sans font-semibold hover:bg-ink-light transition-colors shrink-0">
              <Plus className="w-3.5 h-3.5" /> {showNew ? "Cancel" : "New Investigation"}
            </button>
          </div>

          {showNew && (
            <div className="border-b border-border overflow-hidden">
              <div className="p-5 bg-paper-dark/30 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] uppercase tracking-[0.15em] text-ink-lighter font-semibold mb-1 font-sans">Title</label>
                    <input type="text" value={newForm.title} onChange={(e) => {
                      const t = e.target.value;
                      setNewForm({ ...newForm, title: t, slug: slugify(t) });
                    }} placeholder="Investigation Title"
                      className="w-full px-2.5 py-1.5 text-sm border border-border bg-paper focus:outline-none font-sans" />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-[0.15em] text-ink-lighter font-semibold mb-1 font-sans">Slug</label>
                    <input type="text" value={newForm.slug} onChange={(e) => setNewForm({ ...newForm, slug: e.target.value })}
                      placeholder="investigation-slug"
                      className="w-full px-2.5 py-1.5 text-sm border border-border bg-paper focus:outline-none font-sans" />
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] uppercase tracking-[0.15em] text-ink-lighter font-semibold mb-1 font-sans">Summary</label>
                  <input type="text" value={newForm.summary} onChange={(e) => setNewForm({ ...newForm, summary: e.target.value })}
                    placeholder="Brief description"
                    className="w-full px-2.5 py-1.5 text-sm border border-border bg-paper focus:outline-none font-sans" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] uppercase tracking-[0.15em] text-ink-lighter font-semibold mb-1 font-sans">Category</label>
                    <input type="text" value={newForm.category} onChange={(e) => setNewForm({ ...newForm, category: e.target.value })}
                      placeholder="e.g. Campus Life"
                      className="w-full px-2.5 py-1.5 text-sm border border-border bg-paper focus:outline-none font-sans" />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-[0.15em] text-ink-lighter font-semibold mb-1 font-sans">Cover Image URL</label>
                    <input type="text" value={newForm.cover_image_url} onChange={(e) => setNewForm({ ...newForm, cover_image_url: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-2.5 py-1.5 text-sm border border-border bg-paper focus:outline-none font-sans" />
                  </div>
                </div>
                <button onClick={handleCreate} disabled={isCreating}
                  className="px-4 py-1.5 bg-sepia text-paper text-[10px] uppercase tracking-wider font-sans font-semibold hover:bg-sepia-dark transition-colors disabled:opacity-50">
                  {isCreating ? "Creating..." : "Create Investigation"}
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-4 py-2.5 font-semibold text-ink text-xs uppercase tracking-wider font-sans">Title</th>
                  <th className="px-4 py-2.5 font-semibold text-ink text-xs uppercase tracking-wider hidden md:table-cell font-sans">Category</th>
                  <th className="px-4 py-2.5 font-semibold text-ink text-xs uppercase tracking-wider font-sans">Status</th>
                  <th className="px-4 py-2.5 font-semibold text-ink text-xs uppercase tracking-wider font-sans">Pages</th>
                  <th className="px-4 py-2.5 font-semibold text-ink text-xs uppercase tracking-wider font-sans">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-ink-faded font-sans">Loading&hellip;</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-ink-faded font-sans">No investigations found.</td></tr>
                ) : (
                  filtered.map((inv) => (
                    <tr key={inv.id} className="border-b border-border hover:bg-paper-dark/50 transition-colors">
                      <td className="px-4 py-2.5">
                        <p className="font-medium text-ink truncate max-w-[200px] lg:max-w-xs font-body text-sm">{inv.title}</p>
                        <p className="text-[11px] text-ink-faded font-sans">/{inv.slug}</p>
                      </td>
                      <td className="px-4 py-2.5 text-ink-light hidden md:table-cell font-sans text-sm">
                        {inv.category || <span className="text-ink-faded/50">&mdash;</span>}
                      </td>
                      <td className="px-4 py-2.5">
                        <button onClick={() => handlePublish(inv.id, inv.status)}
                          className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 font-sans transition-colors cursor-pointer ${
                            inv.status === "published"
                              ? "bg-sepia/10 text-sepia-dark hover:bg-sepia/20"
                              : "bg-paper-dark text-ink-faded hover:bg-paper-dark/80"
                          }`}>
                          {inv.status === "published" ? <><Eye className="w-3 h-3" /> Published</> : <><EyeOff className="w-3 h-3" /> Draft</>}
                        </button>
                      </td>
                      <td className="px-4 py-2.5 text-ink-light font-sans text-sm">
                        <PageCountBadge investigationId={inv.id} />
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1">
                          <a href={`/admin/investigations/${inv.id}`}
                            className="p-1.5 hover:bg-paper-dark transition-colors rounded inline-flex" title="Edit Pages">
                            <Pencil className="w-3.5 h-3.5 text-ink-faded" />
                          </a>
                          <button onClick={() => handleDelete(inv.id, inv.title)}
                            className="p-1.5 hover:bg-red-50 transition-colors rounded" title="Delete">
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function PageCountBadge({ investigationId }: { investigationId: string }) {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    getSupabase()
      .from("investigation_pages")
      .select("*", { count: "exact", head: true })
      .eq("investigation_id", investigationId)
      .then(({ count: c }) => setCount(c ?? 0));
  }, [investigationId]);
  return <span>{count !== null ? count : <span className="animate-pulse">&hellip;</span>}</span>;
}
