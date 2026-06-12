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
import type {
  Team,
  Profile,
  Prospect,
  ProspectPriority,
} from '@/types/database'

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
      className="flex items-center gap-3 rounded-lg border border-border bg-paper px-3 py-2 cursor-grab active:cursor-grabbing"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-xs font-bold text-white">
        {player.jerseyNumber ?? '?'}
      </div>
      <span className="text-sm text-ink">{player.fullName}</span>
    </div>
  )
}

function PlayerOverlay({ player }: { player: PlayerCard }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-amber-500 bg-white px-3 py-2 shadow-xl">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-xs font-bold text-white">
        {player.jerseyNumber ?? '?'}
      </div>
      <span className="text-sm text-ink">{player.fullName}</span>
    </div>
  )
}

// ── Scouting funnel columns ────────────────────────────────────
const SCOUT_COLUMNS: { key: ProspectPriority; label: string; color: string }[] = [
  { key: 'watch', label: 'Watch', color: 'border-zinc-500/30' },
  { key: 'target', label: 'Target', color: 'border-blue-500/30' },
  { key: 'actively_recruiting', label: 'Actively Recruiting', color: 'border-amber-500/30' },
  { key: 'signed', label: 'Signed', color: 'border-green-500/30' },
  { key: 'passed', label: 'Passed', color: 'border-red-500/30' },
]

export default function RosterPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [teamMembers, setTeamMembers] = useState<Record<string, PlayerCard[]>>({})
  const [allPlayers, setAllPlayers] = useState<Profile[]>([])
  const [activePlayer, setActivePlayer] = useState<PlayerCard | null>(null)
  const [showCreateTeam, setShowCreateTeam] = useState(false)
  const [newTeamName, setNewTeamName] = useState('')
  const [addingToTeam, setAddingToTeam] = useState<string | null>(null)
  const [selectedPlayerId, setSelectedPlayerId] = useState('')

  // Pending approvals (formerly the standalone Approvals page).
  const [pending, setPending] = useState<Profile[]>([])
  const [approvalBusy, setApprovalBusy] = useState<string | null>(null)

  // Scouting funnel (formerly the standalone Scouting page).
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [expandedProspect, setExpandedProspect] = useState<string | null>(null)

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

    const { data: pendingData } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'pending')
      .order('created_at', { ascending: false })

    const { data: prospectsData } = await supabase
      .from('prospects')
      .select('*')
      .order('created_at', { ascending: false })

    if (teamsData) setTeams(teamsData)
    if (playersData) setAllPlayers(playersData)
    if (pendingData) setPending(pendingData)
    if (prospectsData) setProspects(prospectsData as Prospect[])

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

  async function handleDeleteTeam(teamId: string, teamName: string) {
    if (
      !confirm(
        `Delete team "${teamName}"? This removes the team and all of its roster assignments. This cannot be undone.`
      )
    )
      return
    const res = await fetch(`/api/admin/roster`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId }),
    })
    if (!res.ok) { alert(`Could not remove team: ${(await res.json().catch(() => ({}))).error ?? res.statusText}`); return }
    loadData()
  }

  async function handleAddPlayer(teamId: string) {
    if (!selectedPlayerId) return
    const res = await fetch(`/api/admin/roster`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId, profileId: selectedPlayerId }),
    })
    if (!res.ok) { alert(`Could not add player: ${(await res.json().catch(() => ({}))).error ?? res.statusText}`); return }
    setAddingToTeam(null)
    setSelectedPlayerId('')
    loadData()
  }

  async function handleRemovePlayer(teamMemberId: string) {
    const res = await fetch(`/api/admin/roster`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamMemberId }),
    })
    if (!res.ok) { alert(`Could not remove player: ${(await res.json().catch(() => ({}))).error ?? res.statusText}`); return }
    loadData()
  }

  // ── Approvals ──────────────────────────────────────────────────
  async function handleApprove(profileId: string) {
    setApprovalBusy(profileId)
    await fetch(`/api/admin/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId }),
    })
    setApprovalBusy(null)
    loadData()
  }

  async function handleReject(profileId: string) {
    if (
      !confirm(
        'Are you sure you want to reject this account? This will delete their profile.'
      )
    )
      return
    setApprovalBusy(profileId)
    await fetch(`/api/admin/approve`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId }),
    })
    setApprovalBusy(null)
    loadData()
  }

  // ── Scouting funnel ────────────────────────────────────────────
  async function moveProspectPriority(
    prospectId: string,
    newPriority: ProspectPriority
  ) {
    await fetch('/api/admin/scouting', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update_priority',
        id: prospectId,
        priority: newPriority,
      }),
    })
    loadData()
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Roster Manager</h1>
          <p className="text-muted-foreground">
            Approve members, manage teams, and track scouting prospects.
          </p>
        </div>
        <Button onClick={() => setShowCreateTeam(true)}>Create Team</Button>
      </div>

      {/* ── Pending Approvals ──────────────────────────────────── */}
      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">Pending Approvals</h2>
          <p className="text-sm text-muted-foreground">
            Review and approve new member accounts.
          </p>
        </div>
        {pending.length === 0 ? (
          <div className="rounded-xl border border-border bg-white p-6 text-center shadow-sm">
            <p className="text-sm text-muted-foreground">No pending accounts to review.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-paper">
                <tr>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Phone</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Applied</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pending.map((p) => (
                  <tr key={p.id} className="bg-white">
                    <td className="px-4 py-3 text-ink">{p.full_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.phone ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          disabled={approvalBusy === p.id}
                          onClick={() => handleApprove(p.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={approvalBusy === p.id}
                          onClick={() => handleReject(p.id)}
                        >
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Teams ──────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-ink">Teams</h2>
          <p className="text-sm text-muted-foreground">
            Drag players between teams. Players can be on multiple teams.
          </p>
        </div>

        {showCreateTeam && (
          <div className="flex items-center gap-3 rounded-xl border border-border bg-white p-4 shadow-sm">
            <input
              type="text"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="Team name"
              className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-ink placeholder:text-muted-foreground"
            />
            <Button size="sm" onClick={handleCreateTeam}>
              Save
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-ink/80 hover:text-ink"
              onClick={() => setShowCreateTeam(false)}
            >
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
                className="rounded-xl border border-border bg-white p-4 shadow-sm"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold text-ink">{team.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {teamMembers[team.id]?.length ?? 0} players
                    </span>
                    <button
                      onClick={() => handleDeleteTeam(team.id, team.name)}
                      className="rounded px-1.5 py-0.5 text-xs text-muted-foreground hover:bg-red-100 hover:text-red-600"
                      title="Delete team"
                    >
                      Delete
                    </button>
                  </div>
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
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground opacity-0 hover:text-red-600 group-hover:opacity-100"
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
                      className="flex-1 rounded-lg border border-border bg-white px-2 py-1.5 text-xs text-ink"
                    >
                      <option value="">Select player...</option>
                      {allPlayers
                        .filter((p) => !(teamMembers[team.id] ?? []).some((tm) => tm.profileId === p.id))
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.full_name}
                          </option>
                        ))}
                    </select>
                    <Button size="xs" onClick={() => handleAddPlayer(team.id)}>
                      Add
                    </Button>
                    <Button
                      size="xs"
                      variant="ghost"
                      className="text-ink/80 hover:text-ink"
                      onClick={() => setAddingToTeam(null)}
                    >
                      x
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="mt-3 w-full text-ink/80 hover:text-ink"
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
      </section>

      {/* ── Scouting Funnel ────────────────────────────────────── */}
      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">Scouting Funnel</h2>
          <p className="text-sm text-muted-foreground">
            Track prospects through the recruitment pipeline.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          {SCOUT_COLUMNS.map((col) => {
            const colProspects = prospects.filter((p) => p.priority === col.key)
            return (
              <div
                key={col.key}
                className={`rounded-xl border ${col.color} bg-white p-3 shadow-sm`}
              >
                <h3 className="mb-3 text-sm font-semibold text-ink">
                  {col.label}{' '}
                  <span className="text-muted-foreground">({colProspects.length})</span>
                </h3>
                <div className="space-y-2">
                  {colProspects.map((p) => (
                    <div key={p.id}>
                      <div
                        onClick={() =>
                          setExpandedProspect(
                            expandedProspect === p.id ? null : p.id
                          )
                        }
                        className="cursor-pointer rounded-lg border border-border bg-paper p-3 hover:border-zinc-400 transition-colors"
                      >
                        <p className="text-sm font-medium text-ink">
                          {p.full_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {p.position} {p.current_team && `- ${p.current_team}`}
                        </p>
                        {p.event && (
                          <p className="mt-1 text-[10px] text-muted-foreground">
                            Scouted: {p.event}
                          </p>
                        )}
                      </div>
                      {expandedProspect === p.id && (
                        <div className="mt-1 rounded-lg border border-border bg-paper p-3 space-y-2">
                          {p.assessment && (
                            <p className="text-xs text-muted-foreground">
                              {p.assessment}
                            </p>
                          )}
                          {p.contact && (
                            <p className="text-xs text-muted-foreground">
                              Contact: {p.contact}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-1 pt-1">
                            {SCOUT_COLUMNS.filter((c) => c.key !== p.priority).map(
                              (c) => (
                                <button
                                  key={c.key}
                                  onClick={() =>
                                    moveProspectPriority(p.id, c.key)
                                  }
                                  className="rounded bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-700 hover:bg-zinc-200 transition-colors"
                                >
                                  &rarr; {c.label}
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {colProspects.length === 0 && (
                    <p className="text-xs text-muted-foreground">No prospects.</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
