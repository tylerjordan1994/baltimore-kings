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

    const res = await fetch("/project/football-team/api/newsletter", {
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
      <div className="rounded-xl border border-border bg-white p-6">
        <p className="text-lg font-semibold text-brand">You&apos;re in.</p>
        <p className="mt-1 text-sm text-muted-foreground">Check your inbox for updates from Baltimore Kings.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-white p-6">
      <h3 className="text-lg font-semibold text-ink">Stay in the loop</h3>
      <p className="mt-1 text-sm text-muted-foreground">Get news, match updates, and announcements.</p>
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          required
          className="flex-1 rounded-lg border border-border bg-white px-4 py-2 text-sm text-ink placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-lg bg-brand px-5 py-2 text-sm font-medium text-paper hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {status === "loading" ? "..." : "Subscribe"}
        </button>
      </form>
      {status === "error" && (
        <p className="mt-2 text-xs text-destructive">{errorMsg}</p>
      )}
    </div>
  )
}
