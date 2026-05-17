import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] px-4 text-center">
      <p className="font-heading text-sm font-semibold uppercase tracking-widest text-gold">Page Not Found</p>
      <h1 className="mt-3 font-heading text-8xl font-bold text-white">404</h1>
      <p className="mt-4 text-lg text-white/60">
        Might have been offside.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center rounded-full bg-gold px-6 py-3 text-sm font-semibold text-[#0a0a0a] transition-colors hover:bg-gold-light"
      >
        Back to Home
      </Link>
    </div>
  )
}
