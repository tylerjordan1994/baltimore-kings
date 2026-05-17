"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

const VIDEO_TAGS = [
  "Futsal Practice",
  "Futsal Game",
  "MASL3 Game",
  "MASL3 Practice",
  "Tournament",
  "Scrimmage",
] as const

interface VideoRecord {
  id: string
  veo_url: string | null
  kind: string | null
  notes_markdown: string | null
  recorded_at: string | null
  title: string | null
  created_at: string
}

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [filterTag, setFilterTag] = useState("")

  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("video_recordings")
        .select("*")
        .order("recorded_at", { ascending: false })
      setVideos((data as VideoRecord[]) || [])
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = filterTag
    ? videos.filter((v) => v.kind === filterTag)
    : videos

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Game Film</h1>
        <select
          value={filterTag}
          onChange={(e) => setFilterTag(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
        >
          <option value="">All Tags</option>
          {VIDEO_TAGS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-500">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-500">No videos available yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((v) => (
            <a
              key={v.id}
              href={v.veo_url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl border border-zinc-800 bg-zinc-900 p-5 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm font-medium text-white">
                      {v.title || "Untitled"}
                    </h2>
                    {v.kind && (
                      <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                        {v.kind}
                      </span>
                    )}
                  </div>
                  {v.recorded_at && (
                    <p className="mt-1 text-xs text-zinc-500">
                      {new Date(v.recorded_at).toLocaleDateString()}
                    </p>
                  )}
                  {v.notes_markdown && (
                    <div className="mt-2 rounded-lg bg-blue-500/10 border border-blue-500/20 p-2">
                      <p className="text-xs font-medium text-blue-400 mb-0.5">Coach Notes</p>
                      <p className="text-sm text-zinc-300 whitespace-pre-wrap">{v.notes_markdown}</p>
                    </div>
                  )}
                </div>
                <span className="ml-3 text-xs text-zinc-500 shrink-0">
                  Open in VEO
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
