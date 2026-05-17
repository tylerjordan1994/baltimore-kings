"use client"

import { useCallback, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import type { Tables } from "@/types/database"

type TicketedEvent = Tables<"ticketed_events">

interface FormState {
  id: string | null
  title: string
  description: string
  event_date: string
  venue: string
  price: string
  capacity: string
  is_published: boolean
}

const emptyForm: FormState = {
  id: null,
  title: "",
  description: "",
  event_date: "",
  venue: "",
  price: "",
  capacity: "",
  is_published: false,
}

/** Convert an ISO timestamp to a value usable by <input type="datetime-local">. */
function toLocalInput(iso: string | null): string {
  if (!iso) return ""
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`
}

export default function AdminTicketsPage() {
  const [events, setEvents] = useState<TicketedEvent[]>([])
  const [soldByEvent, setSoldByEvent] = useState<Record<string, number>>({})
  const [form, setForm] = useState<FormState>(emptyForm)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/ticketed-events`)
    const json = await res.json()
    setEvents(json.data ?? [])

    const supabase = createClient()
    const { data: tickets } = await supabase
      .from("tickets")
      .select("ticketed_event_id, quantity")
    const counts: Record<string, number> = {}
    for (const t of tickets ?? []) {
      counts[t.ticketed_event_id] =
        (counts[t.ticketed_event_id] ?? 0) + (t.quantity ?? 1)
    }
    setSoldByEvent(counts)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function startCreate() {
    setForm(emptyForm)
    setError(null)
    setShowForm(true)
  }

  function startEdit(event: TicketedEvent) {
    setForm({
      id: event.id,
      title: event.title,
      description: event.description ?? "",
      event_date: toLocalInput(event.event_date),
      venue: event.venue ?? "",
      price: (event.price_cents / 100).toFixed(2),
      capacity: event.capacity != null ? String(event.capacity) : "",
      is_published: event.is_published,
    })
    setError(null)
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.title.trim()) {
      setError("Title is required.")
      return
    }
    setSaving(true)
    setError(null)
    const payload = {
      ...(form.id ? { id: form.id } : {}),
      title: form.title.trim(),
      description: form.description.trim() || null,
      event_date: form.event_date
        ? new Date(form.event_date).toISOString()
        : null,
      venue: form.venue.trim() || null,
      price_cents: Math.round((parseFloat(form.price) || 0) * 100),
      capacity: form.capacity ? parseInt(form.capacity, 10) : null,
      is_published: form.is_published,
    }
    const res = await fetch(`/api/admin/ticketed-events`, {
      method: form.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const json = await res.json()
    setSaving(false)
    if (!res.ok) {
      setError(json.error ?? "Failed to save event.")
      return
    }
    setShowForm(false)
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this event? Existing tickets will remain.")) return
    await fetch(`/api/admin/ticketed-events`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    load()
  }

  const inputClass =
    "h-9 w-full rounded border border-zinc-700 bg-zinc-800 px-3 text-sm text-white placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Ticketed Events</h1>
          <p className="mt-1 text-zinc-400">
            Create events, set prices, and track ticket sales.
          </p>
        </div>
        <Button onClick={startCreate}>New Event</Button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">
            {form.id ? "Edit Event" : "New Event"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs text-zinc-500">Title</label>
              <input
                className={inputClass}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Kings MASL3 vs York Cannons"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs text-zinc-500">
                Description
              </label>
              <textarea
                className="min-h-16 w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">
                Date &amp; time
              </label>
              <input
                type="datetime-local"
                className={inputClass}
                value={form.event_date}
                onChange={(e) =>
                  setForm({ ...form, event_date: e.target.value })
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Venue</label>
              <input
                className={inputClass}
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">
                Price (USD)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                className={inputClass}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="12.00"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">
                Capacity (optional)
              </label>
              <input
                type="number"
                min="0"
                className={inputClass}
                value={form.capacity}
                onChange={(e) =>
                  setForm({ ...form, capacity: e.target.value })
                }
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) =>
                  setForm({ ...form, is_published: e.target.checked })
                }
              />
              Published (visible on public tickets page)
            </label>
          </div>
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
          <div className="mt-4 flex gap-2">
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Event"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {events.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center">
          <p className="text-zinc-400">No ticketed events yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const sold = soldByEvent[event.id] ?? 0
            return (
              <div
                key={event.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">
                      {event.title}
                    </h3>
                    {event.is_published ? (
                      <span className="rounded bg-green-900/50 px-1.5 py-0.5 text-xs text-green-400">
                        Published
                      </span>
                    ) : (
                      <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-500">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {event.event_date
                      ? new Date(event.event_date).toLocaleString()
                      : "Date TBA"}
                    {event.venue ? ` · ${event.venue}` : ""}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    ${(event.price_cents / 100).toFixed(2)} · {sold} sold
                    {event.capacity ? ` / ${event.capacity}` : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startEdit(event)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(event.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
