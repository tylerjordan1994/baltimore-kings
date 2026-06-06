"use client"
/* eslint-disable @next/next/no-html-link-for-pages --
   nav hrefs from nav_items already include the basePath; next/link would double-prefix them. */

import { useEffect, useRef, useState } from "react"
import { ChevronDown, Menu, X } from "lucide-react"
import { HeaderLogo } from "@/components/header-logo"
import type { NavNode } from "@/lib/nav"

/** Public header rendered entirely from nav_items (top-level links + group dropdowns + feature cards). */
export function DbSiteHeader({ nav, logoUrl }: { nav: NavNode[]; logoUrl?: string | null }) {
  const [open, setOpen] = useState<string | null>(null)
  const [mobile, setMobile] = useState(false)
  const ref = useRef<HTMLElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  const enter = (id: string) => { if (timer.current) clearTimeout(timer.current); setOpen(id) }
  const leave = () => { timer.current = setTimeout(() => setOpen(null), 150) }

  const ctas = nav.filter((n) => n.isCta)
  const items = nav.filter((n) => !n.isCta)

  return (
    <header ref={ref} className="sticky top-0 z-50 w-full border-b border-border bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 md:h-20 lg:px-8">
        <a href="/project/football-team" className="flex items-center gap-2">
          <HeaderLogo logoUrl={logoUrl ?? null} />
          <span className="hidden font-heading text-lg font-bold tracking-tight text-ink sm:inline-block">Baltimore Kings</span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1.5 rounded-full border border-border bg-paper/70 p-1.5 lg:flex">
          {items.map((n) =>
            n.children.length > 0 || n.href === null ? (
              <div key={n.id} className="relative" onMouseEnter={() => enter(n.id)} onMouseLeave={leave}>
                <button
                  onClick={() => setOpen(open === n.id ? null : n.id)}
                  className={`inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${open === n.id ? "bg-white text-ink shadow-sm" : "text-muted-foreground hover:bg-white hover:text-ink"}`}
                >
                  {n.label}
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open === n.id ? "rotate-180" : ""}`} />
                </button>
                {open === n.id ? (
                  <div className="absolute left-1/2 top-full z-50 mt-2 w-[min(92vw,640px)] -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-white shadow-xl">
                    <div className="grid grid-cols-1 gap-0 sm:grid-cols-[1fr,auto]">
                      <ul className="grid grid-cols-2 gap-1 p-4">
                        {n.children.map((c) => (
                          <li key={c.href + c.label}>
                            <a href={c.href} className="block rounded-lg px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-paper hover:text-accent">
                              {c.label}
                              {c.description ? <span className="block text-xs font-normal text-muted-foreground">{c.description}</span> : null}
                            </a>
                          </li>
                        ))}
                      </ul>
                      {n.featureCard ? (
                        <a href={n.featureCard.href ?? "#"} className="m-3 hidden w-56 overflow-hidden rounded-xl bg-court text-paper sm:block">
                          {n.featureCard.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={n.featureCard.imageUrl} alt="" className="h-28 w-full object-cover opacity-80" />
                          ) : null}
                          <div className="p-3">
                            <div className="font-heading text-sm">{n.featureCard.title}</div>
                            {n.featureCard.blurb ? <div className="mt-1 text-xs text-paper/70">{n.featureCard.blurb}</div> : null}
                          </div>
                        </a>
                      ) : null}
                    </div>
                  </div>
                ) : null}
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
            {mobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobile ? (
        <div className="border-t border-border bg-white lg:hidden">
          <div className="mx-auto max-w-7xl px-4 py-4">
            {nav.map((n) => (
              <div key={n.id} className="border-b border-border/60 py-2 last:border-0">
                {n.href ? (
                  <a href={n.href} className="block py-1.5 font-heading text-lg text-ink">{n.label}</a>
                ) : (
                  <div className="py-1.5 font-heading text-lg text-ink">{n.label}</div>
                )}
                {n.children.length > 0 ? (
                  <ul className="ml-3 grid gap-0.5">
                    {n.children.map((c) => (
                      <li key={c.href + c.label}><a href={c.href} className="block py-1 text-sm text-muted-foreground">{c.label}</a></li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  )
}
