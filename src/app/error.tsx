"use client"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-4 text-center">
      <p className="font-heading text-sm font-semibold uppercase tracking-widest text-brand">Error</p>
      <h1 className="mt-3 font-heading text-4xl font-bold text-ink">Something went wrong</h1>
      <p className="mt-4 text-muted-foreground">
        {error.message || "An unexpected error occurred."}
      </p>
      <button
        onClick={reset}
        className="mt-8 inline-flex items-center rounded-full bg-brand px-6 py-3 text-sm font-semibold text-paper transition-opacity hover:opacity-90"
      >
        Try again
      </button>
    </div>
  )
}
