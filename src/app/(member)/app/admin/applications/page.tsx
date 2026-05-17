'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import type { Application, ApplicationStatus } from '@/types/database'

// basePath handled by next.config.ts

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [filter, setFilter] = useState<ApplicationStatus | 'all'>('all')

  const supabase = createClient()

  const loadData = useCallback(async () => {
    let query = supabase.from('applications').select('*').order('created_at', { ascending: false })
    if (filter !== 'all') {
      query = query.eq('status', filter)
    }
    const { data } = await query
    if (data) setApplications(data)
  }, [filter]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadData()
  }, [loadData])

  async function handleInvite(id: string) {
    const supabaseServer = createClient()
    const { data: { user } } = await supabaseServer.auth.getUser()
    await supabase
      .from('applications')
      .update({ status: 'invited', reviewed_by: user?.id, reviewed_at: new Date().toISOString() })
      .eq('id', id)
    loadData()
  }

  async function handleReject(id: string) {
    const supabaseServer = createClient()
    const { data: { user } } = await supabaseServer.auth.getUser()
    await supabase
      .from('applications')
      .update({ status: 'rejected', reviewed_by: user?.id, reviewed_at: new Date().toISOString() })
      .eq('id', id)
    loadData()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Application Review</h1>
        <p className="text-zinc-400">Review player applications.</p>
      </div>

      <div className="flex gap-2">
        {(['all', 'new', 'reviewed', 'invited', 'rejected'] as const).map((s) => (
          <Button
            key={s}
            size="sm"
            variant={filter === s ? 'default' : 'outline'}
            onClick={() => setFilter(s)}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {applications.map((app) => (
          <div key={app.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-white">{app.full_name}</h3>
                <p className="text-sm text-zinc-400">{app.email} {app.phone && `| ${app.phone}`}</p>
              </div>
              <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs uppercase text-zinc-400">
                {app.status}
              </span>
            </div>
            <div className="mb-3 grid gap-2 text-sm text-zinc-300 sm:grid-cols-2">
              {app.date_of_birth && <p>DOB: {app.date_of_birth}</p>}
              {app.years_experience != null && <p>Experience: {app.years_experience} years</p>}
              {app.position_preference && <p>Position: {app.position_preference}</p>}
              {app.prior_teams && <p>Prior teams: {app.prior_teams}</p>}
            </div>
            {app.notes && (
              <p className="mb-3 text-sm text-zinc-400">Notes: {app.notes}</p>
            )}
            <p className="mb-3 text-xs text-zinc-600">
              Applied {new Date(app.created_at).toLocaleDateString()}
            </p>
            {app.status === 'new' && (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleInvite(app.id)}>
                  Invite
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleReject(app.id)}>
                  Reject
                </Button>
              </div>
            )}
          </div>
        ))}
        {applications.length === 0 && (
          <p className="text-center text-sm text-zinc-500">No applications found.</p>
        )}
      </div>
    </div>
  )
}
