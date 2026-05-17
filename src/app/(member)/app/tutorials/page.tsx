"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Tutorial } from "@/types/database"

export default function TutorialsPage() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCategory, setFilterCategory] = useState("")

  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("tutorials")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
      setTutorials((data as Tutorial[]) || [])
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const categories = Array.from(new Set(tutorials.map((t) => t.category).filter(Boolean))) as string[]

  const filtered = filterCategory
    ? tutorials.filter((t) => t.category === filterCategory)
    : tutorials

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Tutorials</h1>
        {categories.length > 0 && (
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-zinc-500">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-500">No tutorials available yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((t) => (
            <div key={t.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-lg font-semibold text-white">{t.title}</h2>
                {t.category && (
                  <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                    {t.category}
                  </span>
                )}
              </div>

              {t.body_markdown && (
                <p className="text-sm text-zinc-300 whitespace-pre-wrap mb-3">
                  {t.body_markdown}
                </p>
              )}

              <div className="flex flex-wrap gap-3">
                {t.youtube_url && (
                  <a
                    href={t.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    Watch on YouTube
                  </a>
                )}
                {t.external_url && (
                  <a
                    href={t.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 text-xs font-medium text-blue-400 hover:bg-blue-500/20 transition-colors"
                  >
                    External Resource
                  </a>
                )}
              </div>

              <p className="mt-3 text-[10px] text-zinc-600">
                {new Date(t.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
