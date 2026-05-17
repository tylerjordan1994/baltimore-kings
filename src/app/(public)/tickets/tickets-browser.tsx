"use client"

import { useState } from "react"
import type { Tables } from "@/types/database"

type TicketedEvent = Tables<"ticketed_events">

function formatDate(value: string | null): string {
  if (!value) return "Date TBA"
  return new Date(value).toLocaleString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function TicketsBrowser({ events }: { events: TicketedEvent[] }) {
  const [active, setActive] = useState<TicketedEvent | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function openBuy(event: TicketedEvent) {
    setActive(event)
    setName("")
    setEmail("")
    setQuantity(1)
    setError(null)
  }

  async function handleCheckout() {
    if (!active) return
    if (!name.trim() || !email.trim()) {
      setError("Please enter your name and email.")
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/tickets/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketed_event_id: active.id,
          purchaser_name: name.trim(),
          purchaser_email: email.trim(),
          quantity,
        }),
      })
      const json = await res.json()
      if (json.url) {
        window.location.href = json.url
      } else {
        setError(json.error ?? "Could not start checkout.")
        setSubmitting(false)
      }
    } catch {
      setError("Could not start checkout. Please try again.")
      setSubmitting(false)
    }
  }

  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-white p-12 text-center">
        <p className="text-muted-foreground">
          No events on sale right now. Check back soon!
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2">
        {events.map((event) => (
          <div
            key={event.id}
            className="flex flex-col overflow-hidden rounded-2xl border border-border bg-white"
          >
            {event.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={event.image_url}
                alt={event.title}
                className="h-44 w-full object-cover"
              />
            )}
            <div className="flex flex-1 flex-col p-6">
              <h2 className="font-heading text-xl font-bold text-ink">
                {event.title}
              </h2>
              <p className="mt-1 text-sm font-medium text-accent">
                {formatDate(event.event_date)}
              </p>
              {event.venue && (
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {event.venue}
                </p>
              )}
              {event.description && (
                <p className="mt-3 text-sm text-muted-foreground">
                  {event.description}
                </p>
              )}
              <div className="mt-auto flex items-center justify-between pt-5">
                <span className="text-2xl font-bold text-ink">
                  ${(event.price_cents / 100).toFixed(2)}
                </span>
                <button
                  onClick={() => openBuy(event)}
                  className="inline-flex items-center rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-brand/90"
                >
                  Buy Tickets
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !submitting && setActive(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-border bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-heading text-lg font-bold text-ink">
              {active.title}
            </h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {formatDate(active.event_date)}
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-ink">
                  Full name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-paper px-3 text-sm text-ink outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-paper px-3 text-sm text-ink outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink">
                  Quantity
                </label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="h-10 w-full rounded-lg border border-border bg-paper px-3 text-sm text-ink outline-none focus:border-accent"
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-xl font-bold text-ink">
                ${((active.price_cents * quantity) / 100).toFixed(2)}
              </span>
            </div>

            {error && (
              <p className="mt-3 text-sm text-red-600">{error}</p>
            )}

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setActive(null)}
                disabled={submitting}
                className="flex-1 rounded-full border border-border px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-paper disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckout}
                disabled={submitting}
                className="flex-1 rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-brand/90 disabled:opacity-50"
              >
                {submitting ? "Redirecting..." : "Continue to payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
