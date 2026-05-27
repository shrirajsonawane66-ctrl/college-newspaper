"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, MessageSquare, Settings, LogOut } from "lucide-react";

const links = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Articles", href: "/admin/dashboard?tab=articles", icon: FileText },
  { label: "Comments", href: "/admin/dashboard?tab=comments", icon: MessageSquare },
  { label: "Settings", href: "/admin/dashboard?tab=settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-ink text-zinc-400 flex flex-col shrink-0">
      <div className="p-5 border-b border-zinc-800">
        <Link href="/admin/dashboard">
          <h3 className="font-serif font-bold text-paper text-lg tracking-tight">WCCBM</h3>
          <p className="text-[8px] uppercase tracking-[0.25em] text-zinc-600 font-body font-semibold">Timeline Admin</p>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (link.href.includes('?') && pathname === link.href.split('?')[0]);
          return (
            <Link key={link.label} href={link.href}
              className={`flex items-center gap-3 px-3 py-2 text-sm font-body rounded-sm transition-colors ${
                isActive ? "bg-white/10 text-paper font-semibold" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
              }`}>
              <Icon className="w-4 h-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-zinc-800">
        <Link href="/" className="flex items-center gap-3 px-3 py-2 text-sm font-body text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors rounded-sm">
          <LogOut className="w-4 h-4" />
          Back to Site
        </Link>
      </div>
    </aside>
  );
}
