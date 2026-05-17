import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-4 text-center">
      <p className="font-heading text-sm font-semibold uppercase tracking-widest text-brand">Page Not Found</p>
      <h1 className="mt-3 font-heading text-8xl font-bold text-ink">404</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Might have been offside.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center rounded-full bg-brand px-6 py-3 text-sm font-semibold text-paper transition-opacity hover:opacity-90"
      >
        Back to Home
      </Link>
    </div>
  )
}
