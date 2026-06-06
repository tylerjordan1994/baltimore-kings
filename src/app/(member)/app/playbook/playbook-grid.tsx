"use client"

import { useState } from "react"

export type Play = { id: string; name: string; kind: string; preview_image_url: string | null }

const KIND_LABEL: Record<string, string> = { formation: "Formations", set_piece: "Set Pieces", play: "Plays" }

export function PlaybookGrid({ plays }: { plays: Play[] }) {
  const [active, setActive] = useState<Play | null>(null)
  const groups = ["formation", "set_piece", "play"].map((k) => ({ kind: k, items: plays.filter((p) => p.kind === k) })).filter((g) => g.items.length)

  if (plays.length === 0) {
    return <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">No plays shared yet. Your coach will publish formations, set pieces, and plays here.</div>
  }

  return (
    <div className="grid gap-8">
      {groups.map((g) => (
        <section key={g.kind}>
          <h2 className="mb-3 font-heading text-xl text-ink">{KIND_LABEL[g.kind] ?? g.kind}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {g.items.map((p) => (
              <button key={p.id} onClick={() => setActive(p)} className="group overflow-hidden rounded-xl border border-border bg-card text-left transition hover:border-accent">
                <div className="aspect-video bg-court">
                  {p.preview_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.preview_image_url} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center font-heading text-3xl text-paper/20">⚽</div>
                  )}
                </div>
                <div className="p-3"><p className="font-medium text-ink">{p.name}</p></div>
              </button>
            ))}
          </div>
        </section>
      ))}

      {active ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setActive(null)}>
          <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="font-heading text-lg text-ink">{active.name}</h3>
              <button onClick={() => setActive(null)} className="text-muted-foreground hover:text-ink">✕</button>
            </div>
            {active.preview_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={active.preview_image_url} alt={active.name} className="max-h-[75vh] w-full object-contain bg-court" />
            ) : <div className="p-12 text-center text-muted-foreground">No preview available.</div>}
          </div>
        </div>
      ) : null}
    </div>
  )
}
