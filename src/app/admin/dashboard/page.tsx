"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  FileText, Eye, EyeOff, Pencil, Trash2,
  Plus, Search, CheckCircle, XCircle, Users, Clock,
  LogOut, Newspaper, Sparkles, MessageSquare, Check, X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import AnalyticsCard from "@/components/ui/AnalyticsCard";

type Tab = "overview" | "articles" | "comments";

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
  published_at: string;
  is_published: boolean;
  featured: boolean;
  trending: boolean;
  editor_pick: boolean;
  read_time: string;
  created_at: string;
}

interface CommentRow {
  id: string;
  article_id: string;
  author_name: string;
  content: string;
  created_at: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [articlesList, setArticlesList] = useState<ArticleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Comments state
  const [commentsList, setCommentsList] = useState<CommentRow[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ author_name: "", content: "" });

  const showNotification = useCallback((type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push("/admin/login"); return; }
      setAuthChecking(false);
    });
  }, [router]);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) { console.error("Fetch error:", error); showNotification("error", "Failed to load articles."); }
    else { setArticlesList(data as ArticleRow[] || []); }
    setLoading(false);
  }, [showNotification]);

  const fetchComments = useCallback(async () => {
    setCommentsLoading(true);
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) { console.error("Fetch comments error:", error); showNotification("error", "Failed to load comments."); }
    else { setCommentsList(data as CommentRow[] || []); }
    setCommentsLoading(false);
  }, [showNotification]);

  useEffect(() => {
    if (!authChecking) {
      fetchArticles();
      fetchComments();
    }
  }, [authChecking, fetchArticles, fetchComments]);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  const articleTitleById = (id: string) => {
    return articlesList.find((a) => a.id === id)?.title || "—";
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

  if (authChecking) return (
    <div className="min-h-screen bg-paper flex items-center justify-center">
      <div className="flex items-center gap-2 text-ink-faded text-sm font-body">
        <span className="inline-block w-4 h-4 border border-ink/20 border-t-ink rounded-full animate-spin" />
        Verifying session&hellip;
      </div>
    </div>
  );

  const tabs: Tab[] = ["overview", "articles", "comments"];

  return (
    <div className="min-h-screen bg-paper flex">
      {/* Sidebar */}
      <aside className="w-56 lg:w-64 min-h-screen bg-ink text-zinc-400 flex flex-col shrink-0">
        <div className="p-4 lg:p-5 border-b border-zinc-800">
          <h3 className="font-serif font-bold text-paper text-lg tracking-tight">WCCBM</h3>
          <p className="text-[8px] uppercase tracking-[0.25em] text-zinc-600 font-body font-semibold">Timeline Admin</p>
        </div>
        <nav className="flex-1 p-2 lg:p-3 space-y-0.5">
          <a href="/admin/studio"
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-body rounded-sm transition-colors text-left bg-gold/10 text-gold-light border border-gold/20 font-semibold"
          >
            <Sparkles className="w-4 h-4" /> Publishing Studio
          </a>
          <div className="newspaper-rule-thick opacity-10 my-1.5 mx-3" />
          {tabs.map((t) => (
            <button key={t} onClick={() => { setTab(t); setSearchTerm(""); }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-body rounded-sm transition-colors text-left ${
                tab === t ? "bg-white/10 text-paper font-semibold" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
              }`}
            >
              {t === "overview" && <Newspaper className="w-4 h-4" />}
              {t === "articles" && <FileText className="w-4 h-4" />}
              {t === "comments" && <MessageSquare className="w-4 h-4" />}
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-zinc-800 space-y-0.5">
          <a href="/" className="flex items-center gap-3 px-3 py-2 text-sm font-body text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors rounded-sm">
            <Eye className="w-4 h-4" /> View Site
          </a>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-body text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors rounded-sm">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 overflow-auto relative">
        <header className="bg-paper-light border-b border-border px-4 lg:px-6 py-3 flex items-center justify-between">
          <h1 className="font-serif text-lg lg:text-xl font-bold text-ink capitalize tracking-tight">
            {tab === "overview" ? "Dashboard" : tab}
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-ink-faded font-body">
            <Clock className="w-3 h-3" />
            <span>
              {tab === "comments"
                ? `${commentsList.length} comment${commentsList.length !== 1 ? "s" : ""}`
                : `${articlesList.length} article${articlesList.length !== 1 ? "s" : ""} total`
              }
            </span>
          </div>
        </header>

        {/* Tab bar */}
        <div className="border-b border-border bg-paper-light px-4 lg:px-6 overflow-x-auto">
          <div className="flex gap-5 min-w-max">
            {tabs.map((t) => (
              <button key={t} onClick={() => { setTab(t); setSearchTerm(""); }}
                className={`py-2.5 text-xs uppercase tracking-[0.15em] font-bold border-b-2 transition-colors font-body whitespace-nowrap ${
                  tab === t ? "border-ink text-ink" : "border-transparent text-ink-lighter hover:text-ink"
                }`}
              >
                {t === "overview" ? "Dashboard" : t === "articles" ? "All Articles" : "Comments"}
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
                    <div className="text-center py-6 text-sm text-ink-faded font-body">No articles yet. Create your first one in the Publishing Studio.</div>
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
                      <th className="px-4 py-2.5 font-semibold text-ink text-xs uppercase tracking-wider font-body">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-ink-faded font-body">Loading articles&hellip;</td></tr>
                    ) : filteredArticles.length === 0 ? (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-ink-faded font-body">No articles found.</td></tr>
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
        </div>
      </div>
    </div>
  );
}
