"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createBrowserClient } from "@supabase/ssr"

// basePath handled by next.config.ts

type Sponsor = {
  id: string
  name: string
  logo_url: string | null
  website_url: string | null
  order_index: number | null
}

const PLACEHOLDER_SLOTS = [
  "Your Brand Here",
  "Partner Slot",
  "Sponsor the Kings",
  "Your Logo Here",
  "Partner Slot",
]

export function SponsorStrip() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    async function fetchSponsors() {
      const { data } = await supabase
        .from("sponsors")
        .select("id, name, logo_url, website_url, order_index")
        .eq("is_active", true)
        .order("order_index", { ascending: true })

      setSponsors((data as Sponsor[]) || [])
      setLoading(false)
    }

    fetchSponsors()
  }, [])

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

        {loading ? (
          <div className="mt-4 flex flex-wrap gap-3">
            {PLACEHOLDER_SLOTS.map((_, i) => (
              <div
                key={i}
                className="h-14 min-w-[120px] flex-1 animate-pulse rounded-lg border border-border bg-white"
              />
            ))}
          </div>
        ) : sponsors.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-3">
            {sponsors.map((sponsor) => {
              const hasLink =
                sponsor.website_url && sponsor.website_url !== "#"
              const Wrapper = hasLink ? "a" : "div"
              const wrapperProps = hasLink
                ? {
                    href: sponsor.website_url as string,
                    target: "_blank",
                    rel: "noopener noreferrer",
                  }
                : {}
              return (
                <Wrapper
                  key={sponsor.id}
                  {...wrapperProps}
                  className="group flex h-14 min-w-[120px] flex-1 items-center justify-center rounded-lg border border-border bg-white px-4 text-center transition-colors hover:border-accent"
                >
                  {sponsor.logo_url && sponsor.logo_url !== "#" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={sponsor.logo_url}
                      alt={sponsor.name}
                      className="max-h-9 max-w-full object-contain grayscale transition-all duration-300 group-hover:grayscale-0"
                    />
                  ) : (
                    <span className="font-heading text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      {sponsor.name}
                    </span>
                  )}
                </Wrapper>
              )
            })}
          </div>
        ) : (
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
        )}
      </div>
    </div>
  )
}
