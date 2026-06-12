"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

function sessionId(): string {
  try {
    let id = sessionStorage.getItem("bk-session")
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36)
      sessionStorage.setItem("bk-session", id)
    }
    return id
  } catch {
    return "unknown"
  }
}

/**
 * First-party analytics beacon for the public site. Records page views on
 * route change and clicks on links/buttons. Insert-only via RLS; coaches see
 * the aggregates on their dashboard.
 */
export function AnalyticsTracker() {
  const pathname = usePathname()

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from("page_views")
      .insert({ path: pathname, event_type: "view", session_id: sessionId() })
      .then(() => {})
  }, [pathname])

  useEffect(() => {
    const supabase = createClient()
    let last = 0
    function onClick(e: MouseEvent) {
      const now = Date.now()
      if (now - last < 300) return
      const el = (e.target as HTMLElement)?.closest?.("a, button")
      if (!el) return
      last = now
      const target =
        el.tagName === "A"
          ? (el as HTMLAnchorElement).getAttribute("href") ?? "link"
          : (el.textContent ?? "button").trim().slice(0, 80)
      supabase
        .from("page_views")
        .insert({ path: window.location.pathname, event_type: "click", target, session_id: sessionId() })
        .then(() => {})
    }
    document.addEventListener("click", onClick, { capture: true })
    return () => document.removeEventListener("click", onClick, { capture: true })
  }, [])

  return null
}
