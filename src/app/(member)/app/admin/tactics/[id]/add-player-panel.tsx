"use client"

import { useState } from "react"
import { useTacticsStore } from "@/lib/stores/tactics-store"
import { Button } from "@/components/ui/button"

export function AddPlayerPanel() {
  const addPlayer = useTacticsStore((s) => s.addPlayer)
  const players = useTacticsStore((s) => s.players)

  const [name, setName] = useState("")
  const [jerseyNumber, setJerseyNumber] = useState("")
  const [team, setTeam] = useState<"home" | "away">("home")

  function handleAdd() {
    if (!name.trim() || !jerseyNumber) return

    // Place new players in a grid pattern
    const homeCount = players.filter((p) => p.team === team).length
    const baseX = team === "home" ? 0.2 : 0.8
    const row = Math.floor(homeCount / 3)
    const col = homeCount % 3

    addPlayer({
      id: crypto.randomUUID(),
      name: name.trim(),
      jerseyNumber: parseInt(jerseyNumber, 10),
      team,
      x: baseX + col * 0.08 - 0.08,
      y: 0.25 + row * 0.15,
    })

    setName("")
    setJerseyNumber("")
  }

  return (
    <div className="hidden rounded-lg border border-zinc-800 bg-zinc-900 p-4 md:block">
      <h3 className="mb-3 text-sm font-semibold text-zinc-300">
        Add Player to Board
      </h3>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs text-zinc-500">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Player name"
            className="h-8 w-40 rounded border border-zinc-700 bg-zinc-800 px-2 text-sm text-white placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-zinc-500">Number</label>
          <input
            type="number"
            value={jerseyNumber}
            onChange={(e) => setJerseyNumber(e.target.value)}
            placeholder="#"
            min="0"
            max="99"
            className="h-8 w-16 rounded border border-zinc-700 bg-zinc-800 px-2 text-sm text-white placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-zinc-500">Team</label>
          <select
            value={team}
            onChange={(e) => setTeam(e.target.value as "home" | "away")}
            className="h-8 rounded border border-zinc-700 bg-zinc-800 px-2 text-sm text-white"
          >
            <option value="home">Home</option>
            <option value="away">Away</option>
          </select>
        </div>
        <Button size="sm" onClick={handleAdd}>
          Add
        </Button>
      </div>

      {/* Current players list */}
      {players.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs text-zinc-500">
            Players on board ({players.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {players.map((p) => (
              <span
                key={p.id}
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
                  p.team === "home"
                    ? "bg-blue-900/40 text-blue-300"
                    : "bg-zinc-700 text-zinc-300"
                }`}
              >
                #{p.jerseyNumber} {p.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
