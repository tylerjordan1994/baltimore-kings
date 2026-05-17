import type { Metadata } from "next"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { ArrowRight, ExternalLink } from "lucide-react"

// basePath handled by next.config.ts

export const metadata: Metadata = {
  title: "Partners & Sponsors | Baltimore Kings",
  description:
    "Support the Baltimore Kings. Partner with Baltimore's competitive futsal and arena soccer club. Sponsorship opportunities available.",
}

type Sponsor = {
  id: string
  name: string
  logo_url: string | null
  website_url: string | null
  tier: "platinum" | "gold" | "silver" | null
  description: string | null
  is_active: boolean
  order_index: number | null
  placements: string[] | null
}

const tierConfig = {
  platinum: {
    label: "Platinum Partners",
    accent: "border-accent/40 bg-accent/5",
    badge: "bg-accent text-ink",
    logoSize: "h-32",
  },
  gold: {
    label: "Gold Sponsors",
    accent: "border-yellow-300/40 bg-yellow-50",
    badge: "bg-yellow-400 text-ink",
    logoSize: "h-24",
  },
  silver: {
    label: "Silver Sponsors",
    accent: "border-slate-300/40 bg-slate-50",
    badge: "bg-slate-300 text-ink",
    logoSize: "h-20",
  },
}

const TIER_ORDER: Array<"platinum" | "gold" | "silver"> = ["platinum", "gold", "silver"]

export default async function SponsorsPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from("sponsors")
    .select("*")
    .eq("is_active", true)
    .order("order_index", { ascending: true })

  const sponsors = (data as Sponsor[]) || []

  const grouped: Record<string, Sponsor[]> = {}
  for (const tier of TIER_ORDER) {
    const tierSponsors = sponsors.filter((s) => s.tier === tier)
    if (tierSponsors.length > 0) grouped[tier] = tierSponsors
  }

  // If no sponsors at all, show placeholder layout
  const hasSponsors = sponsors.length > 0

  return (
    <>
      {/* Hero */}
      <section className="bg-paper py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="font-heading text-xs font-semibold uppercase tracking-widest text-accent">
            Partners &amp; Sponsors
          </p>
          <h1 className="mt-3 font-heading text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            The brands behind the Kings
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Our sponsors make it possible to field competitive teams at the highest levels of adult futsal and arena soccer in the region. We partner with brands that believe in sport, community, and genuine competition.
          </p>
        </div>
      </section>

      {/* Sponsor tiers */}
      <section className="bg-paper pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-14">
          {hasSponsors ? (
            TIER_ORDER.filter((tier) => grouped[tier]).map((tier) => {
              const cfg = tierConfig[tier]
              const tierSponsors = grouped[tier]
              return (
                <div key={tier}>
                  <div className="mb-6 flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest ${cfg.badge}`}>
                      {cfg.label}
                    </span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {tierSponsors.map((sponsor) => (
                      <div
                        key={sponsor.id}
                        className={`rounded-xl border p-6 transition-all hover:shadow-sm ${cfg.accent}`}
                      >
                        {/* Logo area */}
                        <div className={`flex items-center justify-center rounded-lg border border-border bg-white ${cfg.logoSize} w-full`}>
                          {sponsor.logo_url && sponsor.logo_url !== "#" ? (
                            <img
                              src={sponsor.logo_url}
                              alt={sponsor.name}
                              className="max-h-full max-w-full object-contain p-3 grayscale"
                            />
                          ) : (
                            <span className="font-heading text-lg font-bold text-muted-foreground/40">
                              {sponsor.name}
                            </span>
                          )}
                        </div>

                        <div className="mt-4">
                          <p className="font-heading font-semibold text-ink">{sponsor.name}</p>
                          {sponsor.description && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {sponsor.description}
                            </p>
                          )}
                          {sponsor.placements && sponsor.placements.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1">
                              {sponsor.placements.map((p) => (
                                <span
                                  key={p}
                                  className="rounded-full border border-border bg-white px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
                                >
                                  {p}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {sponsor.website_url && sponsor.website_url !== "#" && (
                          <div className="mt-4">
                            <a
                              href={sponsor.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                            >
                              Visit website <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })
          ) : (
            /* Empty state with placeholder slots */
            <div>
              <p className="mb-8 text-center text-muted-foreground">
                Sponsorship slots are available. Be one of the first brands to partner with the Kings.
              </p>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-paper p-8 text-center"
                  >
                    <div className="flex h-20 w-full items-center justify-center rounded-lg border border-dashed border-border bg-white">
                      <span className="font-heading text-sm font-semibold text-muted-foreground/50">
                        Your Brand Here
                      </span>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">Sponsor Slot Available</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Become a sponsor CTA */}
      <section className="border-t border-border bg-brand py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="font-heading text-xs font-semibold uppercase tracking-widest text-accent">
                Partner with Us
              </p>
              <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Become a Baltimore Kings sponsor
              </h2>
              <p className="mt-4 text-white/80">
                We offer targeted sponsorship packages for local and regional businesses. Your brand will be seen by players, families, and fans across Baltimore and the greater Mid-Atlantic region — at games, on our website, and in club communications.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-8 backdrop-blur-sm">
              <h3 className="font-heading text-xl font-bold text-white">What we offer</h3>
              <ul className="mt-5 space-y-3">
                {[
                  "Jersey and kit branding",
                  "Website logo placement",
                  "Social media mentions",
                  "Game-day recognition",
                  "MASL3 arena signage",
                  "Club newsletter inclusion",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-white/90">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <a
                  href="mailto:info@baltimorekings.com"
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-heading text-sm font-semibold text-ink transition-colors hover:bg-accent/90"
                >
                  Get in Touch
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
