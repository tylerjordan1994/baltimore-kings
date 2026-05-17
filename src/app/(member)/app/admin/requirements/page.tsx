'use client'

import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import type { Requirement, RequirementSignature, Profile } from '@/types/database'

const requirementSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  body_markdown: z.string().min(1, 'Body is required'),
  version: z.coerce.number().int().min(1).default(1),
})

type RequirementForm = z.infer<typeof requirementSchema>

interface RequirementWithSigs extends Requirement {
  signatures?: (RequirementSignature & { profiles?: Profile })[]
}

export default function RequirementsPage() {
  const [requirements, setRequirements] = useState<RequirementWithSigs[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [viewingSigs, setViewingSigs] = useState<string | null>(null)

  const supabase = createClient()

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<RequirementForm>({
    resolver: zodResolver(requirementSchema) as any,
    defaultValues: { version: 1 },
  })

  const loadData = useCallback(async () => {
    const { data } = await supabase
      .from('requirements')
      .select('*, requirement_signatures(*, profiles(*))')
      .order('created_at', { ascending: false })

    if (data) {
      setRequirements(
        data.map((r: any) => ({
          ...r,
          signatures: r.requirement_signatures,
        }))
      )
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadData()
  }, [loadData])

  async function onSubmit(data: RequirementForm) {
    if (editingId) {
      await supabase.from('requirements').update(data).eq('id', editingId)
    } else {
      await supabase.from('requirements').insert(data)
    }
    reset()
    setShowForm(false)
    setEditingId(null)
    loadData()
  }

  function handleEdit(r: Requirement) {
    setEditingId(r.id)
    setValue('title', r.title)
    setValue('body_markdown', r.body_markdown)
    setValue('version', r.version)
    setShowForm(true)
  }

  async function toggleActive(id: string, current: boolean) {
    await supabase.from('requirements').update({ is_active: !current }).eq('id', id)
    loadData()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this requirement?')) return
    await supabase.from('requirements').delete().eq('id', id)
    loadData()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Requirements</h1>
          <p className="text-zinc-400">Manage waivers and requirements members must sign.</p>
        </div>
        <Button onClick={() => { reset(); setEditingId(null); setShowForm(!showForm) }}>
          {showForm ? 'Cancel' : 'Add Requirement'}
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
              <label className="mb-1 block text-xs font-medium text-zinc-400">Version</label>
              <input
                type="number"
                min={1}
                {...register('version')}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Body (Markdown)</label>
            <textarea
              {...register('body_markdown')}
              rows={8}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white font-mono"
            />
            {errors.body_markdown && <p className="mt-1 text-xs text-red-400">{errors.body_markdown.message}</p>}
          </div>
          <Button type="submit">{editingId ? 'Update' : 'Create'}</Button>
        </form>
      )}

      <div className="space-y-3">
        {requirements.map((r) => (
          <div key={r.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{r.title}</span>
                  <span className="text-[10px] text-zinc-500">v{r.version}</span>
                  <span className={`rounded px-1.5 py-0.5 text-[10px] ${r.is_active ? 'bg-green-900/50 text-green-400' : 'bg-zinc-800 text-zinc-500'}`}>
                    {r.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-xs text-zinc-500">
                  {r.signatures?.length ?? 0} signatures
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => setViewingSigs(viewingSigs === r.id ? null : r.id)}>
                  Signatures
                </Button>
                <Button size="sm" variant="ghost" onClick={() => toggleActive(r.id, r.is_active)}>
                  {r.is_active ? 'Deactivate' : 'Activate'}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleEdit(r)}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(r.id)}>Delete</Button>
              </div>
            </div>

            {viewingSigs === r.id && (
              <div className="mt-3 border-t border-zinc-800 pt-3">
                {r.signatures && r.signatures.length > 0 ? (
                  <div className="space-y-1">
                    {r.signatures.map((sig) => (
                      <div key={sig.id} className="flex items-center justify-between text-xs">
                        <span className="text-zinc-300">{sig.profiles?.full_name ?? 'Unknown'}</span>
                        <span className="text-zinc-600">{new Date(sig.signed_at).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-600">No signatures yet.</p>
                )}
              </div>
            )}
          </div>
        ))}
        {requirements.length === 0 && (
          <p className="text-center text-sm text-zinc-500">No requirements yet.</p>
        )}
      </div>
    </div>
  )
}
