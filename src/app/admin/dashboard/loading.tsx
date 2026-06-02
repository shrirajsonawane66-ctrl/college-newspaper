export default function DashboardLoading() {
  return (
    <div className="flex-1 overflow-auto">
      <header className="bg-paper-light border-b border-border px-4 lg:px-6 py-3">
        <div className="h-7 w-32 bg-zinc-200 rounded animate-pulse" />
      </header>

      <div className="border-b border-border bg-paper-light px-4 lg:px-6">
        <div className="flex gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-9 w-24 bg-zinc-200 rounded animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      </div>

      <div className="p-4 lg:p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-zinc-100 rounded animate-pulse" style={{ animationDelay: `${i * 0.08}s` }} />
          ))}
        </div>

        <div className="space-y-3">
          <div className="h-64 bg-zinc-100 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
