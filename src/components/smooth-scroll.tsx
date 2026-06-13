"use client"

import { useEffect } from "react"
import Lenis from "lenis"

/**
 * Lenis smooth scrolling for the public marketing site. Mounted only in the
 * (public) layout — the authenticated dashboard keeps native scrolling.
 * Smooths the wheel only (touch stays native), and respects reduced-motion.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 1,
    })

    let raf = 0
    const loop = (time: number) => {
      lenis.raf(time)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
    }
  }, [])

  return null
}
