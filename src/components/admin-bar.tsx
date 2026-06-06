"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

const BASE = "/project/football-team"

/**
 * Shopify-style floating admin bar shown on public pages to logged-in coaches.
 * Offers "Edit this page" (when the current URL is a Puck page) plus quick links
 * into the CMS. Rendered only when the server has confirmed a coach session.
 */
export function AdminBar() {
  const pathname = usePathname() // basePath-stripped, e.g. "/club" or "/"
  const [page, setPage] = useState<{ id: string; status: string } | null>(null)
  const [open, setOpen] = useState(true)

  useEffect(() => {
    const slug = pathname === "/" ? "" : pathname.replace(/^\//, "")
    let active = true
    fetch(`${BASE}/api/cms/pages/lookup?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((j) => { if (active) setPage(j.page ?? null) })
      .catch(() => {})
    return () => { active = false }
  }, [pathname])

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="fixed bottom-4 left-4 z-[1000] rounded-full bg-ink px-3 py-2 text-xs font-semibold text-paper shadow-lg">
        ✎ Edit
      </button>
    )
  }

  const link = "shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-colors"
  return (
    <div className="fixed bottom-3 left-1/2 z-[1000] flex max-w-[calc(100vw-1rem)] -translate-x-1/2 items-center gap-1.5 overflow-x-auto rounded-full border border-white/10 bg-ink/95 px-2 py-1.5 text-paper shadow-2xl backdrop-blur [scrollbar-width:none]">
      <span className="shrink-0 px-2 text-[10px] uppercase tracking-widest text-accent">Coach</span>
      {page ? (
        <a href={`${BASE}/app/admin/pages/${page.id}/edit`} className={`${link} bg-accent text-ink hover:bg-accent-light`}>✎ Edit this page</a>
      ) : (
        <a href={`${BASE}/app/admin/pages`} className={`${link} bg-white/10 hover:bg-white/20`}>+ Make this a page</a>
      )}
      <a href={`${BASE}/app/admin/pages`} className={`${link} hover:bg-white/10`}>Pages</a>
      <a href={`${BASE}/app/admin/tokens`} className={`${link} hover:bg-white/10`}>Tokens</a>
      <a href={`${BASE}/app/admin/navigation`} className={`${link} hover:bg-white/10`}>Menu</a>
      <a href={`${BASE}/app`} className={`${link} hover:bg-white/10`}>Dashboard</a>
      <button onClick={() => setOpen(false)} className="ml-1 shrink-0 rounded-full px-2 py-1 text-paper/50 hover:text-paper" aria-label="Hide">✕</button>
    </div>
  )
}
