import DOMPurify from "isomorphic-dompurify"

// Approved embed providers. Any iframe with another host is dropped; scripts are
// stripped (DOMPurify default). CSP frame-src is the second line of defence.
const EMBED_HOSTS = [
  "instagram.com", "www.instagram.com", "facebook.com", "www.facebook.com",
  "youtube.com", "www.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com",
  "google.com", "www.google.com", "maps.google.com",
]

DOMPurify.addHook("uponSanitizeElement", (node, data) => {
  if (data.tagName === "iframe") {
    const el = node as unknown as Element
    const src = el.getAttribute?.("src") ?? ""
    let ok = false
    try { ok = EMBED_HOSTS.includes(new URL(src).host) } catch { ok = false }
    if (!ok) el.parentNode?.removeChild(el)
  }
})

/** Sanitize coach-authored embed HTML: strip scripts, keep only allowlisted iframes. */
export function sanitizeEmbed(html: string): string {
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling", "loading"],
  })
}
