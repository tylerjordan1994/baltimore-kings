'use client'

import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import type { Profile, UserRole } from '@/types/database'

const editPlayerSchema = z.object({
  full_name: z.string().min(1),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
  position_primary: z.string().optional(),
  position_secondary: z.string().optional(),
  bio: z.string().optional(),
  jersey_number: z.coerce.number().nullable().optional(),
  role: z.enum(['pending', 'player', 'coach', 'superadmin']),
})

type EditPlayerForm = z.infer<typeof editPlayerSchema>

export default function PlayersPage() {
  const [players, setPlayers] = useState<Profile[]>([])
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('player')
  const [editingPlayer, setEditingPlayer] = useState<Profile | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)

  const supabase = createClient()

  const { register, handleSubmit, reset, setValue } = useForm<EditPlayerForm>({
    resolver: zodResolver(editPlayerSchema) as any,
  })

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (profile) setCurrentUserRole(profile.role as UserRole)
    }

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name')
    if (data) setPlayers(data)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadData()
  }, [loadData])

  function openEdit(player: Profile) {
    setEditingPlayer(player)
    setValue('full_name', player.full_name)
    setValue('phone', player.phone ?? '')
    setValue('date_of_birth', player.date_of_birth ?? '')
    setValue('position_primary', player.position_primary ?? '')
    setValue('position_secondary', player.position_secondary ?? '')
    setValue('bio', player.bio ?? '')
    setValue('jersey_number', player.jersey_number)
    setValue('role', player.role)
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
      position_primary: data.position_primary || null,
      position_secondary: data.position_secondary || null,
      bio: data.bio || null,
      jersey_number: data.jersey_number ?? null,
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Player Management</h1>
        <p className="text-zinc-400">View and edit all player profiles.</p>
      </div>

      {/* Edit Dialog/Sheet */}
      {editingPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-xl border border-zinc-700 bg-zinc-900 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Edit {editingPlayer.full_name}</h2>
              <Button size="sm" variant="ghost" onClick={() => setEditingPlayer(null)}>
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
                  <label className="mb-1 block text-xs text-zinc-400">Jersey #</label>
                  <input
                    type="number"
                    {...register('jersey_number')}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-zinc-400">Primary Position</label>
                  <input
                    {...register('position_primary')}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-zinc-400">Secondary Position</label>
                  <input
                    {...register('position_secondary')}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
                  />
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
                  <label className="mb-1 block text-xs text-zinc-400">Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
                    className="w-full text-xs text-zinc-400"
                  />
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
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setEditingPlayer(null)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900/50">
            <tr>
              <th className="px-4 py-3 font-medium text-zinc-300">Name</th>
              <th className="px-4 py-3 font-medium text-zinc-300">Role</th>
              <th className="px-4 py-3 font-medium text-zinc-300">Also Plays</th>
              <th className="px-4 py-3 font-medium text-zinc-300">Position</th>
              <th className="px-4 py-3 font-medium text-zinc-300">#</th>
              <th className="px-4 py-3 font-medium text-zinc-300">Phone</th>
              <th className="px-4 py-3 font-medium text-zinc-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {players.map((p) => (
              <tr key={p.id} className="bg-zinc-900 hover:bg-zinc-800/50">
                <td className="px-4 py-3 text-white">{p.full_name}</td>
                <td className="px-4 py-3">
                  <span className={`rounded px-1.5 py-0.5 text-[10px] uppercase ${
                    p.role === 'superadmin' ? 'bg-purple-900/50 text-purple-300' :
                    p.role === 'coach' ? 'bg-blue-900/50 text-blue-300' :
                    p.role === 'player' ? 'bg-green-900/50 text-green-300' :
                    'bg-zinc-800 text-zinc-500'
                  }`}>
                    {p.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {(p.role === 'coach' || p.role === 'superadmin') ? (
                    <button
                      onClick={async () => {
                        await supabase.from('profiles').update({ also_plays: !p.also_plays }).eq('id', p.id)
                        loadData()
                      }}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        p.also_plays ? 'bg-green-600' : 'bg-zinc-700'
                      }`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
                        p.also_plays ? 'translate-x-4.5' : 'translate-x-0.5'
                      }`} />
                    </button>
                  ) : (
                    <span className="text-xs text-zinc-500">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-zinc-400">{p.position_primary ?? '—'}</td>
                <td className="px-4 py-3 text-zinc-400">{p.jersey_number ?? '—'}</td>
                <td className="px-4 py-3 text-zinc-400">{p.phone ?? '—'}</td>
                <td className="px-4 py-3">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(p)}>
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {players.length === 0 && (
        <p className="text-center text-sm text-zinc-500">No players found.</p>
      )}
    </div>
  )
}
