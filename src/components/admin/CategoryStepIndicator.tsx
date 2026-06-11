"use client";



interface Step {
  id: string;
  label: string;
  description: string;
}

const steps: Step[] = [
  { id: "details", label: "Category Details", description: "Name, slug & description" },
  { id: "banner", label: "Banner & Hero", description: "Upload section imagery" },
  { id: "settings", label: "Settings", description: "SEO, meta & visibility" },
  { id: "articles", label: "Manage Articles", description: "Reorder & feature posts" },
  { id: "publish", label: "Publish", description: "Release section to readers" },
];

export default function CategoryStepIndicator({
  currentStep,
  onStepClick,
}: {
  currentStep: string;
  onStepClick: (step: string) => void;
}) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <nav className="w-56 lg:w-64 min-h-screen bg-ink text-zinc-400 flex flex-col shrink-0 border-r border-zinc-800/50">
      <div className="p-5 border-b border-zinc-800">
        <h3 className="font-serif font-bold text-paper text-lg tracking-tight">Campus</h3>
        <p className="text-[8px] uppercase tracking-[0.25em] text-zinc-600 font-body font-semibold">Category Studio</p>
      </div>

      <div className="flex-1 p-3 space-y-0.5">
        {steps.map((step, i) => {
          const isActive = step.id === currentStep;
          const isPast = i < currentIndex;
          const isClickable = i <= currentIndex + 1;

          return (
            <button
              key={step.id}
              onClick={() => isClickable && onStepClick(step.id)}
              disabled={!isClickable}
              className={`w-full flex items-start gap-3 px-3 py-2.5 text-left transition-all duration-300 rounded-sm ${
                isActive
                  ? "bg-white/10 text-paper"
                  : isPast
                  ? "text-zinc-400 hover:text-zinc-300 hover:bg-white/5"
                  : "text-zinc-600 cursor-not-allowed"
              }`}
            >
              <div className="relative flex items-center justify-center w-6 h-6 mt-0.5 shrink-0">
                {isPast ? (
                  <div className="w-full h-full rounded-full bg-gold/80 flex items-center justify-center">
                    <svg className="w-3 h-3 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : isActive ? (
                  <div className="w-full h-full rounded-full border-2 border-gold flex items-center justify-center">
                    <span className="text-[10px] font-bold text-gold font-body">{i + 1}</span>
                  </div>
                ) : (
                  <div className="w-full h-full rounded-full border border-zinc-700 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-zinc-600 font-body">{i + 1}</span>
                  </div>
                )}
                {i < steps.length - 1 && (
                  <div className={`absolute top-6 left-1/2 -translate-x-1/2 w-px h-6 ${
                    isPast ? "bg-gold/40" : "bg-zinc-800"
                  }`} />
                )}
              </div>

              <div className="min-w-0">
                <p className={`text-xs font-semibold font-body leading-tight ${
                  isActive ? "text-paper" : isPast ? "text-zinc-300" : "text-zinc-600"
                }`}>
                  {step.label}
                </p>
                <p className={`text-[9px] mt-0.5 font-body ${
                  isActive ? "text-zinc-400" : "text-zinc-600"
                }`}>
                  {step.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-zinc-800">
        <a
          href="/admin/dashboard"
          className="flex items-center gap-2 px-3 py-1.5 text-[10px] uppercase tracking-wider text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors rounded-sm font-body font-semibold"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </a>
      </div>
    </nav>
  );
}
