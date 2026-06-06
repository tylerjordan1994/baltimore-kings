// Dependency-free embed sanitizer. (DOMPurify/jsdom can't load on Vercel's
// serverless runtime — ERR_REQUIRE_ESM from jsdom — so we sanitize with targeted
// string passes that run identically on server and client. The CSP
// frame-src/script-src allowlist is the second line of defence.)

// Approved embed providers; any iframe with another host is dropped.
const EMBED_HOSTS = [
  "instagram.com", "www.instagram.com", "facebook.com", "www.facebook.com",
  "youtube.com", "www.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com",
  "google.com", "www.google.com", "maps.google.com",
]

/** Strip scripts, inline event handlers, javascript: URLs, and non-allowlisted iframes. */
export function sanitizeEmbed(html: string): string {
  if (!html) return ""
  let out = html

  // <script>…</script> and bare/self-closing <script …>
  out = out.replace(/<script[\s\S]*?<\/script\s*>/gi, "")
  out = out.replace(/<script\b[^>]*>/gi, "")

  // inline event handlers: onclick="…", onerror='…', onload=…
  out = out.replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")

  // javascript: in href/src
  out = out.replace(/\s(?:href|src)\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, "")

  // drop iframes whose src host isn't allowlisted (keep the rest verbatim)
  out = out.replace(/<iframe\b[^>]*>(?:[\s\S]*?<\/iframe\s*>)?/gi, (tag) => {
    const m = tag.match(/\ssrc\s*=\s*["']([^"']+)["']/i)
    if (!m) return ""
    try {
      return EMBED_HOSTS.includes(new URL(m[1]).host) ? tag : ""
    } catch {
      return ""
    }
  })

  return out
}
