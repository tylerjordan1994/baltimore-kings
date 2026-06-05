"use client"

import type { Config, Fields, CustomField } from "@measured/puck"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { PlayerCardItem, EventItem, SponsorItem, ResolvedPayload } from "@/lib/content-tokens/types"

/* ════════════════════════════════════════════════════════
   Shared field helpers — brand-safe by construction.
   ════════════════════════════════════════════════════════ */

// Color fields expose design tokens ONLY (no arbitrary hex). DESIGN-SYSTEM.md §5.2.
const TOKEN_COLORS = [
  { label: "Paper", value: "paper" },
  { label: "Ink", value: "ink" },
  { label: "Brand (Navy)", value: "brand" },
  { label: "Brand Light", value: "brand-light" },
  { label: "Accent (Gold)", value: "accent" },
  { label: "Court (Dark)", value: "court" },
]
const colorField = (label: string) =>
  ({ type: "select", label, options: TOKEN_COLORS }) as const

const bgClass: Record<string, string> = {
  paper: "bg-paper text-ink",
  ink: "bg-ink text-paper",
  brand: "bg-brand text-paper",
  "brand-light": "bg-brand-light text-paper",
  accent: "bg-accent text-ink",
  court: "bg-court text-paper",
}

/** Dropdown of tokens whose collection matches the block (content_tokens is public-readable). */
function TokenSelect({
  collection,
  value,
  onChange,
}: {
  collection: string
  value: string
  onChange: (v: string) => void
}) {
  const [tokens, setTokens] = useState<{ key: string; name: string }[]>([])
  useEffect(() => {
    const supabase = createClient()
    supabase
      .from("content_tokens")
      .select("key, name")
      .eq("collection", collection)
      .order("name")
      .then(({ data }) => setTokens((data as { key: string; name: string }[]) ?? []))
  }, [collection])
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600 }}>Data source ({collection})</label>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.currentTarget.value)}
        style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd" }}
      >
        <option value="">— Select a token —</option>
        {tokens.map((t) => (
          <option key={t.key} value={t.key}>
            {t.name} [{t.key}]
          </option>
        ))}
      </select>
      <a
        href="/project/football-team/app/admin/tokens"
        target="_blank"
        rel="noreferrer"
        style={{ fontSize: 11, color: "#9A7B2F" }}
      >
        + Create a new token
      </a>
    </div>
  )
}

const tokenField = (collection: string): CustomField<string> => ({
  type: "custom",
  render: ({ value, onChange }) => (
    <TokenSelect collection={collection} value={value ?? ""} onChange={onChange} />
  ),
})

/* ── Resolved-data helpers (data injected by hydrateTokens at runtime) ── */

function readResolved<T>(props: unknown): T[] {
  const r = (props as { _resolved?: ResolvedPayload })._resolved
  if (r && "items" in r) return r.items as T[]
  return []
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="mx-auto max-w-3xl rounded-xl border border-dashed border-[#E2E0DA] bg-paper/60 p-8 text-center text-sm text-[#6B6B6B]">
      {label}
    </div>
  )
}

/* ════════════════════════════════════════════════════════
   Block prop types (editable fields only — no _resolved here)
   ════════════════════════════════════════════════════════ */

type HeadingProps = { text: string; level: "h1" | "h2" | "h3"; align: "left" | "center" }
type RichTextProps = { text: string }
type ButtonProps = { label: string; href: string; variant: "brand" | "accent" | "outline" }
type SpacerProps = { size: "sm" | "md" | "lg" }
type HeroProps = { eyebrow: string; title: string; subtitle: string; imageUrl: string; bg: string }
type PlayerCardsProps = { token: string; columns: 2 | 3 | 4; showJersey: boolean }
type ScheduleListProps = { token: string; heading: string }
type SponsorStripProps = { token: string; grayscale: boolean }

export type Props = {
  Heading: HeadingProps
  RichText: RichTextProps
  Button: ButtonProps
  Spacer: SpacerProps
  Hero: HeroProps
  PlayerCards: PlayerCardsProps
  ScheduleList: ScheduleListProps
  SponsorStrip: SponsorStripProps
}

const GAP: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
}

/* ════════════════════════════════════════════════════════
   Config
   ════════════════════════════════════════════════════════ */

export const puckConfig: Config<Props> = {
  categories: {
    content: { title: "Content", components: ["Hero", "Heading", "RichText", "Button", "Spacer"] },
    data: { title: "Data-bound", components: ["PlayerCards", "ScheduleList", "SponsorStrip"] },
  },
  components: {
    Hero: {
      label: "Hero",
      fields: {
        eyebrow: { type: "text", label: "Eyebrow" },
        title: { type: "text", label: "Title" },
        subtitle: { type: "textarea", label: "Subtitle" },
        imageUrl: { type: "text", label: "Background image URL" },
        bg: colorField("Fallback background"),
      } as Fields<HeroProps>,
      defaultProps: { eyebrow: "Baltimore Kings", title: "Title goes here", subtitle: "", imageUrl: "", bg: "court" },
      render: ({ eyebrow, title, subtitle, imageUrl, bg }) => (
        <section className={`relative isolate flex min-h-[60vh] items-end overflow-hidden ${bgClass[bg] ?? bgClass.court}`}>
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-70" />
          ) : null}
          <div className="mx-auto w-full max-w-6xl px-6 pb-16">
            {eyebrow ? <p className="mb-3 text-xs uppercase tracking-[0.2em] text-accent">{eyebrow}</p> : null}
            <h1 className="font-heading text-5xl leading-[0.95] sm:text-7xl">{title}</h1>
            {subtitle ? <p className="mt-4 max-w-xl text-lg opacity-80">{subtitle}</p> : null}
          </div>
        </section>
      ),
    },
    Heading: {
      label: "Heading",
      fields: {
        text: { type: "text", label: "Text" },
        level: { type: "select", label: "Level", options: [
          { label: "H1", value: "h1" }, { label: "H2", value: "h2" }, { label: "H3", value: "h3" },
        ] },
        align: { type: "radio", label: "Align", options: [
          { label: "Left", value: "left" }, { label: "Center", value: "center" },
        ] },
      } as Fields<HeadingProps>,
      defaultProps: { text: "Heading", level: "h2", align: "left" },
      render: ({ text, level: L, align }) => {
        const cls = `mx-auto max-w-6xl px-6 font-heading ${align === "center" ? "text-center" : ""} ${
          L === "h1" ? "text-5xl sm:text-7xl" : L === "h2" ? "text-3xl sm:text-5xl" : "text-2xl sm:text-3xl"
        }`
        return L === "h1" ? <h1 className={cls}>{text}</h1> : L === "h2" ? <h2 className={cls}>{text}</h2> : <h3 className={cls}>{text}</h3>
      },
    },
    RichText: {
      label: "Rich Text",
      fields: { text: { type: "textarea", label: "Text" } } as Fields<RichTextProps>,
      defaultProps: { text: "Add your text here. Inline tokens like [club-founded-year] resolve automatically." },
      render: ({ text }) => (
        <div className="mx-auto max-w-3xl whitespace-pre-wrap px-6 text-[17px] leading-relaxed text-ink">{text}</div>
      ),
    },
    Button: {
      label: "Button",
      fields: {
        label: { type: "text", label: "Label" },
        href: { type: "text", label: "Link" },
        variant: { type: "select", label: "Style", options: [
          { label: "Brand", value: "brand" }, { label: "Accent", value: "accent" }, { label: "Outline", value: "outline" },
        ] },
      } as Fields<ButtonProps>,
      defaultProps: { label: "Learn more", href: "#", variant: "brand" },
      render: ({ label, href, variant }) => {
        const v = variant === "brand" ? "bg-brand text-paper hover:bg-brand-light"
          : variant === "accent" ? "bg-accent text-ink hover:bg-accent-light"
          : "border border-ink/20 text-ink hover:bg-ink/5"
        return (
          <div className="mx-auto max-w-6xl px-6">
            <a href={href} className={`inline-flex items-center rounded-full px-6 py-2.5 text-sm font-semibold transition-colors ${v}`}>{label}</a>
          </div>
        )
      },
    },
    Spacer: {
      label: "Spacer",
      fields: { size: { type: "select", label: "Size", options: [
        { label: "Small", value: "sm" }, { label: "Medium", value: "md" }, { label: "Large", value: "lg" },
      ] } } as Fields<SpacerProps>,
      defaultProps: { size: "md" },
      render: ({ size }) => <div className={size === "sm" ? "h-8" : size === "lg" ? "h-28" : "h-16"} />,
    },

    /* ── Data-bound (reference implementations) ── */
    PlayerCards: {
      label: "Player Cards",
      fields: {
        token: tokenField("players"),
        columns: { type: "select", label: "Columns", options: [
          { label: "2", value: 2 }, { label: "3", value: 3 }, { label: "4", value: 4 },
        ] },
        showJersey: { type: "radio", label: "Show jersey #", options: [
          { label: "Yes", value: true }, { label: "No", value: false },
        ] },
      } as Fields<PlayerCardsProps>,
      defaultProps: { token: "", columns: 3, showJersey: true },
      render: (props) => {
        const players = readResolved<PlayerCardItem>(props)
        if (!props.token) return <EmptyState label="No roster bound yet — pick a players token in this block's settings." />
        if (players.length === 0) return <EmptyState label="No players assigned yet — add players in Roster Manager." />
        return (
          <div className={`mx-auto grid max-w-6xl grid-cols-1 gap-5 px-6 ${GAP[props.columns] ?? GAP[3]}`}>
            {players.map((p) => (
              <article key={p.id} className="group overflow-hidden rounded-2xl border border-[#E2E0DA] bg-white">
                <div className="relative aspect-[4/5] bg-paper">
                  {p.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.photoUrl} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center font-heading text-6xl text-ink/10">{p.name.charAt(0)}</div>
                  )}
                  {props.showJersey && p.jerseyNumber != null ? (
                    <span className="absolute left-3 top-3 rounded-full bg-brand px-2.5 py-1 font-heading text-sm text-paper">{p.jerseyNumber}</span>
                  ) : null}
                </div>
                <div className="p-4">
                  <p className="font-heading text-lg leading-tight text-ink">{p.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-[#6B6B6B]">
                    {[p.positionPrimary, p.positionSecondary].filter(Boolean).join(" · ") || "—"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )
      },
    },
    ScheduleList: {
      label: "Schedule List",
      fields: {
        token: tokenField("events"),
        heading: { type: "text", label: "Heading" },
      } as Fields<ScheduleListProps>,
      defaultProps: { token: "", heading: "Upcoming" },
      render: (props) => {
        const events = readResolved<EventItem>(props)
        if (!props.token) return <EmptyState label="No schedule bound yet — pick an events token in this block's settings." />
        if (events.length === 0) return <EmptyState label="No upcoming events." />
        return (
          <div className="mx-auto max-w-3xl px-6">
            {props.heading ? <h3 className="mb-5 font-heading text-2xl text-ink">{props.heading}</h3> : null}
            <ul className="divide-y divide-[#E2E0DA] overflow-hidden rounded-xl border border-[#E2E0DA] bg-white">
              {events.map((e) => {
                const d = new Date(e.startsAt)
                return (
                  <li key={e.id} className="flex items-center gap-4 p-4">
                    <div className="flex w-14 shrink-0 flex-col items-center rounded-lg bg-brand py-1.5 text-paper">
                      <span className="text-[10px] uppercase tracking-wide">{d.toLocaleDateString("en-US", { month: "short" })}</span>
                      <span className="font-heading text-xl leading-none">{d.getDate()}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink">{e.title}</p>
                      <p className="text-sm text-[#6B6B6B]">
                        {d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                        {e.location ? ` · ${e.location}` : ""}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      },
    },
    SponsorStrip: {
      label: "Sponsor Strip",
      fields: {
        token: tokenField("sponsors"),
        grayscale: { type: "radio", label: "Grayscale", options: [
          { label: "Yes", value: true }, { label: "No", value: false },
        ] },
      } as Fields<SponsorStripProps>,
      defaultProps: { token: "", grayscale: true },
      render: (props) => {
        const sponsors = readResolved<SponsorItem>(props)
        if (!props.token) return <EmptyState label="No sponsors bound yet — pick a sponsors token." />
        if (sponsors.length === 0) return <EmptyState label="No active sponsors." />
        return (
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-8 px-6">
            {sponsors.map((s) =>
              s.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={s.id} src={s.logoUrl} alt={s.name}
                  className={`h-12 w-auto object-contain ${props.grayscale ? "opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0" : ""}`} />
              ) : (
                <span key={s.id} className="font-heading text-xl text-ink/40">{s.name}</span>
              ),
            )}
          </div>
        )
      },
    },
  },
}
