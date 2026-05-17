'use client'

import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import type { Achievement, Profile } from '@/types/database'

const achievementSchema = z.object({
  kind: z.enum(['club', 'player']),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  achievement_date: z.string().optional(),
  season: z.string().optional(),
  profile_id: z.string().optional(),
})

type AchievementForm = z.infer<typeof achievementSchema>

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [players, setPlayers] = useState<Profile[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const supabase = createClient()

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<AchievementForm>({
    resolver: zodResolver(achievementSchema),
    defaultValues: { kind: 'club' },
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

    if (achievementsData) setAchievements(achievementsData)
    if (playersData) setPlayers(playersData)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadData()
  }, [loadData])

  async function onSubmit(data: AchievementForm) {
    const payload = {
      kind: data.kind,
      title: data.title,
      description: data.description || null,
      achievement_date: data.achievement_date || null,
      season: data.season || null,
      profile_id: data.kind === 'player' ? data.profile_id || null : null,
    }

    if (editingId) {
      await supabase.from('achievements').update(payload).eq('id', editingId)
    } else {
      await supabase.from('achievements').insert(payload)
    }

    reset()
    setShowForm(false)
    setEditingId(null)
    loadData()
  }

  function handleEdit(a: Achievement) {
    setEditingId(a.id)
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Achievements</h1>
          <p className="text-zinc-400">Manage club and player achievements.</p>
        </div>
        <Button onClick={() => { reset(); setEditingId(null); setShowForm(!showForm) }}>
          {showForm ? 'Cancel' : 'Add Achievement'}
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-400">Kind</label>
              <select
                {...register('kind')}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
              >
                <option value="club">Club</option>
                <option value="player">Player</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-400">Title</label>
              <input
                {...register('title')}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
              />
              {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-400">Date</label>
              <input
                type="date"
                {...register('achievement_date')}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-400">Season</label>
              <input
                {...register('season')}
                placeholder="e.g. 2025-26"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
              />
            </div>
            {kind === 'player' && (
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-400">Player</label>
                <select
                  {...register('profile_id')}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
                >
                  <option value="">Select player...</option>
                  {players.map((p) => (
                    <option key={p.id} value={p.id}>{p.full_name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
            />
          </div>
          <Button type="submit">{editingId ? 'Update' : 'Create'}</Button>
        </form>
      )}

      <div className="space-y-3">
        {achievements.map((a) => (
          <div key={a.id} className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">{a.title}</span>
                <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] uppercase text-zinc-400">
                  {a.kind}
                </span>
              </div>
              {a.description && <p className="text-xs text-zinc-400">{a.description}</p>}
              <p className="text-xs text-zinc-600">
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
        {achievements.length === 0 && (
          <p className="text-center text-sm text-zinc-500">No achievements yet.</p>
        )}
      </div>
    </div>
  )
}
