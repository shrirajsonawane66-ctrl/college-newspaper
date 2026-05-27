"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, FileText, FolderTree, MessageSquare, LogOut, Eye,
  Sparkles, Newspaper, MailQuestion,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

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

  console.log("[AdminLayout] state:", { isLoading, userEmail: user?.email, pathname });

  // If no user after auth resolves, redirect to login
  useEffect(() => {
    if (!isLoading && !user && pathname !== "/admin/login") {
      console.log("[AdminLayout] No user, redirecting to /admin/login");
      router.push("/admin/login");
    }
  }, [isLoading, user, pathname, router]);

  const fetchUnreadCount = useCallback(async () => {
    const { count } = await supabase
      .from("contact_messages")
      .select("*", { count: "exact", head: true })
      .eq("status", "unread");
    if (count !== null) setUnreadCount(count);
  }, []);

  useEffect(() => {
    if (!isLoading && user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 15000);
      return () => clearInterval(interval);
    }
  }, [isLoading, user, fetchUnreadCount]);

  if (pathname === "/admin/login") return <>{children}</>;

  // Auth loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="flex items-center gap-2 text-ink-faded text-sm font-body">
          <span className="inline-block w-4 h-4 border border-ink/20 border-t-ink rounded-full animate-spin" />
          Verifying session&hellip;
        </div>
      </div>
    );
  }

  // No user after loading — useEffect handles redirect
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
    <div className="min-h-screen bg-paper flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-30 w-56 lg:w-64 min-h-screen bg-ink text-zinc-400 flex flex-col shrink-0 transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="p-4 lg:p-5 border-b border-zinc-800">
          <Link href="/admin/dashboard" className="block">
            <h3 className="font-serif font-bold text-paper text-lg tracking-tight">WCCBM</h3>
            <p className="text-[8px] uppercase tracking-[0.25em] text-zinc-600 font-body font-semibold">Timeline Admin</p>
          </Link>
        </div>

        <nav className="flex-1 p-2 lg:p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 text-sm font-body rounded-sm transition-colors ${
                  active
                    ? "bg-white/10 text-paper font-semibold border-l-2 border-gold"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.label === "Contact Requests" && unreadCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[9px] font-bold font-body bg-gold text-ink rounded-full leading-none">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
          <div className="newspaper-rule-thick opacity-10 my-1.5 mx-3" />
          <Link
            href="/admin/dashboard"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2 text-sm font-body rounded-sm transition-colors ${
              pathname === "/admin/dashboard" ? "" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            All Articles
          </Link>
        </nav>

        <div className="p-3 border-t border-zinc-800 space-y-0.5">
          <a href="/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2 text-sm font-body text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors rounded-sm"
          >
            <Eye className="w-4 h-4" /> View Site
          </a>
          <button onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-body text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors rounded-sm"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-auto">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between bg-paper-light border-b border-border px-4 py-2.5">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 -ml-1.5 text-ink-lighter hover:text-ink"
            aria-label="Open menu"
          >
            <Newspaper className="w-5 h-5" />
          </button>
          <Link href="/admin/dashboard" className="font-serif font-bold text-ink text-sm tracking-tight">
            WCCBM Admin
          </Link>
          <div className="w-8" />
        </div>
        {children}
      </div>
    </div>
  );
}
