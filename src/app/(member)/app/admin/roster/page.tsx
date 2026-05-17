'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import type { Team, Profile, TeamMember } from '@/types/database'

// basePath handled by next.config.ts

interface PlayerCard {
  id: string
  teamMemberId: string
  profileId: string
  fullName: string
  jerseyNumber: number | null
  photoUrl: string | null
}

function SortablePlayerCard({ player }: { player: PlayerCard }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: `${player.teamMemberId}` })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center gap-3 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 cursor-grab active:cursor-grabbing"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-xs font-bold text-white">
        {player.jerseyNumber ?? '?'}
      </div>
      <span className="text-sm text-white">{player.fullName}</span>
    </div>
  )
}

function PlayerOverlay({ player }: { player: PlayerCard }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-amber-500 bg-zinc-800 px-3 py-2 shadow-xl">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-xs font-bold text-white">
        {player.jerseyNumber ?? '?'}
      </div>
      <span className="text-sm text-white">{player.fullName}</span>
    </div>
  )
}

export default function RosterPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [teamMembers, setTeamMembers] = useState<Record<string, PlayerCard[]>>({})
  const [allPlayers, setAllPlayers] = useState<Profile[]>([])
  const [activePlayer, setActivePlayer] = useState<PlayerCard | null>(null)
  const [showCreateTeam, setShowCreateTeam] = useState(false)
  const [newTeamName, setNewTeamName] = useState('')
  const [addingToTeam, setAddingToTeam] = useState<string | null>(null)
  const [selectedPlayerId, setSelectedPlayerId] = useState('')

  const supabase = createClient()

  const loadData = useCallback(async () => {
    const { data: teamsData } = await supabase
      .from('teams')
      .select('*')
      .eq('is_active', true)
      .order('name')

    const { data: membersData } = await supabase
      .from('team_members')
      .select('*, profiles(*)')

    const { data: playersData } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['player', 'coach', 'superadmin'])
      .order('full_name')

    if (teamsData) setTeams(teamsData)
    if (playersData) setAllPlayers(playersData)

    if (teamsData && membersData) {
      const grouped: Record<string, PlayerCard[]> = {}
      for (const team of teamsData) {
        grouped[team.id] = membersData
          .filter((m) => m.team_id === team.id)
          .map((m) => ({
            id: m.profile_id,
            teamMemberId: m.id,
            profileId: m.profile_id,
            fullName: m.profiles?.full_name ?? 'Unknown',
            jerseyNumber: m.jersey_number_for_team ?? m.profiles?.jersey_number ?? null,
            photoUrl: m.profiles?.photo_url ?? null,
          }))
      }
      setTeamMembers(grouped)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadData()
  }, [loadData])

  function handleDragStart(event: DragStartEvent) {
    const teamMemberId = event.active.id as string
    for (const players of Object.values(teamMembers)) {
      const found = players.find((p) => p.teamMemberId === teamMemberId)
      if (found) {
        setActivePlayer(found)
        break
      }
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActivePlayer(null)
    const { active, over } = event
    if (!over) return

    const teamMemberId = active.id as string
    const targetTeamId = over.id as string

    // Find which team the player is from
    let sourceTeamId: string | null = null
    let player: PlayerCard | null = null
    for (const [teamId, players] of Object.entries(teamMembers)) {
      const found = players.find((p) => p.teamMemberId === teamMemberId)
      if (found) {
        sourceTeamId = teamId
        player = found
        break
      }
    }

    if (!player || sourceTeamId === targetTeamId) return
    if (!teams.find((t) => t.id === targetTeamId)) return

    // Add player to new team (doesn't remove from origin)
    await fetch(`/api/admin/roster`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teamId: targetTeamId,
        profileId: player.profileId,
      }),
    })

    loadData()
  }

  async function handleCreateTeam() {
    if (!newTeamName.trim()) return
    await supabase.from('teams').insert({
      name: newTeamName.trim(),
      slug: newTeamName.trim().toLowerCase().replace(/\s+/g, '-'),
      league: 'masl3',
      field_type: 'masl_rounded_extra_player',
      is_active: true,
    })
    setNewTeamName('')
    setShowCreateTeam(false)
    loadData()
  }

  async function handleAddPlayer(teamId: string) {
    if (!selectedPlayerId) return
    await fetch(`/api/admin/roster`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId, profileId: selectedPlayerId }),
    })
    setAddingToTeam(null)
    setSelectedPlayerId('')
    loadData()
  }

  async function handleRemovePlayer(teamMemberId: string) {
    await fetch(`/api/admin/roster`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamMemberId }),
    })
    loadData()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Roster Manager</h1>
          <p className="text-zinc-400">
            Drag players between teams. Players can be on multiple teams.
          </p>
        </div>
        <Button onClick={() => setShowCreateTeam(true)}>Create Team</Button>
      </div>

      {showCreateTeam && (
        <div className="flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-900 p-4">
          <input
            type="text"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            placeholder="Team name"
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500"
          />
          <Button size="sm" onClick={handleCreateTeam}>
            Save
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShowCreateTeam(false)}>
            Cancel
          </Button>
        </div>
      )}

      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {teams.map((team) => (
            <div
              key={team.id}
              id={team.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold text-white">{team.name}</h2>
                <span className="text-xs text-zinc-500">
                  {teamMembers[team.id]?.length ?? 0} players
                </span>
              </div>

              <SortableContext
                items={(teamMembers[team.id] ?? []).map((p) => p.teamMemberId)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2" data-team-id={team.id}>
                  {(teamMembers[team.id] ?? []).map((player) => (
                    <div key={player.teamMemberId} className="group relative">
                      <SortablePlayerCard player={player} />
                      <button
                        onClick={() => handleRemovePlayer(player.teamMemberId)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-600 opacity-0 hover:text-red-400 group-hover:opacity-100"
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              </SortableContext>

              {addingToTeam === team.id ? (
                <div className="mt-3 flex items-center gap-2">
                  <select
                    value={selectedPlayerId}
                    onChange={(e) => setSelectedPlayerId(e.target.value)}
                    className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-xs text-white"
                  >
                    <option value="">Select player...</option>
                    {allPlayers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.full_name}
                      </option>
                    ))}
                  </select>
                  <Button size="xs" onClick={() => handleAddPlayer(team.id)}>
                    Add
                  </Button>
                  <Button size="xs" variant="ghost" onClick={() => setAddingToTeam(null)}>
                    x
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="mt-3 w-full"
                  onClick={() => setAddingToTeam(team.id)}
                >
                  + Add Player
                </Button>
              )}
            </div>
          ))}
        </div>

        <DragOverlay>
          {activePlayer ? <PlayerOverlay player={activePlayer} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
