"use client"

import { useState } from "react"

export function NewsletterSignup() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    setStatus("loading")
    setErrorMsg("")

    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    })

    if (res.ok) {
      setStatus("success")
      setEmail("")
    } else {
      const data = await res.json().catch(() => ({}))
      setErrorMsg(data.error || "Something went wrong")
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        <p className="text-lg font-semibold text-amber-400">You&apos;re in.</p>
        <p className="mt-1 text-sm text-zinc-400">Check your inbox for updates from Baltimore Kings.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-white">Stay in the loop</h3>
      <p className="mt-1 text-sm text-zinc-400">Get news, match updates, and announcements.</p>
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          required
          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-lg bg-amber-500 px-5 py-2 text-sm font-medium text-black hover:bg-amber-400 disabled:opacity-50 transition-colors"
        >
          {status === "loading" ? "..." : "Subscribe"}
        </button>
      </form>
      {status === "error" && (
        <p className="mt-2 text-xs text-red-400">{errorMsg}</p>
      )}
    </div>
  )
}
