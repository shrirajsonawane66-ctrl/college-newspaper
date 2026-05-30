"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileText, Eye, EyeOff, Pencil, Trash2,
  Plus, Search, CheckCircle, XCircle, Users, Clock,
  LogOut, Newspaper, Sparkles, MessageSquare, Check, X,
  FolderTree, ChevronUp, ChevronDown, MailQuestion,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { fetchCategories, invalidateCache, type CategoryItem } from "@/lib/categories";
import AnalyticsCard from "@/components/ui/AnalyticsCard";
import { useAuth } from "@/hooks/useAuth";

type Tab = "overview" | "articles" | "comments" | "categories" | "contacts";

interface ArticleRow {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  category_slug: string;
  author: string;
  author_role: string;
  image_url: string;
  thumbnail_url: string;
  published_at: string;
  is_published: boolean;
  featured: boolean;
  trending: boolean;
  editor_pick: boolean;
  read_time: string;
  created_at: string;
  is_new: boolean;
}

interface CommentRow {
  id: string;
  article_id: string;
  author_name: string;
  content: string;
  created_at: string;
}

interface ContactMessageRow {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "unread" | "read" | "archived";
  created_at: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoading: authLoading, user, session, profile } = useAuth();
  const initialTab = (searchParams.get("tab") as Tab) || "overview";

  console.log("[Dashboard] Auth state:", { isLoading: authLoading, user: user?.email, session: !!session, profile });
  const [tab, setTab] = useState<Tab>(initialTab);
  const [searchTerm, setSearchTerm] = useState("");
  const [articlesList, setArticlesList] = useState<ArticleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Comments state
  const [commentsList, setCommentsList] = useState<CommentRow[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ author_name: "", content: "" });

  // Contact Messages state
  const [messages, setMessages] = useState<ContactMessageRow[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState("");
  const [contactStatusFilter, setContactStatusFilter] = useState<string>("all");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessageRow | null>(null);

  // Categories state
  const [categoriesList, setCategoriesList] = useState<CategoryItem[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: "", slug: "", description: "", icon: "Folder", visible: true });
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", slug: "", description: "", icon: "Folder", visible: true });

  const showNotification = useCallback((type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  }, []);

  // Auth is guaranteed by AdminLayout — just gate data fetches on authLoading

  // Sync tab with URL
  useEffect(() => {
    const t = searchParams.get("tab") as Tab;
    if (t && t !== tab) setTab(t);
  }, [searchParams]);

  const updateTab = (t: Tab) => {
    setTab(t);
    setSearchTerm("");
    const url = new URL(window.location.href);
    if (t === "overview") url.searchParams.delete("tab");
    else url.searchParams.set("tab", t);
    window.history.replaceState({}, "", url.toString());
  };

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    console.log("[Dashboard] Fetching articles...");
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) { console.error("[Dashboard] Fetch articles error:", error); showNotification("error", "Failed to load articles."); }
    else { console.log("[Dashboard] Articles fetched:", data?.length); setArticlesList(data as ArticleRow[] || []); }
    setLoading(false);
  }, [showNotification]);

  const fetchComments = useCallback(async () => {
    setCommentsLoading(true);
    console.log("[Dashboard] Fetching comments...");
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) { console.error("[Dashboard] Fetch comments error:", error); showNotification("error", "Failed to load comments."); }
    else { console.log("[Dashboard] Comments fetched:", data?.length); setCommentsList(data as CommentRow[] || []); }
    setCommentsLoading(false);
  }, [showNotification]);

  const loadCategories = useCallback(async () => {
    setCategoriesLoading(true);
    const cats = await fetchCategories();
    setCategoriesList(cats);
    setCategoriesLoading(false);
  }, []);

  const fetchMessages = async () => {
    setMessagesLoading(true);
    setMessagesError("");

    console.log("[Dashboard] Fetching contact_messages...");

    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    console.log("Fetched messages:", data);

    if (error) {
      console.error(error);
      setMessagesError(error.message);
    } else {
      setMessages(data || []);
    }

    setMessagesLoading(false);
  };

  const updateMessageStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("contact_messages")
      .update({ status })
      .eq("id", id);
    if (error) {
      showNotification("error", "Failed to update message status.");
    } else {
      showNotification("success", `Message marked as ${status}.`);
      fetchMessages();
    }
  };

  const deleteMessage = async (id: string, name: string) => {
    if (!window.confirm(`Delete message from "${name}"? This cannot be undone.`)) return;
    const { error } = await supabase
      .from("contact_messages")
      .delete()
      .eq("id", id);
    if (error) {
      showNotification("error", "Failed to delete message.");
    } else {
      showNotification("success", "Message deleted.");
      setSelectedMessage(null);
      fetchMessages();
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      console.log("[Dashboard] Auth ready, fetching data for user:", user.email);
      // Verify session is valid before running queries
      supabase.auth.getUser().then(({ data, error }) => {
        if (error) {
          console.error("[Dashboard] getUser() failed:", error);
          return;
        }
        console.log("[Dashboard] getUser() confirmed:", data.user?.email);
      });
      fetchArticles();
      fetchComments();
      loadCategories();
      fetchMessages();
    }
  }, [authLoading, user, fetchArticles, fetchComments, loadCategories]);

  // Auto-refetch when contacts tab is focused
  useEffect(() => {
    if (tab === "contacts" && !authLoading && user) {
      fetchMessages();
    }
  }, [tab, authLoading, user]);

  const handlePublish = async (id: string, isPublished: boolean) => {
    const { error } = await supabase.from("articles").update({ is_published: !isPublished }).eq("id", id);
    if (error) { showNotification("error", "Failed to update status."); }
    else { showNotification("success", `Article ${!isPublished ? "published" : "unpublished"}.`); fetchArticles(); }
  };

  const handleDeleteArticle = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("articles").delete().eq("id", id);
    if (error) { showNotification("error", "Failed to delete article."); }
    else { showNotification("success", "Article deleted."); fetchArticles(); }
  };

  const startEditComment = (comment: CommentRow) => {
    setEditingComment(comment.id);
    setEditForm({ author_name: comment.author_name, content: comment.content });
  };

  const cancelEditComment = () => {
    setEditingComment(null);
    setEditForm({ author_name: "", content: "" });
  };

  const saveCommentEdit = async (id: string) => {
    const { error } = await supabase
      .from("comments")
      .update({ author_name: editForm.author_name, content: editForm.content })
      .eq("id", id);
    if (error) { console.error("Update comment error:", error); showNotification("error", "Failed to update comment."); }
    else { showNotification("success", "Comment updated."); cancelEditComment(); fetchComments(); }
  };

  const handleDeleteComment = async (id: string, author: string) => {
    if (!window.confirm(`Delete comment by "${author}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (error) { showNotification("error", "Failed to delete comment."); }
    else { showNotification("success", "Comment deleted."); fetchComments(); }
  };

  const articleTitleById = (id: string) => {
    return articlesList.find((a) => a.id === id)?.title || "\u2014";
  };

  const filteredArticles = articlesList.filter(
    (a) => a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           a.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredComments = commentsList.filter(
    (c) => c.author_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           c.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const publishedCount = articlesList.filter((a) => a.is_published).length;
  const draftCount = articlesList.length - publishedCount;

  // ─── Category CRUD ───

  const slugify = (s: string) => s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const handleCreateCategory = async () => {
    if (!newCategory.name || !newCategory.slug) {
      showNotification("error", "Name and slug are required.");
      return;
    }
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
      showNotification("success", "Category created.");
      setShowNewCategory(false);
      setNewCategory({ name: "", slug: "", description: "", icon: "Folder", visible: true });
      invalidateCache();
      loadCategories();
    } catch (e: any) {
      showNotification("error", e.message || "Failed to create category.");
    }
  };

  const handleUpdateCategory = async (id: string) => {
    if (!categoryForm.name || !categoryForm.slug) {
      showNotification("error", "Name and slug are required.");
      return;
    }
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryForm),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
      showNotification("success", "Category updated.");
      setEditingCategory(null);
      invalidateCache();
      loadCategories();
    } catch (e: any) {
      showNotification("error", e.message || "Failed to update category.");
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!window.confirm(`Delete category "${name}"? Articles in this category will not be deleted but will lose their category reference.`)) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
      showNotification("success", "Category deleted.");
      invalidateCache();
      loadCategories();
    } catch (e: any) {
      showNotification("error", e.message || "Failed to delete category.");
    }
  };

  const moveCategory = async (id: string, direction: "up" | "down") => {
    const idx = categoriesList.findIndex((c) => c.id === id);
    if (idx === -1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= categoriesList.length) return;
    const current = categoriesList[idx];
    const swap = categoriesList[swapIdx];
    try {
      await fetch(`/api/categories/${current.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sort_order: swap.sort_order }),
      });
      await fetch(`/api/categories/${swap.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sort_order: current.sort_order }),
      });
      invalidateCache();
      loadCategories();
    } catch {
      showNotification("error", "Failed to reorder.");
    }
  };

  if (authLoading) return (
    <div className="min-h-screen bg-paper flex items-center justify-center">
      <div className="flex items-center gap-2 text-ink-faded text-sm font-body">
        <span className="inline-block w-4 h-4 border border-ink/20 border-t-ink rounded-full animate-spin" />
        Verifying session&hellip;
      </div>
    </div>
  );

  const tabs: Tab[] = ["overview", "articles", "comments", "contacts", "categories"];

  return (
    <div className="flex-1 overflow-auto relative">
      {/* Header */}
      <header className="bg-paper-light border-b border-border px-4 lg:px-6 py-3 flex items-center justify-between">
        <h1 className="font-serif text-lg lg:text-xl font-bold text-ink capitalize tracking-tight">
          {tab === "overview" ? "Dashboard" : tab}
        </h1>
        <div className="flex items-center gap-1.5 text-xs text-ink-faded font-body">
          <Clock className="w-3 h-3" />
          <span>
            {tab === "comments"
              ? `${commentsList.length} comment${commentsList.length !== 1 ? "s" : ""}`
              : tab === "categories"
              ? `${categoriesList.length} categories`
              : `${articlesList.length} article${articlesList.length !== 1 ? "s" : ""} total`
            }
          </span>
        </div>
      </header>

      {/* Tab bar */}
      <div className="border-b border-border bg-paper-light px-4 lg:px-6 overflow-x-auto">
        <div className="flex gap-5 min-w-max">
          {tabs.map((t) => (
            <button key={t} onClick={() => { updateTab(t); setSearchTerm(""); }}
              className={`py-2.5 text-xs uppercase tracking-[0.15em] font-bold border-b-2 transition-colors font-body whitespace-nowrap ${
                tab === t ? "border-ink text-ink" : "border-transparent text-ink-lighter hover:text-ink"
              }`}
            >
              {t === "overview" ? "Dashboard" : t === "articles" ? "All Articles" : t === "comments" ? "Comments" : t === "contacts" ? "Contact Requests" : "Categories"}
            </button>
          ))}
        </div>
      </div>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className={`absolute top-0 left-0 right-0 z-20 px-4 lg:px-6 py-2.5 text-sm font-body flex items-center gap-2 ${
              notification.type === "success" ? "bg-emerald-50 text-emerald-800 border-b border-emerald-200" : "bg-red-50 text-red-800 border-b border-red-200"
            }`}
          >
            {notification.type === "success" ? <CheckCircle className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 lg:p-6">
        {/* ─── OVERVIEW ─── */}
        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <AnalyticsCard label="Published" value={String(publishedCount)} change="Live on site" icon={<FileText className="w-5 h-5" />} />
              <AnalyticsCard label="Drafts" value={String(draftCount)} change="Awaiting review" icon={<EyeOff className="w-5 h-5" />} />
              <AnalyticsCard label="Total Articles" value={String(articlesList.length)} change="All time" icon={<Newspaper className="w-5 h-5" />} />
              <AnalyticsCard label="Comments" value={String(commentsList.length)} change="From readers" icon={<MessageSquare className="w-5 h-5" />} />
              <AnalyticsCard label="Contact Requests" value={String(messages.length)} change={messages.filter(c => c.status === 'unread').length + ' unread'} icon={<MailQuestion className="w-5 h-5" />} />
            </div>

            <div className="newspaper-card">
              <div className="px-5 pt-4 pb-3 border-b border-border flex items-center justify-between">
                <h2 className="font-serif text-lg font-bold text-ink">Recent Articles</h2>
                <a href="/admin/studio"
                  className="flex items-center gap-1 px-2.5 py-1 bg-ink text-paper text-[10px] uppercase tracking-wider font-body font-semibold hover:bg-ink-light transition-colors">
                  <Plus className="w-3 h-3" /> New
                </a>
              </div>
              <div className="p-5 space-y-3">
                {loading ? (
                  <div className="text-center py-6 text-sm text-ink-faded font-body">Loading&hellip;</div>
                ) : articlesList.length === 0 ? (
                  <div className="text-center py-6 text-sm text-ink-faded font-body">No articles yet.</div>
                ) : (
                  articlesList.slice(0, 5).map((article) => (
                    <div key={article.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-ink truncate font-body">{article.title}</p>
                        <p className="text-xs text-ink-faded font-body">{article.author} &middot; {article.published_at}</p>
                      </div>
                      <span className={`ml-3 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 font-body ${
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
                <span className="text-[10px] text-ink-faded font-body">{categoriesList.length} total</span>
              </div>
              <div className="p-5">
                {categoriesLoading ? (
                  <div className="text-center py-4 text-sm text-ink-faded font-body">Loading&hellip;</div>
                ) : categoriesList.length === 0 ? (
                  <div className="text-center py-4 text-sm text-ink-faded font-body">No categories yet.</div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {categoriesList.map((cat) => (
                      <span key={cat.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border text-xs font-body text-ink-light">
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
        )}

        {/* ─── ARTICLES TABLE ─── */}
        {tab === "articles" && (
          <div className="newspaper-card">
            <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="relative flex-1 max-w-xs w-full">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-faded" />
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search articles..."
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-border bg-paper focus:outline-none font-body placeholder:text-ink-faded" />
              </div>
              <a href="/admin/studio"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-ink text-paper text-xs uppercase tracking-wider font-body font-semibold hover:bg-ink-light transition-colors shrink-0">
                <Plus className="w-3.5 h-3.5" /> New Article
              </a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-4 py-2.5 font-semibold text-ink text-xs uppercase tracking-wider font-body">Title</th>
                    <th className="px-4 py-2.5 font-semibold text-ink text-xs uppercase tracking-wider hidden sm:table-cell font-body">Author</th>
                    <th className="px-4 py-2.5 font-semibold text-ink text-xs uppercase tracking-wider hidden md:table-cell font-body">Category</th>
                    <th className="px-4 py-2.5 font-semibold text-ink text-xs uppercase tracking-wider font-body">Status</th>
                    <th className="px-4 py-2.5 font-semibold text-ink text-xs uppercase tracking-wider font-body">New</th>
                    <th className="px-4 py-2.5 font-semibold text-ink text-xs uppercase tracking-wider font-body">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {                    loading ? (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-ink-faded font-body">Loading articles&hellip;</td></tr>
                  ) : filteredArticles.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-ink-faded font-body">No articles found.</td></tr>
                  ) : (
                    filteredArticles.map((article) => (
                      <tr key={article.id} className="border-b border-border hover:bg-paper-dark/50 transition-colors">
                        <td className="px-4 py-2.5">
                          <p className="font-medium text-ink truncate max-w-[200px] lg:max-w-xs font-body text-sm">{article.title}</p>
                          <p className="text-[11px] text-ink-faded font-body">{article.published_at}</p>
                        </td>
                        <td className="px-4 py-2.5 text-ink-light hidden sm:table-cell font-body text-sm">{article.author}</td>
                        <td className="px-4 py-2.5 text-ink-light hidden md:table-cell font-body text-sm">{article.category}</td>
                        <td className="px-4 py-2.5">
                          <button onClick={() => handlePublish(article.id, article.is_published)}
                            className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 font-body transition-colors cursor-pointer ${
                              article.is_published ? "bg-sepia/10 text-sepia-dark hover:bg-sepia/20" : "bg-paper-dark text-ink-faded hover:bg-paper-dark/80"
                            }`}
                          >
                            {article.is_published ? <><Eye className="w-3 h-3" /> Published</> : <><EyeOff className="w-3 h-3" /> Draft</>}
                          </button>
                        </td>
                        <td className="px-4 py-2.5">
                          <button
                            onClick={async () => {
                              const { error } = await supabase.from("articles").update({ is_new: !article.is_new }).eq("id", article.id);
                              if (error) showNotification("error", "Failed to update.");
                              else { showNotification("success", `New badge ${article.is_new ? "removed" : "added"}.`); fetchArticles(); }
                            }}
                            className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 font-body transition-colors cursor-pointer ${
                              article.is_new ? "bg-red-50 text-red-700 hover:bg-red-100" : "bg-paper-dark text-ink-faded hover:bg-paper-dark/80"
                            }`}
                          >
                            <span className={`inline-block w-1.5 h-1.5 rounded-full ${article.is_new ? "bg-red-500 animate-red-dot" : "bg-transparent"}`} />
                            {article.is_new ? "New" : "Old"}
                          </button>
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-1">
                            <a href={`/admin/studio?edit=${article.id}`}
                              className="p-1.5 hover:bg-paper-dark transition-colors rounded inline-flex" title="Edit in Studio">
                              <Pencil className="w-3.5 h-3.5 text-ink-faded" />
                            </a>
                            <button onClick={() => handleDeleteArticle(article.id, article.title)} className="p-1.5 hover:bg-red-50 transition-colors rounded" title="Delete">
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
        )}

        {/* ─── COMMENTS TABLE ─── */}
        {tab === "comments" && (
          <div className="newspaper-card">
            <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="relative flex-1 max-w-xs w-full">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-faded" />
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search comments..."
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-border bg-paper focus:outline-none font-body placeholder:text-ink-faded" />
              </div>
              <span className="text-[10px] text-ink-faded font-body">{commentsList.length} total</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-4 py-2.5 font-semibold text-ink text-xs uppercase tracking-wider font-body">Author</th>
                    <th className="px-4 py-2.5 font-semibold text-ink text-xs uppercase tracking-wider font-body">Comment</th>
                    <th className="px-4 py-2.5 font-semibold text-ink text-xs uppercase tracking-wider hidden sm:table-cell font-body">Article</th>
                    <th className="px-4 py-2.5 font-semibold text-ink text-xs uppercase tracking-wider hidden md:table-cell font-body">Date</th>
                    <th className="px-4 py-2.5 font-semibold text-ink text-xs uppercase tracking-wider font-body">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {commentsLoading ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-ink-faded font-body">Loading comments&hellip;</td></tr>
                  ) : filteredComments.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-ink-faded font-body">No comments found.</td></tr>
                  ) : (
                    filteredComments.map((comment) => (
                      <tr key={comment.id} className="border-b border-border hover:bg-paper-dark/50 transition-colors">
                        {editingComment === comment.id ? (
                          <>
                            <td className="px-4 py-2.5">
                              <input type="text" value={editForm.author_name}
                                onChange={(e) => setEditForm({ ...editForm, author_name: e.target.value })}
                                className="w-full px-2 py-1 text-sm border border-border bg-paper focus:outline-none font-body"
                              />
                            </td>
                            <td className="px-4 py-2.5">
                              <textarea value={editForm.content}
                                onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                                rows={2}
                                className="w-full px-2 py-1 text-sm border border-border bg-paper focus:outline-none font-body resize-none"
                              />
                            </td>
                            <td className="px-4 py-2.5 hidden sm:table-cell text-ink-light font-body text-sm">
                              {articleTitleById(comment.article_id)}
                            </td>
                            <td className="px-4 py-2.5 hidden md:table-cell text-ink-light font-body text-sm">
                              {new Date(comment.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-1">
                                <button onClick={() => saveCommentEdit(comment.id)}
                                  className="p-1.5 hover:bg-emerald-50 transition-colors rounded" title="Save">
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                </button>
                                <button onClick={cancelEditComment}
                                  className="p-1.5 hover:bg-red-50 transition-colors rounded" title="Cancel">
                                  <X className="w-3.5 h-3.5 text-red-400" />
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-2.5">
                              <p className="font-medium text-ink font-body text-sm">{comment.author_name}</p>
                            </td>
                            <td className="px-4 py-2.5">
                              <p className="text-ink-light font-body text-sm line-clamp-2 max-w-xs">{comment.content}</p>
                            </td>
                            <td className="px-4 py-2.5 hidden sm:table-cell text-ink-light font-body text-sm max-w-[150px] truncate">
                              {articleTitleById(comment.article_id)}
                            </td>
                            <td className="px-4 py-2.5 hidden md:table-cell text-ink-light font-body text-sm">
                              {new Date(comment.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-1">
                                <button onClick={() => startEditComment(comment)}
                                  className="p-1.5 hover:bg-paper-dark transition-colors rounded" title="Edit">
                                  <Pencil className="w-3.5 h-3.5 text-ink-faded" />
                                </button>
                                <button onClick={() => handleDeleteComment(comment.id, comment.author_name)}
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
        )}

        {/* ─── CONTACTS ─── */}
        {tab === "contacts" && (
          <div className="newspaper-card">
            <div className="px-5 pt-4 pb-3 border-b border-border flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-ink">Contact Requests</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchMessages}
                  className="flex items-center gap-1 px-2 py-1 border border-border text-[10px] uppercase tracking-wider font-body font-semibold text-ink-light hover:bg-paper-dark transition-colors"
                  title="Refresh"
                >
                  <Clock className="w-3 h-3" />
                  Refresh
                </button>
                <span className="text-[10px] text-ink-faded font-body">{messages.length} total</span>
              </div>
            </div>

            {/* Filter buttons */}
            <div className="px-5 py-3 border-b border-border flex gap-2 overflow-x-auto">
              {["all", "unread", "read", "archived"].map((f) => (
                <button
                  key={f}
                  onClick={() => setContactStatusFilter(f)}
                  className={`px-3 py-1 text-[10px] uppercase tracking-wider font-body font-semibold border transition-colors ${
                    contactStatusFilter === f
                      ? "bg-ink text-paper border-ink"
                      : "bg-paper text-ink-light border-border hover:bg-paper-dark"
                  }`}
                >
                  {f === "all" ? "All" : f}
                </button>
              ))}
            </div>

            <div className="p-5">
              {/* Debug render */}
              <pre className="mb-4 p-3 bg-paper-dark border border-border text-[11px] font-mono text-ink-light overflow-x-auto whitespace-pre-wrap max-h-48 overflow-y-auto">
                {JSON.stringify(messages, null, 2)}
              </pre>

              {/* Loading state */}
              {messagesLoading && (
                <div className="text-center py-12">
                  <div className="inline-block w-5 h-5 border border-ink/20 border-t-ink rounded-full animate-spin" />
                  <p className="mt-2 text-sm text-ink-faded font-body">Loading messages&hellip;</p>
                </div>
              )}

              {/* Error state */}
              {!messagesLoading && messagesError && (
                <div className="text-center py-12 border border-dashed border-red-200 bg-red-50/30">
                  <XCircle className="w-8 h-8 mx-auto text-red-400 mb-2" />
                  <p className="text-sm text-red-600 font-body">Failed to load messages.</p>
                  <p className="text-xs text-red-400 font-body mt-1">{messagesError}</p>
                  <button onClick={fetchMessages} className="mt-3 px-3 py-1 border border-red-200 text-[10px] uppercase tracking-wider text-red-600 font-body font-semibold hover:bg-red-50 transition-colors">
                    Retry
                  </button>
                </div>
              )}

              {/* Empty state */}
              {!messagesLoading && !messagesError && messages.length === 0 && (
                <div className="text-center py-12 border border-dashed border-border">
                  <MailQuestion className="w-8 h-8 mx-auto text-ink-faded/50 mb-2" />
                  <p className="text-sm text-ink-faded font-body">No contact requests found.</p>
                  <p className="text-xs text-ink-faded/50 font-body mt-1">Submitted contact form messages will appear here.</p>
                </div>
              )}

              {/* Messages list */}
              {!messagesLoading && !messagesError && messages.length > 0 && (
                <div className="space-y-2">
                  {messages
                    .filter((m) => contactStatusFilter === "all" || m.status === contactStatusFilter)
                    .map((message) => (
                    <motion.div
                      key={message.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`border transition-all cursor-pointer ${
                        selectedMessage?.id === message.id
                          ? "border-gold bg-gold/5"
                          : message.status === "unread"
                          ? "border-ink/20 bg-paper-dark/30 hover:border-ink/40"
                          : "border-border bg-paper hover:border-ink/20"
                      }`}
                      onClick={() => setSelectedMessage(selectedMessage?.id === message.id ? null : message)}
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              {message.status === "unread" && (
                                <span className="w-2 h-2 bg-gold rounded-full shrink-0" />
                              )}
                              <h3 className={`text-sm font-body truncate ${
                                message.status === "unread" ? "font-bold text-ink" : "font-medium text-ink-light"
                              }`}>
                                {message.subject}
                              </h3>
                            </div>
                            <p className="text-xs text-ink-faded font-body mt-0.5">
                              {message.name} &middot; {message.email}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className={`text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 font-body ${
                              message.status === "unread"
                                ? "bg-amber-100 text-amber-800"
                                : message.status === "read"
                                ? "bg-sky-100 text-sky-700"
                                : "bg-zinc-100 text-zinc-500"
                            }`}>
                              {message.status}
                            </span>
                            <span className="text-[9px] text-ink-faded font-body whitespace-nowrap">
                              {new Date(message.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <AnimatePresence>
                          {selectedMessage?.id === message.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-3 pt-3 border-t border-border space-y-3">
                                <div className="grid grid-cols-2 gap-3 text-xs font-body">
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
                                  <span className="text-[9px] uppercase tracking-wider text-ink-faded font-semibold block mb-1.5 font-body">Subject</span>
                                  <p className="text-sm text-ink font-medium font-body">{message.subject}</p>
                                </div>
                                <div className="bg-paper-dark/50 p-3 border border-border">
                                  <span className="text-[9px] uppercase tracking-wider text-ink-faded font-semibold block mb-1.5 font-body">Message</span>
                                  <p className="text-sm text-ink-light font-body leading-relaxed whitespace-pre-wrap">{message.message}</p>
                                </div>
                                <div className="bg-paper-dark/50 p-2.5 border border-border text-[10px] text-ink-faded font-body">
                                  <span className="font-semibold text-ink-light">Received:</span>{" "}
                                  {new Date(message.created_at).toLocaleString()}
                                </div>

                                <div className="flex flex-wrap gap-2 pt-1">
                                  {message.status !== "read" && (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); updateMessageStatus(message.id, "read"); }}
                                      className="px-3 py-1.5 bg-sky-100 text-sky-700 text-[10px] uppercase tracking-wider font-body font-semibold border border-sky-200 hover:bg-sky-200 transition-colors"
                                    >
                                      Mark Read
                                    </button>
                                  )}
                                  {message.status !== "archived" && (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); updateMessageStatus(message.id, "archived"); }}
                                      className="px-3 py-1.5 bg-zinc-100 text-zinc-600 text-[10px] uppercase tracking-wider font-body font-semibold border border-zinc-200 hover:bg-zinc-200 transition-colors"
                                    >
                                      Archive
                                    </button>
                                  )}
                                  {message.status === "archived" && (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); updateMessageStatus(message.id, "unread"); }}
                                      className="px-3 py-1.5 bg-amber-100 text-amber-700 text-[10px] uppercase tracking-wider font-body font-semibold border border-amber-200 hover:bg-amber-200 transition-colors"
                                    >
                                      Restore
                                    </button>
                                  )}
                                  <button
                                    onClick={(e) => { e.stopPropagation(); deleteMessage(message.id, message.name); }}
                                    className="px-3 py-1.5 bg-red-50 text-red-600 text-[10px] uppercase tracking-wider font-body font-semibold border border-red-200 hover:bg-red-100 transition-colors"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── CATEGORIES ─── */}
        {tab === "categories" && (
          <div className="newspaper-card">
            <div className="px-5 pt-4 pb-3 border-b border-border flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-ink">Manage Categories</h2>
              <button onClick={() => setShowNewCategory(!showNewCategory)}
                className="flex items-center gap-1 px-2.5 py-1 bg-ink text-paper text-[10px] uppercase tracking-wider font-body font-semibold hover:bg-ink-light transition-colors">
                <Plus className="w-3 h-3" /> {showNewCategory ? "Cancel" : "Add Category"}
              </button>
            </div>

            {/* New category form */}
            <AnimatePresence>
              {showNewCategory && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-b border-border overflow-hidden"
                >
                  <div className="p-5 bg-paper-dark/30 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] uppercase tracking-[0.15em] text-ink-lighter font-semibold mb-1 font-body">Name</label>
                        <input type="text" value={newCategory.name} onChange={(e) => {
                          const name = e.target.value;
                          setNewCategory({ ...newCategory, name, slug: slugify(name) });
                        }} placeholder="Category Name"
                          className="w-full px-2.5 py-1.5 text-sm border border-border bg-paper focus:outline-none font-body" />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase tracking-[0.15em] text-ink-lighter font-semibold mb-1 font-body">Slug</label>
                        <input type="text" value={newCategory.slug} onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                          placeholder="category-slug"
                          className="w-full px-2.5 py-1.5 text-sm border border-border bg-paper focus:outline-none font-body" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase tracking-[0.15em] text-ink-lighter font-semibold mb-1 font-body">Description</label>
                      <input type="text" value={newCategory.description} onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                        placeholder="Brief description of this category"
                        className="w-full px-2.5 py-1.5 text-sm border border-border bg-paper focus:outline-none font-body" />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-sm font-body text-ink-light cursor-pointer">
                        <input type="checkbox" checked={newCategory.visible}
                          onChange={(e) => setNewCategory({ ...newCategory, visible: e.target.checked })}
                          className="w-3.5 h-3.5 accent-sepia" />
                        Visible in navigation
                      </label>
                    </div>
                    <button onClick={handleCreateCategory}
                      className="px-4 py-1.5 bg-sepia text-paper text-[10px] uppercase tracking-wider font-body font-semibold hover:bg-sepia-dark transition-colors">
                      Create Category
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Category list */}
            <div className="p-5">
              {categoriesLoading ? (
                <div className="text-center py-8 text-sm text-ink-faded font-body">Loading categories&hellip;</div>
              ) : categoriesList.length === 0 ? (
                <div className="text-center py-8 text-sm text-ink-faded font-body">
                  No categories yet. Create your first category above.
                </div>
              ) : (
                <div className="space-y-1">
                  {categoriesList.map((cat, idx) => (
                    <div key={cat.id} className="flex items-center gap-3 px-3 py-2 border border-border hover:bg-paper-dark/30 transition-colors">
                      {editingCategory === cat.id ? (
                        <>
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <input type="text" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value, slug: slugify(e.target.value) })}
                              className="w-full px-2 py-1 text-sm border border-border bg-paper focus:outline-none font-body" />
                            <input type="text" value={categoryForm.slug} onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                              className="w-full px-2 py-1 text-sm border border-border bg-paper focus:outline-none font-body" />
                            <input type="text" value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                              className="w-full px-2 py-1 text-sm border border-border bg-paper focus:outline-none font-body" />
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button onClick={() => handleUpdateCategory(cat.id)}
                              className="p-1 hover:bg-emerald-50 transition-colors rounded" title="Save">
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            </button>
                            <button onClick={() => setEditingCategory(null)}
                              className="p-1 hover:bg-red-50 transition-colors rounded" title="Cancel">
                              <X className="w-3.5 h-3.5 text-red-400" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <button onClick={() => moveCategory(cat.id, "up")}
                            disabled={idx === 0}
                            className="p-0.5 text-ink-faded hover:text-ink disabled:opacity-20 disabled:cursor-not-allowed">
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => moveCategory(cat.id, "down")}
                            disabled={idx === categoriesList.length - 1}
                            className="p-0.5 text-ink-faded hover:text-ink disabled:opacity-20 disabled:cursor-not-allowed">
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          <FolderTree className="w-4 h-4 text-sepia shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium text-ink font-body">{cat.name}</span>
                            <span className="text-[10px] text-ink-faded ml-2 font-body">/{cat.slug}</span>
                            {cat.description && (
                              <span className="text-[10px] text-ink-faded ml-2 hidden sm:inline font-body">&mdash; {cat.description}</span>
                            )}
                          </div>
                          <span className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${cat.visible ? "bg-emerald-400" : "bg-zinc-300"}`} title={cat.visible ? "Visible" : "Hidden"} />
                          <a href={`/admin/category-studio?edit=${cat.slug}`}
                            className="p-1 hover:bg-paper-dark transition-colors rounded" title="Open Studio">
                            <Sparkles className="w-3.5 h-3.5 text-gold" />
                          </a>
                          <button onClick={() => { setEditingCategory(cat.id); setCategoryForm({ name: cat.name, slug: cat.slug, description: cat.description || "", icon: cat.icon, visible: cat.visible }); }}
                            className="p-1 hover:bg-paper-dark transition-colors rounded" title="Edit">
                            <Pencil className="w-3.5 h-3.5 text-ink-faded" />
                          </button>
                          <button onClick={() => handleDeleteCategory(cat.id, cat.name)}
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
        )}
      </div>
    </div>
  );
}
