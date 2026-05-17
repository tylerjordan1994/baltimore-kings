'use client'

import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import type { Achievement, Profile, Team, TeamMember } from '@/types/database'

const achievementSchema = z.object({
  kind: z.enum(['club', 'player']),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  achievement_date: z.string().optional(),
  season: z.string().optional(),
  profile_id: z.string().optional(),
})

type AchievementForm = z.infer<typeof achievementSchema>

type AssignMode = 'individual' | 'group'

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [players, setPlayers] = useState<Profile[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [assignMode, setAssignMode] = useState<AssignMode>('individual')
  const [selectedTeamId, setSelectedTeamId] = useState<string>('')
  const [groupMembers, setGroupMembers] = useState<Profile[]>([])
  const [filterPlayer, setFilterPlayer] = useState<string>('')
  const [filterTeam, setFilterTeam] = useState<string>('')

  const supabase = createClient()

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<AchievementForm>({
    resolver: zodResolver(achievementSchema),
    defaultValues: { kind: 'player' },
  })

  const kind = watch('kind')

  const loadData = useCallback(async () => {
    const { data: achievementsData } = await supabase
      .from('achievements')
      .select('*, profiles(*)')
      .order('created_at', { ascending: false })

    const { data: playersData } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['player', 'coach', 'superadmin'])
      .order('full_name')

    const { data: teamsData } = await supabase
      .from('teams')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (achievementsData) setAchievements(achievementsData)
    if (playersData) setPlayers(playersData)
    if (teamsData) setTeams(teamsData)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadData()
  }, [loadData])

  // When a team is selected in group mode, load its members
  async function handleTeamSelect(teamId: string) {
    setSelectedTeamId(teamId)
    if (!teamId) {
      setGroupMembers([])
      return
    }
    const { data } = await supabase
      .from('team_members')
      .select('*, profiles(*)')
      .eq('team_id', teamId)

    if (data) {
      const members = data
        .map((tm: TeamMember) => tm.profiles)
        .filter(Boolean) as Profile[]
      setGroupMembers(members)
    }
  }

  function removeGroupMember(profileId: string) {
    setGroupMembers((prev) => prev.filter((p) => p.id !== profileId))
  }

  async function onSubmit(data: AchievementForm) {
    const basePayload = {
      kind: data.kind,
      title: data.title,
      description: data.description || null,
      achievement_date: data.achievement_date || null,
      season: data.season || null,
    }

    if (editingId) {
      // Edit mode — single update
      await supabase.from('achievements').update({
        ...basePayload,
        profile_id: data.kind === 'player' ? data.profile_id || null : null,
      }).eq('id', editingId)
    } else if (assignMode === 'group' && groupMembers.length > 0) {
      // Group assignment — insert one per member
      const inserts = groupMembers.map((member) => ({
        ...basePayload,
        profile_id: member.id,
      }))
      await supabase.from('achievements').insert(inserts)
    } else {
      // Individual assignment
      await supabase.from('achievements').insert({
        ...basePayload,
        profile_id: data.kind === 'player' ? data.profile_id || null : null,
      })
    }

    reset()
    setShowForm(false)
    setEditingId(null)
    setAssignMode('individual')
    setGroupMembers([])
    setSelectedTeamId('')
    loadData()
  }

  function handleEdit(a: Achievement) {
    setEditingId(a.id)
    setAssignMode('individual')
    setValue('kind', a.kind)
    setValue('title', a.title)
    setValue('description', a.description ?? '')
    setValue('achievement_date', a.achievement_date ?? '')
    setValue('season', a.season ?? '')
    setValue('profile_id', a.profile_id ?? '')
    setShowForm(true)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this achievement?')) return
    await supabase.from('achievements').delete().eq('id', id)
    loadData()
  }

  // Filtering
  const filteredAchievements = achievements.filter((a) => {
    if (filterPlayer && a.profile_id !== filterPlayer) return false
    if (filterTeam) {
      // We cannot easily filter by team in-memory without team_members join, so skip for now
      // This would need server-side logic; for now filter by player only
    }
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Achievements</h1>
          <p className="text-muted-foreground">Manage club and player achievements. Assign individually or to an entire team.</p>
        </div>
        <Button onClick={() => { reset(); setEditingId(null); setShowForm(!showForm); setAssignMode('individual'); setGroupMembers([]); setSelectedTeamId('') }}>
          {showForm ? 'Cancel' : 'Add Achievement'}
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 rounded-xl border border-border bg-card p-6"
        >
          {/* Assignment mode toggle (only for new, not edit) */}
          {!editingId && (
            <div className="flex gap-2">
              <Button
                type="button"
                variant={assignMode === 'individual' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAssignMode('individual')}
              >
                Individual
              </Button>
              <Button
                type="button"
                variant={assignMode === 'group' ? 'default' : 'outline'}
                size="sm"
                onClick={() => { setAssignMode('group'); setValue('kind', 'player') }}
              >
                Group (Team)
              </Button>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {assignMode === 'individual' && (
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Kind</label>
                <select
                  {...register('kind')}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
                >
                  <option value="club">Club</option>
                  <option value="player">Player</option>
                </select>
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Title</label>
              <input
                {...register('title')}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
              />
              {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Date</label>
              <input
                type="date"
                {...register('achievement_date')}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Season</label>
              <input
                {...register('season')}
                placeholder="e.g. 2025-26"
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
              />
            </div>

            {/* Individual player picker */}
            {assignMode === 'individual' && kind === 'player' && (
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Player</label>
                <select
                  {...register('profile_id')}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
                >
                  <option value="">Select player...</option>
                  {players.map((p) => (
                    <option key={p.id} value={p.id}>{p.full_name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Group: team picker */}
            {assignMode === 'group' && !editingId && (
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Team</label>
                <select
                  value={selectedTeamId}
                  onChange={(e) => handleTeamSelect(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
                >
                  <option value="">Select team...</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Group members list */}
          {assignMode === 'group' && groupMembers.length > 0 && (
            <div>
              <label className="mb-2 block text-xs font-medium text-muted-foreground">
                Assigning to {groupMembers.length} player{groupMembers.length !== 1 ? 's' : ''}:
              </label>
              <div className="flex flex-wrap gap-2">
                {groupMembers.map((m) => (
                  <span
                    key={m.id}
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground"
                  >
                    {m.full_name}
                    <button
                      type="button"
                      onClick={() => removeGroupMember(m.id)}
                      className="ml-1 text-muted-foreground hover:text-red-400"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
            />
          </div>

          <Button type="submit">{editingId ? 'Update' : assignMode === 'group' ? `Assign to ${groupMembers.length} Players` : 'Create'}</Button>
        </form>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filterPlayer}
          onChange={(e) => setFilterPlayer(e.target.value)}
          className="h-8 rounded-lg border border-border bg-card px-3 text-xs text-foreground"
        >
          <option value="">All players</option>
          {players.map((p) => (
            <option key={p.id} value={p.id}>{p.full_name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {filteredAchievements.map((a) => (
          <div key={a.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{a.title}</span>
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">
                  {a.kind}
                </span>
              </div>
              {a.description && <p className="text-xs text-muted-foreground">{a.description}</p>}
              <p className="text-xs text-muted-foreground/60">
                {a.season && `Season: ${a.season}`}
                {a.achievement_date && ` | ${a.achievement_date}`}
                {a.profiles && ` | ${a.profiles.full_name}`}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => handleEdit(a)}>Edit</Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(a.id)}>Delete</Button>
            </div>
          </div>
        ))}
        {filteredAchievements.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">No achievements yet.</p>
        )}
      </div>
    </div>
  )
}
