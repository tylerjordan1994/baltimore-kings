'use client'

import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import type { Profile, UserRole, Team, PlayerClubHistory } from '@/types/database'

const editPlayerSchema = z.object({
  full_name: z.string().min(1),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
  nickname: z.string().optional(),
  hometown: z.string().optional(),
  school: z.string().optional(),
  position_primary: z.string().optional(),
  position_secondary: z.string().optional(),
  bio: z.string().optional(),
  photo_url: z.string().optional(),
  jersey_number: z.coerce.number().nullable().optional(),
  years_in_club: z.coerce.number().nullable().optional(),
  is_minor: z.boolean().optional(),
  also_plays: z.boolean().optional(),
  status: z.enum(['pending', 'active', 'inactive', 'archived', 'injured']),
  role: z.enum(['pending', 'player', 'coach', 'superadmin']),
})

const PROFILE_STATUSES = ['pending', 'active', 'inactive', 'archived', 'injured'] as const

type EditPlayerForm = z.infer<typeof editPlayerSchema>

type TabKey = 'active' | 'pending' | 'inactive' | 'all'

const INACTIVE_REASONS = [
  'moved_away',
  'injury',
  'personal_reasons',
  'schedule_conflict',
  'non_payment',
  'conduct',
  'retired',
  'promoted_out',
  'other',
] as const

const INACTIVE_REASON_LABELS: Record<string, string> = {
  moved_away: 'Moved Away',
  injury: 'Injury',
  personal_reasons: 'Personal Reasons',
  schedule_conflict: 'Schedule Conflict',
  non_payment: 'Non-Payment',
  conduct: 'Conduct',
  retired: 'Retired',
  promoted_out: 'Promoted Out',
  other: 'Other',
}

const FUTSAL_POSITIONS = ['GK', 'Fixo', 'Ala', 'Piv\u00f4'] as const
const MASL_POSITIONS = ['Target Forward', 'Second Forward', 'Midfielder', 'Defender', 'GK'] as const

// Renders all applicable role/tag chips for a profile. A coach can also be a
// player (also_plays), so we surface every relevant tag.
function RoleTags({ profile }: { profile: Profile }) {
  const tags: { label: string; className: string }[] = []
  if (profile.role === 'superadmin') {
    tags.push({ label: 'Super Admin', className: 'bg-purple-900/50 text-purple-300' })
  } else if (profile.role === 'coach') {
    tags.push({ label: 'Coach', className: 'bg-blue-900/50 text-blue-300' })
  } else if (profile.role === 'player') {
    tags.push({ label: 'Player', className: 'bg-green-900/50 text-green-300' })
  } else {
    tags.push({ label: profile.role, className: 'bg-zinc-800 text-zinc-400' })
  }
  // Coaches/superadmins who also play get an extra Player tag.
  if (profile.also_plays && profile.role !== 'player') {
    tags.push({ label: 'Player', className: 'bg-green-900/50 text-green-300' })
  }
  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((t, i) => (
        <span
          key={i}
          className={`rounded px-1.5 py-0.5 text-[10px] uppercase ${t.className}`}
        >
          {t.label}
        </span>
      ))}
    </div>
  )
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<Profile[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('player')
  const [editingPlayer, setEditingPlayer] = useState<Profile | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  // When the saved position isn't one of the preset options, treat it as a
  // custom player type and show a free-text field instead of the dropdown.
  const [customFutsal, setCustomFutsal] = useState(false)
  const [customMasl, setCustomMasl] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>('active')
  const [inactiveModal, setInactiveModal] = useState<Profile | null>(null)
  const [inactiveReasons, setInactiveReasons] = useState<string[]>([])
  const [inactiveNotes, setInactiveNotes] = useState('')
  const [processing, setProcessing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<string>('full_name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  // Team assignments + club history for the player being edited
  const [teams, setTeams] = useState<Team[]>([])
  const [memberTeamIds, setMemberTeamIds] = useState<string[]>([])
  const [history, setHistory] = useState<PlayerClubHistory[]>([])
  const [newHistory, setNewHistory] = useState({ year_label: '', team: '', note: '' })

  const supabase = createClient()

  const { register, handleSubmit, reset, setValue } = useForm<EditPlayerForm>({
    resolver: zodResolver(editPlayerSchema) as any,
  })

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setCurrentUserId(user.id)
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (profile) setCurrentUserRole(profile.role as UserRole)
    }

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name')
    if (data) setPlayers(data)

    const { data: teamsData } = await supabase
      .from('teams')
      .select('*')
      .order('display_order', { ascending: true })
    if (teamsData) setTeams(teamsData)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadData()
  }, [loadData])

  async function openEdit(player: Profile) {
    setEditingPlayer(player)
    setValue('full_name', player.full_name)
    setValue('phone', player.phone ?? '')
    setValue('date_of_birth', player.date_of_birth ?? '')
    setValue('nickname', player.nickname ?? '')
    setValue('hometown', player.hometown ?? '')
    setValue('school', player.school ?? '')
    setValue('position_primary', player.position_primary ?? '')
    setValue('position_secondary', player.position_secondary ?? '')
    setCustomFutsal(
      !!player.position_primary &&
        !(FUTSAL_POSITIONS as readonly string[]).includes(player.position_primary)
    )
    setCustomMasl(
      !!player.position_secondary &&
        !(MASL_POSITIONS as readonly string[]).includes(player.position_secondary)
    )
    setValue('bio', player.bio ?? '')
    setValue('photo_url', player.photo_url ?? '')
    setValue('jersey_number', player.jersey_number)
    setValue('years_in_club', player.years_in_club)
    setValue('is_minor', player.is_minor)
    setValue('also_plays', player.also_plays)
    setValue('status', player.status)
    setValue('role', player.role)

    // Load this player's team assignments + club history
    const { data: tmData } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('profile_id', player.id)
    setMemberTeamIds((tmData ?? []).map((t) => t.team_id))

    const { data: histData } = await supabase
      .from('player_club_history')
      .select('*')
      .eq('profile_id', player.id)
      .order('display_order', { ascending: true })
    setHistory(histData ?? [])
    setNewHistory({ year_label: '', team: '', note: '' })
  }

  // ── Team assignment ──────────────────────────────────────────
  async function toggleTeam(teamId: string) {
    if (!editingPlayer) return
    if (memberTeamIds.includes(teamId)) {
      await supabase
        .from('team_members')
        .delete()
        .eq('profile_id', editingPlayer.id)
        .eq('team_id', teamId)
      setMemberTeamIds((prev) => prev.filter((id) => id !== teamId))
    } else {
      await supabase.from('team_members').insert({
        team_id: teamId,
        profile_id: editingPlayer.id,
        roster_position: 'reserve',
      })
      setMemberTeamIds((prev) => [...prev, teamId])
    }
  }

  // ── Club history ─────────────────────────────────────────────
  async function addHistoryRow() {
    if (!editingPlayer || !newHistory.year_label.trim() || !newHistory.team.trim()) return
    const { data } = await supabase
      .from('player_club_history')
      .insert({
        profile_id: editingPlayer.id,
        year_label: newHistory.year_label.trim(),
        team: newHistory.team.trim(),
        note: newHistory.note.trim() || null,
        display_order: history.length,
        created_by: currentUserId,
      })
      .select()
      .single()
    if (data) {
      setHistory((prev) => [...prev, data])
      setNewHistory({ year_label: '', team: '', note: '' })
    }
  }

  async function updateHistoryRow(
    id: string,
    field: 'year_label' | 'team' | 'note',
    value: string
  ) {
    setHistory((prev) =>
      prev.map((h) => (h.id === id ? { ...h, [field]: value } : h))
    )
    await supabase
      .from('player_club_history')
      .update({ [field]: value || null })
      .eq('id', id)
  }

  async function deleteHistoryRow(id: string) {
    await supabase.from('player_club_history').delete().eq('id', id)
    setHistory((prev) => prev.filter((h) => h.id !== id))
  }

  async function onSubmit(data: EditPlayerForm) {
    if (!editingPlayer) return

    // Coach can only set player/pending; superadmin can set any
    if (currentUserRole === 'coach' && (data.role === 'coach' || data.role === 'superadmin')) {
      data.role = editingPlayer.role as any
    }

    const payload: Record<string, unknown> = {
      full_name: data.full_name,
      phone: data.phone || null,
      date_of_birth: data.date_of_birth || null,
      nickname: data.nickname || null,
      hometown: data.hometown || null,
      school: data.school || null,
      position_primary: data.position_primary || null,
      position_secondary: data.position_secondary || null,
      bio: data.bio || null,
      photo_url: data.photo_url || null,
      jersey_number: data.jersey_number ?? null,
      years_in_club: data.years_in_club ?? null,
      is_minor: data.is_minor ?? false,
      also_plays: data.also_plays ?? false,
      status: data.status,
      role: data.role,
    }

    // Upload photo if provided
    if (photoFile) {
      const ext = photoFile.name.split('.').pop()
      const path = `avatars/${editingPlayer.id}.${ext}`
      await supabase.storage.from('avatars').upload(path, photoFile, { upsert: true })
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
      payload.photo_url = urlData.publicUrl
    }

    await supabase.from('profiles').update(payload).eq('id', editingPlayer.id)
    setEditingPlayer(null)
    setPhotoFile(null)
    reset()
    loadData()
  }

  async function markInactive() {
    if (!inactiveModal || inactiveReasons.length === 0) return
    if (inactiveReasons.includes('other') && !inactiveNotes.trim()) return

    setProcessing(true)
    try {
      // 1. Update profile
      await supabase.from('profiles').update({
        status: 'inactive',
        inactive_reasons: inactiveReasons,
        made_inactive_at: new Date().toISOString(),
        made_inactive_by: currentUserId,
        inactive_notes: inactiveNotes.trim() || null,
      }).eq('id', inactiveModal.id)

      // 2. Deactivate all team_members rows
      await supabase.from('team_members').update({
        is_active: false,
      }).eq('profile_id', inactiveModal.id)

      setInactiveModal(null)
      setInactiveReasons([])
      setInactiveNotes('')
      loadData()
    } finally {
      setProcessing(false)
    }
  }

  async function reactivatePlayer(player: Profile) {
    setProcessing(true)
    try {
      await supabase.from('profiles').update({
        status: 'active',
        inactive_reasons: null,
        made_inactive_at: null,
        made_inactive_by: null,
        inactive_notes: null,
      }).eq('id', player.id)
      loadData()
    } finally {
      setProcessing(false)
    }
  }

  function toggleReason(reason: string) {
    setInactiveReasons((prev) =>
      prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]
    )
  }

  const filteredPlayers = players
    .filter((p) => {
      if (activeTab !== 'all' && p.status !== activeTab) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return p.full_name.toLowerCase().includes(q) ||
          (p.phone ?? '').toLowerCase().includes(q) ||
          (p.position_primary ?? '').toLowerCase().includes(q) ||
          (p.position_secondary ?? '').toLowerCase().includes(q)
      }
      return true
    })
    .sort((a, b) => {
      const aVal = (a as any)[sortField] ?? ''
      const bVal = (b as any)[sortField] ?? ''
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true })
      return sortDir === 'asc' ? cmp : -cmp
    })

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: 'active', label: 'Active', count: players.filter((p) => p.status === 'active').length },
    { key: 'pending', label: 'Pending', count: players.filter((p) => p.status === 'pending').length },
    { key: 'inactive', label: 'Inactive', count: players.filter((p) => p.status === 'inactive').length },
    { key: 'all', label: 'All', count: players.length },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Player Management</h1>
        <p className="text-zinc-400">View and edit all player profiles.</p>
      </div>

      {/* Search + Tabs */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 rounded-lg border border-zinc-800 bg-zinc-900/50 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-gold/20 text-gold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-xs opacity-60">({tab.count})</span>
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search players..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none w-full sm:w-64"
        />
      </div>

      {/* Edit Dialog/Sheet */}
      {editingPlayer && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4">
          <div className="my-8 w-full max-w-2xl rounded-xl border border-zinc-700 bg-zinc-900 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Edit {editingPlayer.full_name}</h2>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditingPlayer(null)}
                className="text-zinc-200 hover:text-white"
              >
                Close
              </Button>
            </div>
            <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-zinc-400">Full Name</label>
                  <input
                    {...register('full_name')}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-zinc-400">Nickname</label>
                  <input
                    {...register('nickname')}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-zinc-400">Phone</label>
                  <input
                    {...register('phone')}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-zinc-400">Date of Birth</label>
                  <input
                    type="date"
                    {...register('date_of_birth')}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-zinc-400">Hometown</label>
                  <input
                    {...register('hometown')}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-zinc-400">School</label>
                  <input
                    {...register('school')}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-zinc-400">Jersey #</label>
                  <input
                    type="number"
                    {...register('jersey_number')}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-zinc-400">Years in Club</label>
                  <input
                    type="number"
                    {...register('years_in_club')}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-zinc-400">Futsal Position / Type</label>
                  {customFutsal ? (
                    <input
                      {...register('position_primary')}
                      placeholder="Custom player type..."
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500"
                    />
                  ) : (
                    <select
                      {...register('position_primary')}
                      onChange={(e) => {
                        if (e.target.value === '__custom__') {
                          setCustomFutsal(true)
                          setValue('position_primary', '')
                        } else {
                          setValue('position_primary', e.target.value)
                        }
                      }}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
                    >
                      <option value="">None</option>
                      {FUTSAL_POSITIONS.map((pos) => (
                        <option key={pos} value={pos}>{pos}</option>
                      ))}
                      <option value="__custom__">Custom type...</option>
                    </select>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-xs text-zinc-400">MASL Position / Type</label>
                  {customMasl ? (
                    <input
                      {...register('position_secondary')}
                      placeholder="Custom player type..."
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500"
                    />
                  ) : (
                    <select
                      {...register('position_secondary')}
                      onChange={(e) => {
                        if (e.target.value === '__custom__') {
                          setCustomMasl(true)
                          setValue('position_secondary', '')
                        } else {
                          setValue('position_secondary', e.target.value)
                        }
                      }}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
                    >
                      <option value="">None</option>
                      {MASL_POSITIONS.map((pos) => (
                        <option key={pos} value={pos}>{pos}</option>
                      ))}
                      <option value="__custom__">Custom type...</option>
                    </select>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-xs text-zinc-400">Status</label>
                  <select
                    {...register('status')}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
                  >
                    {PROFILE_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-zinc-400">Role</label>
                  <select
                    {...register('role')}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="player">Player</option>
                    {currentUserRole === 'superadmin' && (
                      <>
                        <option value="coach">Coach</option>
                        <option value="superadmin">Super Admin</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-zinc-400">Photo URL</label>
                  <input
                    {...register('photo_url')}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-zinc-400">Upload Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
                    className="w-full text-xs text-zinc-400"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="is_minor"
                    type="checkbox"
                    {...register('is_minor')}
                    className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 accent-[#C9A94E]"
                  />
                  <label htmlFor="is_minor" className="text-sm text-zinc-300">
                    Player is a minor
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="also_plays"
                    type="checkbox"
                    {...register('also_plays')}
                    className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 accent-[#C9A94E]"
                  />
                  <label htmlFor="also_plays" className="text-sm text-zinc-300">
                    Also plays (e.g. coach who also plays)
                  </label>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-400">Bio</label>
                <textarea
                  {...register('bio')}
                  rows={3}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
                />
              </div>

              {/* Team assignments */}
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
                  Team Assignments
                </p>
                <p className="mb-3 text-xs text-zinc-500">
                  Adding a player to a team here shows them on that team&apos;s public roster.
                </p>
                <div className="flex flex-wrap gap-2">
                  {teams.map((t) => {
                    const active = memberTeamIds.includes(t.id)
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => toggleTeam(t.id)}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                          active
                            ? 'bg-gold/20 text-gold ring-1 ring-[#C9A94E]'
                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                        }`}
                      >
                        {active ? '✓ ' : '+ '}
                        {t.name}
                      </button>
                    )
                  })}
                  {teams.length === 0 && (
                    <span className="text-xs text-zinc-500">No teams found.</span>
                  )}
                </div>
              </div>

              {/* Club history editor */}
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
                  Club History
                </p>
                <div className="space-y-2">
                  {history.map((h) => (
                    <div key={h.id} className="flex flex-wrap items-center gap-2">
                      <input
                        value={h.year_label}
                        onChange={(e) => updateHistoryRow(h.id, 'year_label', e.target.value)}
                        placeholder="Year"
                        className="w-24 rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-xs text-white"
                      />
                      <input
                        value={h.team}
                        onChange={(e) => updateHistoryRow(h.id, 'team', e.target.value)}
                        placeholder="Team"
                        className="w-40 rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-xs text-white"
                      />
                      <input
                        value={h.note ?? ''}
                        onChange={(e) => updateHistoryRow(h.id, 'note', e.target.value)}
                        placeholder="Note"
                        className="min-w-[120px] flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-xs text-white"
                      />
                      <button
                        type="button"
                        onClick={() => deleteHistoryRow(h.id)}
                        className="rounded px-2 py-1 text-xs text-red-400 hover:bg-red-500/10"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                  {history.length === 0 && (
                    <p className="text-xs text-zinc-500">No history rows yet.</p>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-zinc-800 pt-3">
                  <input
                    value={newHistory.year_label}
                    onChange={(e) =>
                      setNewHistory((p) => ({ ...p, year_label: e.target.value }))
                    }
                    placeholder="Year"
                    className="w-24 rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-xs text-white"
                  />
                  <input
                    value={newHistory.team}
                    onChange={(e) =>
                      setNewHistory((p) => ({ ...p, team: e.target.value }))
                    }
                    placeholder="Team"
                    className="w-40 rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-xs text-white"
                  />
                  <input
                    value={newHistory.note}
                    onChange={(e) =>
                      setNewHistory((p) => ({ ...p, note: e.target.value }))
                    }
                    placeholder="Note (optional)"
                    className="min-w-[120px] flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-xs text-white"
                  />
                  <Button type="button" size="sm" onClick={addHistoryRow}>
                    Add Row
                  </Button>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditingPlayer(null)}
                  className="text-zinc-200 hover:text-white"
                >
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mark Inactive Modal */}
      {inactiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-900 p-6">
            <h2 className="text-lg font-semibold text-white">
              Mark {inactiveModal.full_name} Inactive
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Select reason(s) and add optional notes.
            </p>

            <div className="mt-4 space-y-2">
              {INACTIVE_REASONS.map((reason) => (
                <label
                  key={reason}
                  className="flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-white hover:bg-zinc-800 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={inactiveReasons.includes(reason)}
                    onChange={() => toggleReason(reason)}
                    className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-gold accent-[#C9A94E]"
                  />
                  {INACTIVE_REASON_LABELS[reason]}
                </label>
              ))}
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-xs text-zinc-400">
                Notes {inactiveReasons.includes('other') && <span className="text-red-400">(required)</span>}
              </label>
              <textarea
                value={inactiveNotes}
                onChange={(e) => setInactiveNotes(e.target.value)}
                rows={3}
                placeholder="Additional context..."
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-600"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setInactiveModal(null)
                  setInactiveReasons([])
                  setInactiveNotes('')
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={markInactive}
                disabled={
                  processing ||
                  inactiveReasons.length === 0 ||
                  (inactiveReasons.includes('other') && !inactiveNotes.trim())
                }
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {processing ? 'Processing...' : 'Confirm'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Inactive tab: denser table */}
      {activeTab === 'inactive' ? (
        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-900/50">
              <tr>
                <th className="px-4 py-3 font-medium text-zinc-300">Player</th>
                <th className="px-4 py-3 font-medium text-zinc-300">Date Inactivated</th>
                <th className="px-4 py-3 font-medium text-zinc-300">Reasons</th>
                <th className="px-4 py-3 font-medium text-zinc-300">Notes</th>
                <th className="px-4 py-3 font-medium text-zinc-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredPlayers.map((p) => (
                <tr key={p.id} className="bg-zinc-900 hover:bg-zinc-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {p.photo_url ? (
                        <img src={p.photo_url} alt="" className="h-7 w-7 rounded-full object-cover" />
                      ) : (
                        <div className="h-7 w-7 rounded-full bg-zinc-700" />
                      )}
                      <span className="text-white">{p.full_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">
                    {p.made_inactive_at
                      ? new Date(p.made_inactive_at).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {p.inactive_reasons?.map((r) => (
                        <span
                          key={r}
                          className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300"
                        >
                          {INACTIVE_REASON_LABELS[r] || r}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500 max-w-[200px] truncate">
                    {p.inactive_notes || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => reactivatePlayer(p)}
                      disabled={processing}
                      className="text-green-400 hover:text-green-300"
                    >
                      Reactivate
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredPlayers.length === 0 && (
            <p className="py-8 text-center text-sm text-zinc-500">No inactive players.</p>
          )}
        </div>
      ) : (
        /* Standard table for active/pending/all */
        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-900/50">
              <tr>
                {([
                  ['full_name', 'Name'],
                  ['role', 'Role'],
                  ['position_primary', 'Futsal Pos'],
                  ['position_secondary', 'MASL Pos'],
                  ['jersey_number', '#'],
                  ['phone', 'Phone'],
                  ['created_at', 'Joined'],
                ] as [string, string][]).map(([field, label]) => (
                  <th
                    key={field}
                    className="px-4 py-3 font-medium text-zinc-300 cursor-pointer hover:text-white select-none"
                    onClick={() => {
                      if (sortField === field) {
                        setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
                      } else {
                        setSortField(field)
                        setSortDir('asc')
                      }
                    }}
                  >
                    {label}
                    {sortField === field && (
                      <span className="ml-1 text-amber-400">{sortDir === 'asc' ? '\u2191' : '\u2193'}</span>
                    )}
                  </th>
                ))}
                <th className="px-4 py-3 font-medium text-zinc-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredPlayers.map((p) => (
                <tr key={p.id} className="bg-zinc-900 hover:bg-zinc-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {p.photo_url ? (
                        <img src={p.photo_url} alt="" className="h-7 w-7 rounded-full object-cover" />
                      ) : (
                        <div className="h-7 w-7 rounded-full bg-zinc-700" />
                      )}
                      <span className="text-white">{p.full_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <RoleTags profile={p} />
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{p.position_primary ?? '\u2014'}</td>
                  <td className="px-4 py-3 text-zinc-400">{p.position_secondary ?? '\u2014'}</td>
                  <td className="px-4 py-3 text-zinc-400">{p.jersey_number ?? '\u2014'}</td>
                  <td className="px-4 py-3 text-zinc-400">{p.phone ?? '\u2014'}</td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEdit(p)}
                        className="text-zinc-200 hover:text-white"
                      >
                        Edit
                      </Button>
                      {p.status === 'active' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setInactiveModal(p)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Mark Inactive
                        </Button>
                      )}
                      {p.status === 'inactive' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => reactivatePlayer(p)}
                          disabled={processing}
                          className="text-green-400 hover:text-green-300"
                        >
                          Reactivate
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredPlayers.length === 0 && (
            <p className="py-8 text-center text-sm text-zinc-500">No players found.</p>
          )}
        </div>
      )}
    </div>
  )
}
