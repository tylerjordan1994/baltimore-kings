'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

const basePath = '/project/football-team'

export function ApprovalActions({ profileId }: { profileId: string }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleApprove() {
    setLoading(true)
    await fetch(`${basePath}/api/admin/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId }),
    })
    setDone(true)
    setLoading(false)
  }

  async function handleReject() {
    if (!confirm('Are you sure you want to reject this account? This will delete their profile.')) return
    setLoading(true)
    await fetch(`${basePath}/api/admin/approve`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId }),
    })
    setDone(true)
    setLoading(false)
  }

  if (done) {
    return <span className="text-xs text-zinc-500">Done</span>
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" disabled={loading} onClick={handleApprove}>
        Approve
      </Button>
      <Button size="sm" variant="destructive" disabled={loading} onClick={handleReject}>
        Reject
      </Button>
    </div>
  )
}
