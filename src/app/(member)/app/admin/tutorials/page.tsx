'use client'

import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import type { Tutorial } from '@/types/database'

const tutorialSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  body_markdown: z.string().optional(),
  youtube_url: z.string().optional(),
  external_url: z.string().optional(),
  category: z.string().optional(),
  is_published: z.boolean().default(false),
})

type TutorialForm = z.infer<typeof tutorialSchema>

export default function TutorialsPage() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const supabase = createClient()

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<TutorialForm>({
    resolver: zodResolver(tutorialSchema) as any,
    defaultValues: { is_published: false },
  })

  const loadData = useCallback(async () => {
    const { data } = await supabase
      .from('tutorials')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setTutorials(data)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadData()
  }, [loadData])

  async function onSubmit(data: TutorialForm) {
    const payload = {
      title: data.title,
      body_markdown: data.body_markdown || null,
      youtube_url: data.youtube_url || null,
      external_url: data.external_url || null,
      category: data.category || null,
      is_published: data.is_published,
    }

    if (editingId) {
      await supabase.from('tutorials').update(payload).eq('id', editingId)
    } else {
      await supabase.from('tutorials').insert(payload)
    }

    reset()
    setShowForm(false)
    setEditingId(null)
    loadData()
  }

  function handleEdit(t: Tutorial) {
    setEditingId(t.id)
    setValue('title', t.title)
    setValue('body_markdown', t.body_markdown ?? '')
    setValue('youtube_url', t.youtube_url ?? '')
    setValue('external_url', t.external_url ?? '')
    setValue('category', t.category ?? '')
    setValue('is_published', t.is_published)
    setShowForm(true)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this tutorial?')) return
    await supabase.from('tutorials').delete().eq('id', id)
    loadData()
  }

  async function togglePublish(id: string, current: boolean) {
    await supabase.from('tutorials').update({ is_published: !current }).eq('id', id)
    loadData()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Tutorials</h1>
          <p className="text-zinc-400">Manage training tutorials and resources.</p>
        </div>
        <Button onClick={() => { reset(); setEditingId(null); setShowForm(!showForm) }}>
          {showForm ? 'Cancel' : 'Add Tutorial'}
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit(onSubmit as any)}
          className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-400">Title</label>
              <input
                {...register('title')}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
              />
              {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-400">Category</label>
              <input
                {...register('category')}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-400">YouTube URL</label>
              <input
                {...register('youtube_url')}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-400">External URL</label>
              <input
                {...register('external_url')}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Body (Markdown)</label>
            <textarea
              {...register('body_markdown')}
              rows={6}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white font-mono"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input type="checkbox" {...register('is_published')} className="rounded" />
            Published
          </label>
          <Button type="submit">{editingId ? 'Update' : 'Create'}</Button>
        </form>
      )}

      <div className="space-y-3">
        {tutorials.map((t) => (
          <div key={t.id} className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">{t.title}</span>
                {t.category && (
                  <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">
                    {t.category}
                  </span>
                )}
                <span className={`rounded px-1.5 py-0.5 text-[10px] ${t.is_published ? 'bg-green-900/50 text-green-400' : 'bg-zinc-800 text-zinc-500'}`}>
                  {t.is_published ? 'Published' : 'Draft'}
                </span>
              </div>
              <p className="text-xs text-zinc-600">{new Date(t.created_at).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => togglePublish(t.id, t.is_published)}>
                {t.is_published ? 'Unpublish' : 'Publish'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleEdit(t)}>Edit</Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(t.id)}>Delete</Button>
            </div>
          </div>
        ))}
        {tutorials.length === 0 && (
          <p className="text-center text-sm text-zinc-500">No tutorials yet.</p>
        )}
      </div>
    </div>
  )
}
