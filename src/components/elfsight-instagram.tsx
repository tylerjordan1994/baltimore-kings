"use client"

import { useEffect } from "react"

const PLATFORM_SRC = "https://elfsightcdn.com/platform.js"

/**
 * Elfsight Instagram feed widget. Elfsight hosts the Instagram integration
 * (no Meta developer app needed); platform.js scans the page for the
 * `elfsight-app-<id>` div and renders the live feed into it. We load the
 * script once and let the widget lazy-init via data-elfsight-app-lazy.
 */
export function ElfsightInstagram({ appId }: { appId: string }) {
  useEffect(() => {
    if (document.querySelector(`script[src="${PLATFORM_SRC}"]`)) {
      // Script already present (e.g. client nav back): ask it to re-scan.
      ;(window as unknown as { eapps?: { Platform?: { reinit?: () => void } } }).eapps?.Platform?.reinit?.()
      return
    }
    const s = document.createElement("script")
    s.src = PLATFORM_SRC
    s.async = true
    document.body.appendChild(s)
  }, [])

  return <div className={`elfsight-app-${appId}`} data-elfsight-app-lazy />
}
