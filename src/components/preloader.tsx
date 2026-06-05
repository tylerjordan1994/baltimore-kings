"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { DotLottieReact, setWasmUrl } from "@lottiefiles/dotlottie-react"

// This app is served under a basePath, so static assets in /public live there too.
const BASE = "/project/football-team"

// Serve the renderer wasm from our own origin instead of the jsdelivr CDN —
// the site's strict CSP only allows connect-src 'self'. Set before any player
// mounts so it never reaches for the (blocked) CDN copy.
setWasmUrl(`${BASE}/dotlottie-player.wasm`)

/* ────────────────────────────────────────────────
   Preloader — full-screen cosmos animation shown on the
   initial load of any page. Once the window has loaded
   (and a minimum on-screen time has elapsed) it leaves:
   the homepage gets a "curtain" wipe-up reveal, every
   other page a quiet fade. Mounted once in the root
   layout, so it only runs on first paint — not on SPA
   navigations (those use the route-level loading.tsx).
   ──────────────────────────────────────────────── */

type Phase = "loading" | "exiting" | "done"

// Let the cosmos animation breathe before we allow it to leave.
const MIN_VISIBLE_MS = 1700
const EXIT_MS_HOME = 950
const EXIT_MS_DEFAULT = 550

export function Preloader() {
  const pathname = usePathname()
  const isHome = pathname === "/"
  const [phase, setPhase] = useState<Phase>("loading")

  // loading → exiting, once the page is loaded + min time met
  useEffect(() => {
    if (phase !== "loading") return
    const start = performance.now()

    const begin = () => {
      const wait = Math.max(0, MIN_VISIBLE_MS - (performance.now() - start))
      window.setTimeout(() => setPhase("exiting"), wait)
    }

    if (document.readyState === "complete") {
      begin()
    } else {
      window.addEventListener("load", begin, { once: true })
      return () => window.removeEventListener("load", begin)
    }
  }, [phase])

  // exiting → done, after the leave transition finishes
  useEffect(() => {
    if (phase !== "exiting") return
    const dur = isHome ? EXIT_MS_HOME : EXIT_MS_DEFAULT
    const t = window.setTimeout(() => setPhase("done"), dur)
    return () => window.clearTimeout(t)
  }, [phase, isHome])

  // lock body scroll while the overlay covers the page
  useEffect(() => {
    if (phase === "done") return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [phase])

  if (phase === "done") return null

  const exiting = phase === "exiting"

  // Homepage leaves with a curtain wipe upward; other pages fade.
  const leaveStyle: React.CSSProperties = exiting
    ? isHome
      ? {
          transform: "translateY(-100%)",
          transition: `transform ${EXIT_MS_HOME}ms cubic-bezier(0.76, 0, 0.24, 1)`,
        }
      : {
          opacity: 0,
          transition: `opacity ${EXIT_MS_DEFAULT}ms ease`,
        }
    : { transform: "translateY(0)", opacity: 1 }

  return (
    <div
      aria-hidden={exiting}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-accent"
      style={{ willChange: "transform, opacity", ...leaveStyle }}
    >
      <div className="w-[min(62vw,260px)]">
        <DotLottieReact src={`${BASE}/cosmos.lottie`} autoplay loop />
      </div>
      <div className="-mt-2 text-center">
        <p className="font-heading text-base tracking-[0.32em] text-brand sm:text-lg">
          BALTIMORE KINGS
        </p>
        <p className="mt-1.5 text-[0.65rem] uppercase tracking-[0.28em] text-brand/70">
          Futsal · Arena Soccer
        </p>
      </div>
    </div>
  )
}
