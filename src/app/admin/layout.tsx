"use client";

import { Component, useState, useEffect, useRef, Suspense } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, FileText, FolderTree, MessageSquare, LogOut, Eye,
  Sparkles, Newspaper, MailQuestion,
} from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

class AdminLayoutErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-paper flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-12 h-12 mx-auto border border-red-200 bg-red-50 flex items-center justify-center mb-4">
              <span className="text-red-500 text-xl font-bold">!</span>
            </div>
            <h2 className="font-serif text-xl font-bold text-ink mb-2">Something went wrong</h2>
            <p className="text-sm text-ink-faded font-sans mb-4">An unexpected error occurred in the admin panel.</p>
            <button onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
              className="px-4 py-2 bg-ink text-paper text-xs uppercase tracking-wider font-sans font-semibold hover:bg-ink-light transition-colors">
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/dashboard?tab=categories", label: "Categories", icon: FolderTree },
  { href: "/admin/category-studio", label: "Category Studio", icon: Sparkles },
  { href: "/admin/studio", label: "New Article", icon: Sparkles },
  { href: "/admin/dashboard?tab=comments", label: "Comments", icon: MessageSquare },
  { href: "/admin/dashboard?tab=contacts", label: "Contact Requests", icon: MailQuestion },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoading, user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (user) hasRedirected.current = false;
  }, [user]);

  useEffect(() => {
    if (hasRedirected.current) return;
    if (!isLoading && !user && pathname !== "/admin/login") {
      hasRedirected.current = true;
      router.replace("/admin/login");
    }
  }, [isLoading, user, pathname, router]);

  // Only fetch unread count once on mount if user is logged in
  useEffect(() => {
    if (!isLoading && user) {
      getSupabase()
        .from("contact_messages")
        .select("*", { count: "exact", head: true })
        .eq("status", "unread")
        .then(({ count }) => {
          if (count !== null) setUnreadCount(count);
        });
    }
  }, [isLoading, user]);

  if (pathname === "/admin/login") return <>{children}</>;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="flex items-center gap-2 text-ink-faded text-sm font-sans">
          <span className="inline-block w-4 h-4 border border-ink/20 border-t-ink rounded-full animate-spin" />
          Verifying session&hellip;
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="flex items-center gap-2 text-ink-faded text-sm font-body">
          <span className="inline-block w-4 h-4 border border-ink/20 border-t-ink rounded-full animate-spin" />
          Redirecting&hellip;
        </div>
      </div>
    );
  }

  const isActive = (href: string) => {
    if (href === "/admin/dashboard") {
      return pathname === "/admin/dashboard" && !pathname.includes("studio");
    }
    return pathname.startsWith(href);
  };

  return (
    <AdminLayoutErrorBoundary>
      <div className="min-h-screen bg-paper flex">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside className={`fixed lg:sticky top-0 left-0 z-30 w-56 lg:w-64 min-h-screen bg-ink text-zinc-400 flex flex-col shrink-0 transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
          <div className="p-4 lg:p-5 border-b border-zinc-800">
            <Link href="/admin/dashboard" className="block">
              <h3 className="font-serif font-bold text-paper text-xl tracking-tight">Campus</h3>
              <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-sans font-semibold">Timeline Admin</p>
            </Link>
          </div>

          <nav className="flex-1 p-3 lg:p-4 space-y-0.5 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm font-sans rounded-sm transition-colors ${
                    active
                      ? "bg-white/10 text-paper font-semibold border-l-2 border-gold"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.label === "Contact Requests" && unreadCount > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 text-[10px] font-bold font-sans bg-gold text-ink rounded-full leading-none">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
            <div className="newspaper-rule-thick opacity-10 my-2 mx-3" />
            <Link
              href="/admin/dashboard"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-sans rounded-sm transition-colors ${
                pathname === "/admin/dashboard" ? "" : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              All Articles
            </Link>
          </nav>

          <div className="p-3 border-t border-zinc-800 space-y-0.5">
            <a href="/" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-sans text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors rounded-sm"
            >
              <Eye className="w-4 h-4" /> View Site
            </a>
            <button onClick={signOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-sans text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors rounded-sm"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-h-screen overflow-auto">
          <div className="lg:hidden flex items-center justify-between bg-paper-light border-b border-border px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 -ml-1.5 text-ink-lighter hover:text-ink"
              aria-label="Open menu"
            >
              <Newspaper className="w-5 h-5" />
            </button>
            <Link href="/admin/dashboard" className="font-serif font-bold text-ink text-base tracking-tight">
              Campus Admin
            </Link>
            <div className="w-8" />
          </div>
          <Suspense fallback={
            <div className="flex-1 flex items-center justify-center">
              <div className="flex items-center gap-2 text-ink-faded text-sm font-sans">
                <span className="inline-block w-4 h-4 border border-ink/20 border-t-ink rounded-full animate-spin" />
                Loading&hellip;
              </div>
            </div>
          }>
            {children}
          </Suspense>
        </div>
      </div>
    </AdminLayoutErrorBoundary>
  );
}
