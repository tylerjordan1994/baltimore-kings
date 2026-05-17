"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

interface TicketData {
  ticket: {
    ticket_code: string
    quantity: number
    purchaser_name: string | null
  }
  event: { title: string; event_date: string | null; venue: string | null } | null
}

export function TicketSuccess({ sessionId }: { sessionId: string | null }) {
  const [data, setData] = useState<TicketData | null>(null)
  const [status, setStatus] = useState<"loading" | "ready" | "pending">(
    "loading"
  )

  useEffect(() => {
    if (!sessionId) {
      setStatus("pending")
      return
    }
    let cancelled = false
    let attempts = 0

    async function poll() {
      attempts++
      try {
        const res = await fetch(
          `/api/tickets/lookup?session_id=${encodeURIComponent(sessionId!)}`
        )
        const json = await res.json()
        if (cancelled) return
        if (json.data) {
          setData(json.data)
          setStatus("ready")
          return
        }
      } catch {
        // retry below
      }
      if (attempts >= 8) {
        if (!cancelled) setStatus("pending")
        return
      }
      setTimeout(poll, 2000)
    }
    poll()
    return () => {
      cancelled = true
    }
  }, [sessionId])

  return (
    <div className="rounded-2xl border border-border bg-white p-8 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl text-green-600">
        ✓
      </div>
      <h1 className="mt-4 font-heading text-2xl font-bold text-ink">
        Payment successful
      </h1>

      {status === "loading" && (
        <p className="mt-2 text-sm text-muted-foreground">
          Confirming your ticket...
        </p>
      )}

      {status === "pending" && (
        <p className="mt-2 text-sm text-muted-foreground">
          Your payment went through. Your ticket confirmation will arrive by
          email shortly.
        </p>
      )}

      {status === "ready" && data && (
        <div className="mt-5">
          <p className="text-sm text-muted-foreground">
            {data.event?.title}
          </p>
          <div className="mt-3 rounded-xl border border-dashed border-accent/40 bg-accent/5 p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Ticket Code
            </p>
            <p className="mt-1 font-heading text-3xl font-bold tracking-widest text-ink">
              {data.ticket.ticket_code}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {data.ticket.quantity} ticket
              {data.ticket.quantity > 1 ? "s" : ""}
              {data.ticket.purchaser_name
                ? ` · ${data.ticket.purchaser_name}`
                : ""}
            </p>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Show this code at the gate. A copy has been sent to your email.
          </p>
        </div>
      )}

      <Link
        href="/tickets"
        className="mt-6 inline-flex items-center rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-brand/90"
      >
        Back to tickets
      </Link>
    </div>
  )
}
