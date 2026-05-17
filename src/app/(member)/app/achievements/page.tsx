'use client'

import { useEffect, useState, useCallback } from 'react'
import { Trophy } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Achievement } from '@/types/database'

export default function PlayerAchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  const loadAchievements = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('achievements')
      .select('*')
      .eq('profile_id', user.id)
      .order('achievement_date', { ascending: false })

    if (data) setAchievements(data)
    setLoading(false)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadAchievements()
  }, [loadAchievements])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading achievements...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Achievements</h1>
        <p className="text-muted-foreground">Awards and recognitions assigned to you by coaches.</p>
      </div>

      {achievements.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <Trophy className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-lg font-semibold text-foreground">No achievements yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Achievements are added by coaches after games and at the end of each season.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {achievements.map((a) => (
            <div
              key={a.id}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/10">
                  <Trophy className="h-4 w-4 text-amber-500" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{a.title}</p>
                  {a.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{a.description}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {a.season && (
                      <span className="rounded bg-muted px-2 py-0.5">Season: {a.season}</span>
                    )}
                    {a.achievement_date && (
                      <span>
                        {new Date(a.achievement_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
