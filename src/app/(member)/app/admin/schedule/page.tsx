'use client'

import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { ScheduleCalendar } from '@/components/schedule-calendar'
import type { CalendarEvent, Team } from '@/types/database'

// basePath handled by next.config.ts

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  kind: z.enum(['practice', 'home_game', 'away_game', 'tryout', 'meeting', 'other']),
  starts_at: z.string().min(1, 'Start time is required'),
  ends_at: z.string().optional(),
  location: z.string().optional(),
  team_ids: z.array(z.string()).default([]),
  visibility: z.enum(['public', 'members_only']).default('public'),
  description: z.string().optional(),
  repeat_weeks: z.coerce.number().int().min(1).max(52).default(1),
})

type EventForm = z.infer<typeof eventSchema>

export default function SchedulePage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [view, setView] = useState<'list' | 'calendar'>('list')

  const supabase = createClient()

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<EventForm>({
    resolver: zodResolver(eventSchema) as any,
    defaultValues: {
      kind: 'practice',
      visibility: 'public',
      repeat_weeks: 1,
      team_ids: [],
    },
  })

  const loadData = useCallback(async () => {
    const { data: eventsData } = await supabase
      .from('calendar_events')
      .select('*')
      .order('starts_at', { ascending: true })

    const { data: teamsData } = await supabase
      .from('teams')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (eventsData) setEvents(eventsData)
    if (teamsData) setTeams(teamsData)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadData()
  }, [loadData])

  async function onSubmit(data: EventForm) {
    if (editingId) {
      await fetch(`/api/admin/events`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, ...data }),
      })
    } else {
      await fetch(`/api/admin/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    }
    reset()
    setShowForm(false)
    setEditingId(null)
    loadData()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this event?')) return
    await fetch(`/api/admin/events`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    loadData()
  }

  function handleEdit(event: CalendarEvent) {
    setEditingId(event.id)
    setValue('title', event.title)
    setValue('kind', event.kind)
    setValue('starts_at', event.starts_at.slice(0, 16))
    setValue('ends_at', event.ends_at?.slice(0, 16) ?? '')
    setValue('location', event.location ?? '')
    setValue('team_ids', event.team_ids ?? [])
    setValue('visibility', event.visibility)
    setValue('description', event.description ?? '')
    setValue('repeat_weeks', 1)
    setShowForm(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Schedule Manager</h1>
          <p className="text-zinc-400">Create and manage calendar events.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 rounded-lg border border-zinc-800 bg-zinc-900/50 p-1">
            <button
              onClick={() => setView('list')}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                view === 'list'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                view === 'calendar'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Calendar
            </button>
          </div>
          <Button onClick={() => { reset(); setEditingId(null); setShowForm(!showForm) }}>
            {showForm ? 'Cancel' : 'Create Event'}
          </Button>
        </div>
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
              <label className="mb-1 block text-xs font-medium text-zinc-400">Kind</label>
              <select
                {...register('kind')}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
              >
                <option value="practice">Practice</option>
                <option value="home_game">Home Game</option>
                <option value="away_game">Away Game</option>
                <option value="tryout">Tryout</option>
                <option value="meeting">Meeting</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-400">Starts At</label>
              <input
                type="datetime-local"
                {...register('starts_at')}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
              />
              {errors.starts_at && <p className="mt-1 text-xs text-red-400">{errors.starts_at.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-400">Ends At</label>
              <input
                type="datetime-local"
                {...register('ends_at')}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-400">Location</label>
              <input
                {...register('location')}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-400">Visibility</label>
              <select
                {...register('visibility')}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
              >
                <option value="public">Public</option>
                <option value="members_only">Members Only</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-400">Teams</label>
              <select
                multiple
                {...register('team_ids')}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            {!editingId && (
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-400">
                  Repeat weekly for N weeks
                </label>
                <input
                  type="number"
                  min={1}
                  max={52}
                  {...register('repeat_weeks')}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
                />
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
          <Button type="submit">{editingId ? 'Update Event' : 'Create Event'}</Button>
        </form>
      )}

      {view === 'calendar' ? (
        <ScheduleCalendar events={events} theme="dark" onEventClick={handleEdit} />
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{event.title}</span>
                  <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] uppercase text-zinc-400">
                    {event.kind}
                  </span>
                </div>
                <p className="text-xs text-zinc-500">
                  {new Date(event.starts_at).toLocaleString()}
                  {event.location && ` — ${event.location}`}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEdit(event)}
                  className="text-zinc-200 hover:text-white"
                >
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(event.id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
          {events.length === 0 && (
            <p className="text-center text-sm text-zinc-500">No events yet.</p>
          )}
        </div>
      )}
    </div>
  )
}
