import type { ReactNode } from "react";

export default function SidebarWidget({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="newspaper-card">
      <div className="px-4 pt-3.5 pb-2 border-b border-border">
        <h3 className="font-serif text-sm font-bold text-ink uppercase tracking-[0.1em]">
          {title}
        </h3>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}
