"use client"
/* eslint-disable @next/next/no-html-link-for-pages --
   nav hrefs from nav_items already include the basePath; next/link would double-prefix them. */

import { useEffect, useRef, useState } from "react"
import {
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Circle,
  Diamond,
  Hexagon,
  Shield,
  Star,
  Trophy,
  Users,
  MapPin,
} from "lucide-react"
import { HeaderLogo } from "@/components/header-logo"
import type { NavNode } from "@/lib/nav"

const BASE = "/project/football-team"

/* Abstract glyphs cycled across mega-menu items, matching the icon-tile look. */
const ITEM_ICONS = [Circle, Diamond, Hexagon, Shield, Star, Trophy, Users, MapPin]

function ItemIcon({ index }: { index: number }) {
  const Icon = ITEM_ICONS[index % ITEM_ICONS.length]
  return (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-white shadow-sm">
      <Icon className="h-5 w-5 text-accent-dark" strokeWidth={1.5} />
    </span>
  )
}

/** Public header rendered entirely from nav_items (top-level links + group dropdowns + feature cards). */
export function DbSiteHeader({ nav, logoUrl }: { nav: NavNode[]; logoUrl?: string | null }) {
  const [open, setOpen] = useState<string | null>(null)
  const [mobile, setMobile] = useState(false)
  const [mobileOpen, setMobileOpen] = useState<string | null>(null)
  const ref = useRef<HTMLElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  // Lock body scroll while the mobile menu overlay is open.
  useEffect(() => {
    document.body.style.overflow = mobile ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [mobile])

  const enter = (id: string) => { if (timer.current) clearTimeout(timer.current); setOpen(id) }
  const leave = () => { timer.current = setTimeout(() => setOpen(null), 150) }

  const ctas = nav.filter((n) => n.isCta)
  const items = nav.filter((n) => !n.isCta)

  return (
    // backdrop-blur only on lg+: a filter creates a containing block that would trap the
    // fixed mobile overlay inside the header's box. The overlay only renders below lg.
    <header ref={ref} className="sticky top-0 z-50 w-full border-b border-border bg-white/95 lg:backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 md:h-20 lg:px-8">
        <a href={BASE} className="flex items-center gap-2">
          <HeaderLogo logoUrl={logoUrl ?? null} />
          <span className="hidden font-heading text-lg font-bold tracking-tight text-ink sm:inline-block">Baltimore Kings</span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1.5 rounded-full border border-border bg-paper/70 p-1.5 lg:flex">
          {items.map((n) =>
            n.children.length > 0 || n.href === null ? (
              <div key={n.id} onMouseEnter={() => enter(n.id)} onMouseLeave={leave}>
                <button
                  onClick={() => setOpen(open === n.id ? null : n.id)}
                  className={`inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${open === n.id ? "bg-white text-ink shadow-sm" : "text-muted-foreground hover:bg-white hover:text-ink"}`}
                >
                  {n.label}
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open === n.id ? "rotate-180" : ""}`} />
                </button>
              </div>
            ) : (
              <a key={n.id} href={n.href ?? "#"} className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white hover:text-ink">
                {n.label}
              </a>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2">
          {ctas.map((c) => (
            <a key={c.id} href={c.href ?? "#"} className="hidden rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-brand-light sm:inline-flex">
              {c.label}
            </a>
          ))}
          <button onClick={() => setMobile(!mobile)} className="rounded-full p-2 text-ink lg:hidden" aria-label="Menu">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Desktop mega menu panel — one large panel under the header */}
      {items.map((n) => {
        if (open !== n.id || n.children.length === 0) return null
        const mid = Math.ceil(n.children.length / 2)
        const colA = n.children.slice(0, mid)
        const colB = n.children.slice(mid)
        return (
          <div
            key={n.id}
            onMouseEnter={() => enter(n.id)}
            onMouseLeave={leave}
            className="absolute inset-x-0 top-full hidden justify-center px-6 pt-2 lg:flex"
          >
            <div className="w-full max-w-6xl overflow-hidden rounded-3xl border border-border bg-paper shadow-2xl">
              <div className="grid grid-cols-[minmax(260px,340px)_1fr] gap-8 p-4">
                {/* Feature card */}
                <a
                  href={n.featureCard?.href ?? n.children[0]?.href ?? "#"}
                  className="group relative flex min-h-[320px] flex-col justify-start overflow-hidden rounded-2xl bg-court p-7 text-paper"
                >
                  {n.featureCard?.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={n.featureCard.imageUrl}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-b from-court/80 via-court/30 to-court/70" />
                  <div className="relative">
                    <h3 className="font-heading text-2xl leading-snug">
                      {n.featureCard?.title ?? n.label}
                    </h3>
                    {n.featureCard?.blurb ? (
                      <p className="mt-3 max-w-[26ch] text-sm leading-relaxed text-paper/80">{n.featureCard.blurb}</p>
                    ) : null}
                  </div>
                </a>

                {/* Link columns */}
                <div className="flex flex-col py-3 pr-3">
                  <div className="grid flex-1 grid-cols-2 gap-x-8">
                    {[colA, colB].map((col, ci) => (
                      <ul key={ci} className="space-y-1.5">
                        {col.map((c, i) => (
                          <li key={c.href + c.label}>
                            <a
                              href={c.href}
                              className="flex items-center gap-4 rounded-2xl p-2.5 transition-colors hover:bg-white hover:shadow-sm"
                            >
                              <ItemIcon index={ci * mid + i} />
                              <span className="min-w-0">
                                <span className="block text-[15px] font-semibold text-ink">{c.label}</span>
                                {c.description ? (
                                  <span className="block truncate text-sm text-muted-foreground">{c.description}</span>
                                ) : null}
                              </span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    ))}
                  </div>

                  {/* Footer row */}
                  <div className="mt-6 flex items-end justify-between gap-6 border-t border-border pt-5">
                    <div>
                      <p className="text-sm font-semibold text-ink">Not sure where to start?</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">Reach out and we&apos;ll point you the right way.</p>
                    </div>
                    <a
                      href={`${BASE}/join/apply`}
                      className="shrink-0 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper transition-colors hover:bg-brand"
                    >
                      Contact us
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}

      {/* Mobile menu — full-screen white sheet with accordion sections */}
      {mobile ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-white lg:hidden">
          <div className="flex h-16 items-center justify-between px-4">
            <a href={BASE} className="flex items-center gap-2" onClick={() => setMobile(false)}>
              <HeaderLogo logoUrl={logoUrl ?? null} />
              <span className="font-heading text-lg font-bold tracking-tight text-ink">Baltimore Kings</span>
            </a>
            <button onClick={() => setMobile(false)} className="p-2 text-ink" aria-label="Close menu">
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-4">
            {items.map((n) => (
              <div key={n.id} className="border-b border-border">
                {n.children.length > 0 ? (
                  <>
                    <button
                      onClick={() => setMobileOpen(mobileOpen === n.id ? null : n.id)}
                      className="flex w-full items-center justify-between py-4 text-left text-base font-semibold text-ink"
                    >
                      {n.label}
                      <ChevronDown
                        className={`h-4 w-4 text-muted-foreground transition-transform ${mobileOpen === n.id ? "rotate-180" : ""}`}
                      />
                    </button>
                    {mobileOpen === n.id ? (
                      <ul className="-mx-4 space-y-0.5 bg-paper px-4 py-3">
                        {n.children.map((c) => (
                          <li key={c.href + c.label}>
                            <a
                              href={c.href}
                              onClick={() => setMobile(false)}
                              className="flex items-center justify-between py-2.5 text-[15px] font-medium text-ink"
                            >
                              {c.label}
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </>
                ) : (
                  <a
                    href={n.href ?? "#"}
                    onClick={() => setMobile(false)}
                    className="block py-4 text-base font-semibold text-ink"
                  >
                    {n.label}
                  </a>
                )}
              </div>
            ))}
          </nav>

          <div className="grid grid-cols-2 gap-3 border-t border-border p-4 pb-6">
            <a
              href={`${BASE}/sign-in`}
              onClick={() => setMobile(false)}
              className="flex items-center justify-center rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-paper"
            >
              Log In
            </a>
            {(() => {
              const apply = ctas.find((c) => !/sign-in|login/.test(c.href ?? ""))
              return (
                <a
                  href={apply?.href ?? `${BASE}/join/apply`}
                  onClick={() => setMobile(false)}
                  className="flex items-center justify-center rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-ink"
                >
                  {apply?.label ?? "Apply"}
                </a>
              )
            })()}
          </div>
        </div>
      ) : null}
    </header>
  )
}
