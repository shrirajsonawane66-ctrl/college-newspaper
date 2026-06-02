"use client";

export default function ErrorFallback({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="w-12 h-12 mx-auto border border-red-200 bg-red-50 flex items-center justify-center mb-4">
          <span className="text-red-500 text-xl font-bold">!</span>
        </div>
        <h2 className="font-serif text-xl font-bold text-ink mb-2">Something went wrong</h2>
        <p className="text-sm text-ink-faded font-sans mb-4">
          {error.message || "An unexpected error occurred."}
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-ink text-paper text-xs uppercase tracking-wider font-sans font-semibold hover:bg-ink-light transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
