// Keep a slow or unreachable database from stalling server rendering.
//
// Two things would otherwise hang a page for several seconds when Supabase is
// unreachable:
//   1. A request that never responds (no per-request timeout).
//   2. Next.js automatically RETRIES a fetch that rejects (1 try + 3 retries),
//      with backoff between attempts — so even fast-failing requests stack up
//      into multi-second delays before the render gives up.
//
// So instead of letting the request reject (which triggers Next's retries) or
// hang, we cap it with a timer and, on any failure, resolve to an empty 200
// response. The Supabase client then reads it as an empty result and callers
// fall back to their empty/placeholder state. A healthy backend responds well
// within the cap, so this path only runs when something is actually wrong.
export const SUPABASE_FETCH_TIMEOUT_MS = 1500

function emptyResponse(): Response {
  return new Response("[]", {
    status: 200,
    headers: { "content-type": "application/json" },
  })
}

export function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const controller = new AbortController()
  let timer: ReturnType<typeof setTimeout>

  const timeout = new Promise<Response>((resolve) => {
    timer = setTimeout(() => {
      controller.abort() // best-effort cancel of the underlying socket
      resolve(emptyResponse())
    }, SUPABASE_FETCH_TIMEOUT_MS)
  })

  const request = fetch(input, { ...init, signal: controller.signal }).catch(
    () => emptyResponse(),
  )

  return Promise.race([request, timeout]).finally(() => clearTimeout(timer))
}
