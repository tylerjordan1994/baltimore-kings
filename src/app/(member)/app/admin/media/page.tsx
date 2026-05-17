'use client'

import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import type { MediaItem, Team } from '@/types/database'

// basePath handled by next.config.ts

const uploadSchema = z.object({
  caption: z.string().optional(),
  team_id: z.string().optional(),
  kind: z.enum(['photo', 'video']),
})

type UploadForm = z.infer<typeof uploadSchema>

export default function MediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const supabase = createClient()

  const { register, handleSubmit, reset } = useForm<UploadForm>({
    resolver: zodResolver(uploadSchema),
    defaultValues: { kind: 'photo' },
  })

  const loadData = useCallback(async () => {
    const { data: mediaData } = await supabase
      .from('media')
      .select('*')
      .order('created_at', { ascending: false })

    const { data: teamsData } = await supabase
      .from('teams')
      .select('*')
      .eq('is_active', true)

    if (mediaData) setMedia(mediaData)
    if (teamsData) setTeams(teamsData)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadData()
  }, [loadData])

  async function onSubmit(data: UploadForm) {
    if (!file) return
    setUploading(true)

    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const path = `media/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(path, file)

    if (uploadError) {
      alert('Upload failed: ' + uploadError.message)
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage.from('media').getPublicUrl(path)

    await fetch(`/api/admin/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: urlData.publicUrl,
        kind: data.kind,
        caption: data.caption || null,
        team_id: data.team_id || null,
      }),
    })

    setFile(null)
    reset()
    setUploading(false)
    loadData()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this media item?')) return
    await fetch(`/api/admin/media`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    loadData()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Media Manager</h1>
        <p className="text-zinc-400">Upload and manage photos and videos.</p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">File</label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm text-zinc-300"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Kind</label>
            <select
              {...register('kind')}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
            >
              <option value="photo">Photo</option>
              <option value="video">Video</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Caption</label>
            <input
              {...register('caption')}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Team</label>
            <select
              {...register('team_id')}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
            >
              <option value="">No team</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>
        <Button type="submit" disabled={!file || uploading}>
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {media.map((item) => (
          <div
            key={item.id}
            className="group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900"
          >
            {item.kind === 'photo' ? (
              <img
                src={item.url}
                alt={item.caption ?? ''}
                className="aspect-square w-full object-cover"
              />
            ) : (
              <video src={item.url} className="aspect-square w-full object-cover" />
            )}
            <div className="p-3">
              <p className="truncate text-xs text-zinc-300">{item.caption || 'No caption'}</p>
              <p className="text-[10px] text-zinc-600">
                {new Date(item.created_at).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => handleDelete(item.id)}
              className="absolute right-2 top-2 rounded bg-red-900/80 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
      {media.length === 0 && (
        <p className="text-center text-sm text-zinc-500">No media uploaded yet.</p>
      )}
    </div>
  )
}
