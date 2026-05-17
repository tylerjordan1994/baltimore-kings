import Link from "next/link"

// basePath handled by next.config.ts

const PLACEHOLDER_SLOTS = [
  "Your Brand Here",
  "Partner Slot",
  "Sponsor the Kings",
  "Your Logo Here",
  "Partner Slot",
]

export function SponsorStrip() {
  return (
    <div className="border-t border-border bg-paper py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="font-heading text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Club Partners
          </p>
          <Link
            href="/club/sponsors"
            className="text-xs font-medium text-accent transition-colors hover:text-accent/80"
          >
            Sponsor the Kings &rarr;
          </Link>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          {PLACEHOLDER_SLOTS.map((label, i) => (
            <div
              key={i}
              className="flex h-14 min-w-[120px] flex-1 items-center justify-center rounded-lg border border-dashed border-border bg-white px-4 text-center"
            >
              <span className="font-heading text-[11px] font-medium uppercase tracking-wide text-muted-foreground/50">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
