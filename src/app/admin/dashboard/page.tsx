"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileText, Eye, EyeOff, Pencil, Trash2,
  Plus, Search, CheckCircle, XCircle,
  Newspaper, MessageSquare, Check, X,
  FolderTree, ChevronUp, ChevronDown, MailQuestion, Clock,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { fetchCategories, invalidateCache, type CategoryItem } from "@/lib/categories";
import AnalyticsCard from "@/components/ui/AnalyticsCard";
import { useAuth } from "@/hooks/useAuth";

type Tab = "overview" | "articles" | "comments" | "categories" | "contacts";

interface ArticleRow {
  id: string; title: string; subheadline: string; summary: string; content: string;
  category: string; category_slug: string; author: string; author_role: string;
  image_url: string; thumbnail_url: string; cover_image: string; image_caption: string; image_credit: string;
  published_at: string; is_published: boolean; featured: boolean; trending: boolean;
  editor_pick: boolean; drop_cap: boolean; read_time: string; is_new: boolean; tags: string;
}

interface CommentRow {
  id: string; article_id: string; author_name: string; content: string; created_at: string;
}

interface ContactMessageRow {
  id: string; name: string; email: string; subject: string; message: string;
  status: "unread" | "read" | "archived"; created_at: string;
}

const tabs: Tab[] = ["overview", "articles", "comments", "contacts", "categories"];

function slugify(s: string) { return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""); }

function showNotification(type: "success" | "error", message: string) {
  const el = document.createElement("div");
  el.className = `fixed top-4 right-4 z-50 px-4 py-2.5 text-sm font-sans flex items-center gap-2 shadow-lg border ${
    type === "success" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-red-50 text-red-800 border-red-200"
  }`;
  el.innerHTML = `${type === "success" ? `<svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>` : `<svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`} ${message}`;
  document.body.appendChild(el);
  setTimeout(() => { el.style.opacity = "0"; el.style.transition = "opacity 0.3s"; setTimeout(() => el.remove(), 300); }, 3000);
}

export default function AdminDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoading: authLoading, user } = useAuth();
  const initialTab = (searchParams.get("tab") as Tab) || "overview";
  const [tab, setTab] = useState<Tab>(initialTab);
  const [searchTerm, setSearchTerm] = useState("");

  const updateTab = (t: Tab) => {
    setTab(t);
    setSearchTerm("");
    const url = new URL(window.location.href);
    if (t === "overview") url.searchParams.delete("tab");
    else url.searchParams.set("tab", t);
    window.history.replaceState({}, "", url.toString());
  };

  if (authLoading) return (
    <div className="min-h-screen bg-paper flex items-center justify-center">
      <div className="flex items-center gap-2 text-ink-faded text-sm font-sans">
        <span className="inline-block w-4 h-4 border border-ink/20 border-t-ink rounded-full animate-spin" />
        Verifying session&hellip;
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-auto relative">
      <header className="bg-paper-light border-b border-border px-4 lg:px-6 py-3 flex items-center justify-between">
        <h1 className="font-serif text-xl lg:text-2xl font-bold text-ink capitalize tracking-tight">
          {tab === "overview" ? "Dashboard" : tab.replace("contacts", "Contact Requests")}
        </h1>
      </header>

      <div className="border-b border-border bg-paper-light px-4 lg:px-6 overflow-x-auto">
        <div className="flex gap-6 min-w-max">
          {tabs.map((t) => (
            <button key={t} onClick={() => updateTab(t)}
              className={`py-3 text-xs uppercase tracking-[0.18em] font-semibold border-b-2 transition-colors font-sans whitespace-nowrap ${
                tab === t ? "border-ink text-ink" : "border-transparent text-ink-lighter hover:text-ink"
              }`}
            >
              {t === "overview" ? "Dashboard" : t === "articles" ? "All Articles" : t === "comments" ? "Comments" : t === "contacts" ? "Contact Requests" : "Categories"}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 lg:p-6">
        {tab === "overview" && <OverviewTab />}
        {tab === "articles" && <ArticlesTab searchTerm={searchTerm} setSearchTerm={setSearchTerm} />}
        {tab === "comments" && <CommentsTab searchTerm={searchTerm} setSearchTerm={setSearchTerm} />}
        {tab === "contacts" && <ContactsTab />}
        {tab === "categories" && <CategoriesTab />}
      </div>
    </div>
  );
}

function OverviewTab() {
  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsCount, setCommentsCount] = useState(0);
  const [messagesCount, setMessagesCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [categoriesList, setCategoriesList] = useState<CategoryItem[]>([]);
  const [catsLoading, setCatsLoading] = useState(true);

  useEffect(() => {
    supabase.from("articles").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setArticles(data as ArticleRow[] || []); setLoading(false); });
    supabase.from("comments").select("*", { count: "exact", head: true })
      .then(({ count }) => { if (count !== null) setCommentsCount(count); });
    supabase.from("contact_messages").select("*", { count: "exact", head: true })
      .then(({ count }) => { if (count !== null) setMessagesCount(count); });
    supabase.from("contact_messages").select("*", { count: "exact", head: true }).eq("status", "unread")
      .then(({ count }) => { if (count !== null) setUnreadCount(count); });
    fetchCategories().then((cats) => { setCategoriesList(cats); setCatsLoading(false); });
  }, []);

  const publishedCount = articles.filter((a) => a.is_published).length;
  const draftCount = articles.length - publishedCount;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard label="Published" value={String(publishedCount)} change="Live on site" icon={<FileText className="w-5 h-5" />} />
        <AnalyticsCard label="Drafts" value={String(draftCount)} change="Awaiting review" icon={<EyeOff className="w-5 h-5" />} />
        <AnalyticsCard label="Total Articles" value={String(articles.length)} change="All time" icon={<Newspaper className="w-5 h-5" />} />
        <AnalyticsCard label="Comments" value={String(commentsCount)} change="From readers" icon={<MessageSquare className="w-5 h-5" />} />
        <AnalyticsCard label="Contact Requests" value={String(messagesCount)} change={`${unreadCount} unread`} icon={<MailQuestion className="w-5 h-5" />} />
      </div>

      <div className="newspaper-card">
        <div className="px-5 pt-4 pb-3 border-b border-border flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-ink">Recent Articles</h2>
          <a href="/admin/studio"
            className="flex items-center gap-1 px-2.5 py-1 bg-ink text-paper text-[10px] uppercase tracking-wider font-sans font-semibold hover:bg-ink-light transition-colors">
            <Plus className="w-3 h-3" /> New
          </a>
        </div>
        <div className="p-5 space-y-3">
          {loading ? (
            <div className="text-center py-6 text-sm text-ink-faded font-sans">Loading&hellip;</div>
          ) : articles.length === 0 ? (
            <div className="text-center py-6 text-sm text-ink-faded font-sans">No articles yet.</div>
          ) : (
            articles.slice(0, 5).map((article) => (
              <div key={article.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink truncate font-body">{article.title}</p>
                  <p className="text-xs text-ink-faded font-body">{article.author} &middot; {article.published_at}</p>
                </div>
                <span className={`ml-3 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 font-sans ${
                  article.is_published ? "bg-sepia/10 text-sepia-dark" : "bg-paper-dark text-ink-faded"
                }`}>
                  {article.is_published ? "Published" : "Draft"}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="newspaper-card">
        <div className="px-5 pt-4 pb-3 border-b border-border flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-ink">Categories</h2>
          <span className="text-[10px] text-ink-faded font-sans">{categoriesList.length} total</span>
        </div>
        <div className="p-5">
          {catsLoading ? (
            <div className="text-center py-4 text-sm text-ink-faded font-sans">Loading&hellip;</div>
          ) : categoriesList.length === 0 ? (
            <div className="text-center py-4 text-sm text-ink-faded font-sans">No categories yet.</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categoriesList.map((cat) => (
                <span key={cat.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border text-xs font-sans text-ink-light">
                  <FolderTree className="w-3 h-3 text-sepia" />
                  {cat.name}
                  <span className={`ml-1 w-1.5 h-1.5 rounded-full ${cat.visible ? "bg-emerald-400" : "bg-zinc-300"}`} />
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ArticlesTab({ searchTerm, setSearchTerm }: { searchTerm: string; setSearchTerm: (s: string) => void }) {
  const [list, setList] = useState<ArticleRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("articles").select("*").order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error) setList(data as ArticleRow[] || []);
        setLoading(false);
      });
  }, []);

  const refetch = useCallback(() => {
    supabase.from("articles").select("*").order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error) setList(data as ArticleRow[] || []);
      });
  }, []);

  const handlePublish = async (id: string, isPublished: boolean) => {
    const newPublished = !isPublished;
    const { error } = await supabase.from("articles").update({
      is_published: newPublished,
      status: newPublished ? "published" : "draft",
    }).eq("id", id);
    if (error) showNotification("error", "Failed to update.");
    else { showNotification("success", `Article ${newPublished ? "published" : "unpublished"}.`); refetch(); }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("articles").delete().eq("id", id);
    if (error) showNotification("error", "Delete failed.");
    else { showNotification("success", "Article deleted."); refetch(); }
  };

  const filtered = list.filter(
    (a) => a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           a.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="newspaper-card">
      <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-xs w-full">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-faded" />
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search articles..."
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-border bg-paper focus:outline-none font-sans placeholder:text-ink-faded" />
        </div>
        <a href="/admin/studio"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-ink text-paper text-xs uppercase tracking-wider font-sans font-semibold hover:bg-ink-light transition-colors shrink-0">
          <Plus className="w-3.5 h-3.5" /> New Article
        </a>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-4 py-2.5 font-semibold text-ink text-xs uppercase tracking-wider font-sans">Title</th>
              <th className="px-4 py-2.5 font-semibold text-ink text-xs uppercase tracking-wider hidden sm:table-cell font-sans">Author</th>
              <th className="px-4 py-2.5 font-semibold text-ink text-xs uppercase tracking-wider hidden md:table-cell font-sans">Category</th>
              <th className="px-4 py-2.5 font-semibold text-ink text-xs uppercase tracking-wider font-sans">Status</th>
              <th className="px-4 py-2.5 font-semibold text-ink text-xs uppercase tracking-wider font-sans">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-ink-faded font-sans">Loading articles&hellip;</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-ink-faded font-sans">No articles found.</td></tr>
            ) : (
              filtered.map((article) => (
                <tr key={article.id} className="border-b border-border hover:bg-paper-dark/50 transition-colors">
                  <td className="px-4 py-2.5">
                    <p className="font-medium text-ink truncate max-w-[200px] lg:max-w-xs font-body text-sm">{article.title}</p>
                    <p className="text-[11px] text-ink-faded font-sans">{article.published_at}</p>
                  </td>
                  <td className="px-4 py-2.5 text-ink-light hidden sm:table-cell font-sans text-sm">{article.author}</td>
                  <td className="px-4 py-2.5 text-ink-light hidden md:table-cell font-sans text-sm">{article.category}</td>
                  <td className="px-4 py-2.5">
                    <button onClick={() => handlePublish(article.id, article.is_published)}
                      className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 font-sans transition-colors cursor-pointer ${
                        article.is_published ? "bg-sepia/10 text-sepia-dark hover:bg-sepia/20" : "bg-paper-dark text-ink-faded hover:bg-paper-dark/80"
                      }`}
                    >
                      {article.is_published ? <><Eye className="w-3 h-3" /> Published</> : <><EyeOff className="w-3 h-3" /> Draft</>}
                    </button>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1">
                      <a href={`/admin/studio?edit=${article.id}`}
                        className="p-1.5 hover:bg-paper-dark transition-colors rounded inline-flex" title="Edit in Studio">
                        <Pencil className="w-3.5 h-3.5 text-ink-faded" />
                      </a>
                      <button onClick={() => handleDelete(article.id, article.title)} className="p-1.5 hover:bg-red-50 transition-colors rounded" title="Delete">
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
  );
}

function CommentsTab({ searchTerm, setSearchTerm }: { searchTerm: string; setSearchTerm: (s: string) => void }) {
  const [list, setList] = useState<CommentRow[]>([]);
  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ author_name: "", content: "" });

  useEffect(() => {
    Promise.all([
      supabase.from("comments").select("*").order("created_at", { ascending: false }),
      supabase.from("articles").select("id,title"),
    ]).then(([cRes, aRes]) => {
      if (!cRes.error) setList(cRes.data as CommentRow[] || []);
      if (!aRes.error) setArticles(aRes.data as ArticleRow[] || []);
      setLoading(false);
    });
  }, []);

  const refetch = useCallback(() => {
    Promise.all([
      supabase.from("comments").select("*").order("created_at", { ascending: false }),
      supabase.from("articles").select("id,title"),
    ]).then(([cRes, aRes]) => {
      if (!cRes.error) setList(cRes.data as CommentRow[] || []);
      if (!aRes.error) setArticles(aRes.data as ArticleRow[] || []);
    });
  }, []);

  const articleTitleById = (id: string) => articles.find((a) => a.id === id)?.title || "\u2014";

  const saveCommentEdit = async (id: string) => {
    const { error } = await supabase.from("comments")
      .update({ author_name: editForm.author_name, content: editForm.content }).eq("id", id);
    if (error) showNotification("error", "Failed to update comment.");
    else { showNotification("success", "Comment updated."); setEditingId(null); refetch(); }
  };

  const handleDelete = async (id: string, author: string) => {
    if (!window.confirm(`Delete comment by "${author}"?`)) return;
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (error) showNotification("error", "Delete failed.");
    else { showNotification("success", "Comment deleted."); refetch(); }
  };

  const filtered = list.filter(
    (c) => c.author_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           c.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="newspaper-card">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="relative flex-1 max-w-xs w-full">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-faded" />
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search comments..."
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-border bg-paper focus:outline-none font-sans" />
        </div>
        <span className="text-xs text-ink-faded font-sans ml-3">{list.length} total</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-4 py-2.5 font-semibold text-ink text-xs uppercase tracking-wider font-sans">Author</th>
              <th className="px-4 py-2.5 font-semibold text-ink text-xs uppercase tracking-wider font-sans">Comment</th>
              <th className="px-4 py-2.5 font-semibold text-ink text-xs uppercase tracking-wider hidden sm:table-cell font-sans">Article</th>
              <th className="px-4 py-2.5 font-semibold text-ink text-xs uppercase tracking-wider font-sans">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-ink-faded font-sans">Loading comments&hellip;</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-ink-faded font-sans">No comments found.</td></tr>
            ) : (
              filtered.map((comment) => (
                <tr key={comment.id} className="border-b border-border hover:bg-paper-dark/50 transition-colors">
                  {editingId === comment.id ? (
                    <>
                      <td className="px-4 py-2.5">
                        <input type="text" value={editForm.author_name}
                          onChange={(e) => setEditForm({ ...editForm, author_name: e.target.value })}
                          className="w-full px-2 py-1 text-sm border border-border bg-paper focus:outline-none font-sans" />
                      </td>
                      <td className="px-4 py-2.5">
                        <textarea value={editForm.content}
                          onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                          rows={2} className="w-full px-2 py-1 text-sm border border-border bg-paper focus:outline-none font-sans resize-none" />
                      </td>
                      <td className="px-4 py-2.5 hidden sm:table-cell text-ink-light font-sans text-sm">
                        {articleTitleById(comment.article_id)}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1">
                          <button onClick={() => saveCommentEdit(comment.id)}
                            className="p-1.5 hover:bg-emerald-50 transition-colors rounded" title="Save">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          </button>
                          <button onClick={() => setEditingId(null)}
                            className="p-1.5 hover:bg-red-50 transition-colors rounded" title="Cancel">
                            <X className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-2.5">
                        <p className="font-medium text-ink font-sans text-sm">{comment.author_name}</p>
                      </td>
                      <td className="px-4 py-2.5">
                        <p className="text-ink-light font-sans text-sm line-clamp-2 max-w-xs">{comment.content}</p>
                      </td>
                      <td className="px-4 py-2.5 hidden sm:table-cell text-ink-light font-sans text-sm max-w-[150px] truncate">
                        {articleTitleById(comment.article_id)}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setEditingId(comment.id); setEditForm({ author_name: comment.author_name, content: comment.content }); }}
                            className="p-1.5 hover:bg-paper-dark transition-colors rounded" title="Edit">
                            <Pencil className="w-3.5 h-3.5 text-ink-faded" />
                          </button>
                          <button onClick={() => handleDelete(comment.id, comment.author_name)}
                            className="p-1.5 hover:bg-red-50 transition-colors rounded" title="Delete">
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ContactsTab() {
  const [messages, setMessages] = useState<ContactMessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("contact_messages").select("*").order("created_at", { ascending: false })
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        else setMessages(data || []);
        setLoading(false);
      });
  }, []);

  const refetch = useCallback(() => {
    supabase
      .from("contact_messages").select("*").order("created_at", { ascending: false })
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        else setMessages(data || []);
      });
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("contact_messages").update({ status }).eq("id", id);
    if (error) showNotification("error", "Update failed.");
    else { showNotification("success", `Message marked as ${status}.`); refetch(); }
  };

  const deleteMessage = async (id: string, name: string) => {
    if (!window.confirm(`Delete message from "${name}"?`)) return;
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (error) showNotification("error", "Delete failed.");
    else { showNotification("success", "Message deleted."); setSelectedId(null); refetch(); }
  };

  const filtered = messages.filter((m) => statusFilter === "all" || m.status === statusFilter);

  return (
    <div className="newspaper-card">
      <div className="px-5 pt-4 pb-3 border-b border-border flex items-center justify-between">
        <h2 className="font-serif text-lg font-bold text-ink">Contact Requests</h2>
        <div className="flex items-center gap-3">
          <button onClick={refetch}
            className="flex items-center gap-1 px-2 py-1 border border-border text-[10px] uppercase tracking-wider font-sans font-semibold text-ink-light hover:bg-paper-dark transition-colors">
            <Clock className="w-3 h-3" /> Refresh
          </button>
          <span className="text-[10px] text-ink-faded font-sans">{messages.length} total</span>
        </div>
      </div>

      <div className="px-5 py-3 border-b border-border flex gap-2 overflow-x-auto">
        {["all", "unread", "read", "archived"].map((f) => (
          <button key={f} onClick={() => setStatusFilter(f)}
            className={`px-3 py-1 text-[10px] uppercase tracking-wider font-sans font-semibold border transition-colors ${
              statusFilter === f ? "bg-ink text-paper border-ink" : "bg-paper text-ink-light border-border hover:bg-paper-dark"
            }`}>
            {f === "all" ? "All" : f}
          </button>
        ))}
      </div>

      <div className="p-5">
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-5 h-5 border border-ink/20 border-t-ink rounded-full animate-spin" />
            <p className="mt-2 text-sm text-ink-faded font-sans">Loading messages&hellip;</p>
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-12 border border-dashed border-red-200 bg-red-50/30">
            <XCircle className="w-8 h-8 mx-auto text-red-400 mb-2" />
            <p className="text-sm text-red-600 font-sans">Failed to load messages.</p>
            <p className="text-xs text-red-400 font-sans mt-1">{error}</p>
            <button onClick={refetch} className="mt-3 px-3 py-1 border border-red-200 text-[10px] uppercase tracking-wider text-red-600 font-sans font-semibold hover:bg-red-50 transition-colors">Retry</button>
          </div>
        )}

        {!loading && !error && messages.length === 0 && (
          <div className="text-center py-12 border border-dashed border-border">
            <MailQuestion className="w-8 h-8 mx-auto text-ink-faded/50 mb-2" />
            <p className="text-sm text-ink-faded font-sans">No contact requests found.</p>
          </div>
        )}

        {!loading && !error && messages.length > 0 && (
          <div className="space-y-2">
            {filtered.map((message) => (
              <div key={message.id}
                className={`border transition-all cursor-pointer ${
                  selectedId === message.id
                    ? "border-gold bg-gold/5"
                    : message.status === "unread"
                    ? "border-ink/20 bg-paper-dark/30 hover:border-ink/40"
                    : "border-border bg-paper hover:border-ink/20"
                }`}
                onClick={() => setSelectedId(selectedId === message.id ? null : message.id)}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {message.status === "unread" && <span className="w-2 h-2 bg-gold rounded-full shrink-0" />}
                        <h3 className={`text-sm font-sans truncate ${message.status === "unread" ? "font-bold text-ink" : "font-medium text-ink-light"}`}>
                          {message.subject}
                        </h3>
                      </div>
                      <p className="text-xs text-ink-faded font-sans mt-0.5">{message.name} &middot; {message.email}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 font-sans ${
                        message.status === "unread" ? "bg-amber-100 text-amber-800" : message.status === "read" ? "bg-sky-100 text-sky-700" : "bg-zinc-100 text-zinc-500"
                      }`}>
                        {message.status}
                      </span>
                      <span className="text-[9px] text-ink-faded font-sans whitespace-nowrap">{new Date(message.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {selectedId === message.id && (
                    <div className="mt-3 pt-3 border-t border-border space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-xs font-sans">
                        <div className="bg-paper-dark/50 p-2.5 border border-border">
                          <span className="text-[9px] uppercase tracking-wider text-ink-faded font-semibold block">From</span>
                          <span className="text-ink font-medium">{message.name}</span>
                        </div>
                        <div className="bg-paper-dark/50 p-2.5 border border-border">
                          <span className="text-[9px] uppercase tracking-wider text-ink-faded font-semibold block">Email</span>
                          <a href={`mailto:${message.email}`} className="text-sepia hover:underline">{message.email}</a>
                        </div>
                      </div>
                      <div className="bg-paper-dark/50 p-3 border border-border">
                        <span className="text-[9px] uppercase tracking-wider text-ink-faded font-semibold block mb-1.5 font-sans">Subject</span>
                        <p className="text-sm text-ink font-medium font-sans">{message.subject}</p>
                      </div>
                      <div className="bg-paper-dark/50 p-3 border border-border">
                        <span className="text-[9px] uppercase tracking-wider text-ink-faded font-semibold block mb-1.5 font-sans">Message</span>
                        <p className="text-sm text-ink-light font-sans leading-relaxed whitespace-pre-wrap">{message.message}</p>
                      </div>
                      <div className="bg-paper-dark/50 p-2.5 border border-border text-[10px] text-ink-faded font-sans">
                        <span className="font-semibold text-ink-light">Received:</span> {new Date(message.created_at).toLocaleString()}
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {message.status !== "read" && (
                          <button onClick={(e) => { e.stopPropagation(); updateStatus(message.id, "read"); }}
                            className="px-3 py-1.5 bg-sky-100 text-sky-700 text-[10px] uppercase tracking-wider font-sans font-semibold border border-sky-200 hover:bg-sky-200 transition-colors">Mark Read</button>
                        )}
                        {message.status !== "archived" && (
                          <button onClick={(e) => { e.stopPropagation(); updateStatus(message.id, "archived"); }}
                            className="px-3 py-1.5 bg-zinc-100 text-zinc-600 text-[10px] uppercase tracking-wider font-sans font-semibold border border-zinc-200 hover:bg-zinc-200 transition-colors">Archive</button>
                        )}
                        {message.status === "archived" && (
                          <button onClick={(e) => { e.stopPropagation(); updateStatus(message.id, "unread"); }}
                            className="px-3 py-1.5 bg-amber-100 text-amber-700 text-[10px] uppercase tracking-wider font-sans font-semibold border border-amber-200 hover:bg-amber-200 transition-colors">Restore</button>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); deleteMessage(message.id, message.name); }}
                          className="px-3 py-1.5 bg-red-50 text-red-600 text-[10px] uppercase tracking-wider font-sans font-semibold border border-red-200 hover:bg-red-100 transition-colors">Delete</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CategoriesTab() {
  const [list, setList] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: "", slug: "", description: "", icon: "Folder", visible: true });
  const [showNew, setShowNew] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", slug: "", description: "", icon: "Folder", visible: true });

  useEffect(() => {
    fetchCategories().then((cats) => { setList(cats); setLoading(false); });
  }, []);

  const refetch = useCallback(() => {
    invalidateCache();
    fetchCategories().then((cats) => { setList(cats); });
  }, []);

  const handleCreate = async () => {
    if (!newCategory.name || !newCategory.slug) { showNotification("error", "Name and slug are required."); return; }
    try {
      const res = await fetch("/api/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newCategory) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
      showNotification("success", "Category created.");
      setShowNew(false);
      setNewCategory({ name: "", slug: "", description: "", icon: "Folder", visible: true });
      refetch();
    } catch { showNotification("error", "Failed."); }
  };

  const handleUpdate = async (id: string) => {
    if (!categoryForm.name || !categoryForm.slug) { showNotification("error", "Name and slug are required."); return; }
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(categoryForm) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
      showNotification("success", "Category updated.");
      setEditingId(null);
      refetch();
    } catch { showNotification("error", "Failed."); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
      showNotification("success", "Category deleted.");
      refetch();
    } catch { showNotification("error", "Failed."); }
  };

  return (
    <div className="newspaper-card">
      <div className="px-5 pt-4 pb-3 border-b border-border flex items-center justify-between">
        <h2 className="font-serif text-lg font-bold text-ink">Manage Categories</h2>
        <button onClick={() => setShowNew(!showNew)}
          className="flex items-center gap-1 px-2.5 py-1 bg-ink text-paper text-[10px] uppercase tracking-wider font-sans font-semibold hover:bg-ink-light transition-colors">
          <Plus className="w-3 h-3" /> {showNew ? "Cancel" : "Add Category"}
        </button>
      </div>

      {showNew && (
        <div className="border-b border-border overflow-hidden">
          <div className="p-5 bg-paper-dark/30 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] uppercase tracking-[0.15em] text-ink-lighter font-semibold mb-1 font-sans">Name</label>
                <input type="text" value={newCategory.name} onChange={(e) => {
                  const name = e.target.value;
                  setNewCategory({ ...newCategory, name, slug: slugify(name) });
                }} placeholder="Category Name"
                  className="w-full px-2.5 py-1.5 text-sm border border-border bg-paper focus:outline-none font-sans" />
              </div>
              <div>
                <label className="block text-[9px] uppercase tracking-[0.15em] text-ink-lighter font-semibold mb-1 font-sans">Slug</label>
                <input type="text" value={newCategory.slug} onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                  placeholder="category-slug"
                  className="w-full px-2.5 py-1.5 text-sm border border-border bg-paper focus:outline-none font-sans" />
              </div>
            </div>
            <div>
              <label className="block text-[9px] uppercase tracking-[0.15em] text-ink-lighter font-semibold mb-1 font-sans">Description</label>
              <input type="text" value={newCategory.description} onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                placeholder="Brief description"
                className="w-full px-2.5 py-1.5 text-sm border border-border bg-paper focus:outline-none font-sans" />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm font-sans text-ink-light cursor-pointer">
                <input type="checkbox" checked={newCategory.visible}
                  onChange={(e) => setNewCategory({ ...newCategory, visible: e.target.checked })}
                  className="w-3.5 h-3.5 accent-sepia" />
                Visible in navigation
              </label>
            </div>
            <button onClick={handleCreate}
              className="px-4 py-1.5 bg-sepia text-paper text-[10px] uppercase tracking-wider font-sans font-semibold hover:bg-sepia-dark transition-colors">Create Category</button>
          </div>
        </div>
      )}

      <div className="p-5">
        {loading ? (
          <div className="text-center py-8 text-sm text-ink-faded font-sans">Loading categories&hellip;</div>
        ) : list.length === 0 ? (
          <div className="text-center py-8 text-sm text-ink-faded font-sans">No categories yet.</div>
        ) : (
          <div className="space-y-1">
            {list.map((cat, idx) => (
              <div key={cat.id} className="flex items-center gap-3 px-3 py-2 border border-border hover:bg-paper-dark/30 transition-colors">
                {editingId === cat.id ? (
                  <>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input type="text" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value, slug: slugify(e.target.value) })}
                        className="w-full px-2 py-1 text-sm border border-border bg-paper focus:outline-none font-sans" />
                      <input type="text" value={categoryForm.slug} onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                        className="w-full px-2 py-1 text-sm border border-border bg-paper focus:outline-none font-sans" />
                      <input type="text" value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                        className="w-full px-2 py-1 text-sm border border-border bg-paper focus:outline-none font-sans" />
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => handleUpdate(cat.id)}
                        className="p-1 hover:bg-emerald-50 transition-colors rounded" title="Save">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      </button>
                      <button onClick={() => setEditingId(null)}
                        className="p-1 hover:bg-red-50 transition-colors rounded" title="Cancel">
                        <X className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <FolderTree className="w-4 h-4 text-sepia shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-ink font-sans">{cat.name}</span>
                      <span className="text-[10px] text-ink-faded ml-2 font-sans">/{cat.slug}</span>
                      {cat.description && <span className="text-[10px] text-ink-faded ml-2 hidden sm:inline font-sans">&mdash; {cat.description}</span>}
                    </div>
                    <span className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${cat.visible ? "bg-emerald-400" : "bg-zinc-300"}`} />
                    <button onClick={() => { setEditingId(cat.id); setCategoryForm({ name: cat.name, slug: cat.slug, description: cat.description || "", icon: cat.icon, visible: cat.visible }); }}
                      className="p-1 hover:bg-paper-dark transition-colors rounded" title="Edit">
                      <Pencil className="w-3.5 h-3.5 text-ink-faded" />
                    </button>
                    <button onClick={() => handleDelete(cat.id, cat.name)}
                      className="p-1 hover:bg-red-50 transition-colors rounded" title="Delete">
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
