"use client"

import { useMemo, useState } from "react"
import {
  useTacticsStore,
  FUTSAL_POSITIONS,
  MASL_POSITIONS,
} from "@/lib/stores/tactics-store"
import { Button } from "@/components/ui/button"

export interface RosterPlayer {
  id: string
  full_name: string
  photo_url: string | null
}

interface AddPlayerPanelProps {
  roster: RosterPlayer[]
}

/** Stagger new home tokens across the left half of the court. */
function nextHomeSpot(count: number): { x: number; y: number } {
  const col = count % 3
  const row = Math.floor(count / 3)
  return { x: 0.12 + col * 0.1, y: 0.22 + row * 0.16 }
}

export function AddPlayerPanel({ roster }: AddPlayerPanelProps) {
  const addPlayer = useTacticsStore((s) => s.addPlayer)
  const players = useTacticsStore((s) => s.players)
  const fieldType = useTacticsStore((s) => s.fieldType)

  const [search, setSearch] = useState("")
  const [position, setPosition] = useState("")

  const positions =
    fieldType === "futsal_rounded" ? FUTSAL_POSITIONS : MASL_POSITIONS

  const homeCount = players.filter(
    (p) => p.team === "home" && p.tokenType !== "ball"
  ).length

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const placedProfileIds = new Set(
      players.map((p) => p.profileId).filter(Boolean)
    )
    return roster
      .filter((r) => !placedProfileIds.has(r.id))
      .filter((r) => !q || r.full_name.toLowerCase().includes(q))
  }, [roster, search, players])

  function addRosterPlayer(r: RosterPlayer) {
    const spot = nextHomeSpot(homeCount)
    addPlayer({
      id: crypto.randomUUID(),
      x: spot.x,
      y: spot.y,
      name: r.full_name,
      team: "home",
      tokenType: "player",
      profileId: r.id,
      photoUrl: r.photo_url,
    })
  }

  function addPositionToken() {
    const pos = position || positions[0]
    const spot = nextHomeSpot(homeCount)
    addPlayer({
      id: crypto.randomUUID(),
      x: spot.x,
      y: spot.y,
      name: pos,
      team: "home",
      tokenType: "player",
      position: pos,
      profileId: null,
    })
  }

  return (
    <div className="hidden rounded-lg border border-border bg-white shadow-sm p-4 md:block">
      <h3 className="mb-3 text-sm font-semibold text-ink/80">
        Add Players to Board
      </h3>

      <div className="grid gap-5 sm:grid-cols-2">
        {/* Generic position token */}
        <div>
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">
            Generic position token
          </p>
          <div className="flex items-center gap-2">
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="h-8 flex-1 rounded border border-border bg-white px-2 text-sm text-ink"
            >
              {positions.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
            <Button size="sm" onClick={addPositionToken}>
              Add token
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Opponent tokens are placed automatically. Drag any token to
            reposition it; numbers are intentionally hidden.
          </p>
        </div>

        {/* Roster picker */}
        <div>
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">
            From roster
          </p>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search players..."
            className="mb-2 h-8 w-full rounded border border-border bg-white px-2 text-sm text-ink placeholder:text-muted-foreground focus:border-blue-500 focus:outline-none"
          />
          <div className="max-h-52 space-y-1 overflow-y-auto pr-1">
            {filtered.length === 0 && (
              <p className="py-3 text-center text-xs text-muted-foreground">
                {roster.length === 0
                  ? "No roster players found."
                  : "All players placed."}
              </p>
            )}
            {filtered.map((r) => (
              <button
                key={r.id}
                onClick={() => addRosterPlayer(r)}
                className="flex w-full items-center gap-2 rounded border border-border bg-paper px-2 py-1.5 text-left text-sm text-ink transition hover:border-zinc-300 hover:bg-zinc-100"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-200 text-xs">
                  {r.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.photo_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    r.full_name.charAt(0)
                  )}
                </span>
                <span className="truncate">{r.full_name}</span>
                <span className="ml-auto text-xs text-muted-foreground">Add</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {players.length > 0 && (
        <div className="mt-4 border-t border-border pt-3">
          <p className="mb-2 text-xs text-muted-foreground">
            On board ({players.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {players.map((p) => (
              <span
                key={p.id}
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                  p.tokenType === "ball"
                    ? "bg-zinc-100 text-zinc-700"
                    : p.team === "home"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-red-100 text-red-700"
                }`}
              >
                {p.tokenType === "ball" ? "Ball" : p.position || p.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
