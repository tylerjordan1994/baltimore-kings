"use client"

import { useLayoutEffect, useRef } from "react"

/**
 * "Baltimore Kings" hero lockup: a thick display serif "Baltimore" set above a
 * large script "Kings". The serif word is letter-spaced at runtime so its
 * rendered width exactly matches the script word below it, at any viewport.
 */
export function HeroLockup() {
  const topRef = useRef<HTMLSpanElement>(null)
  const bottomRef = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const top = topRef.current
    const bottom = bottomRef.current
    if (!top || !bottom) return

    function fit() {
      if (!top || !bottom) return
      // Reset, measure natural widths, then distribute the difference as tracking.
      top.style.letterSpacing = "0px"
      top.style.marginRight = "0px"
      const target = bottom.getBoundingClientRect().width
      const natural = top.getBoundingClientRect().width
      const letters = (top.textContent ?? "").length || 1
      const extra = (target - natural) / letters
      top.style.letterSpacing = `${extra}px`
      // Trailing letter-spacing adds width on the right; pull it back so the
      // word stays optically centered over "Kings".
      top.style.marginRight = `${-extra}px`
    }

    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(bottom)
    // Refit once webfonts finish loading (metrics change when they swap in).
    document.fonts?.ready.then(fit).catch(() => {})
    window.addEventListener("resize", fit)
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", fit)
    }
  }, [])

  return (
    <div className="flex flex-col items-center text-center leading-none">
      <span
        ref={topRef}
        className="font-[family-name:var(--font-serif)] text-2xl uppercase text-paper sm:text-4xl lg:text-5xl"
      >
        Baltimore
      </span>
      <span
        ref={bottomRef}
        className="-mt-1 font-[family-name:var(--font-script)] text-7xl text-accent sm:text-8xl lg:text-[10rem]"
      >
        Kings
      </span>
    </div>
  )
}
