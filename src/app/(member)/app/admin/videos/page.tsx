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

type VideoTag = typeof VIDEO_TAGS[number]

interface VideoRecord {
  id: string
  veo_url: string | null
  kind: string | null
  notes_markdown: string | null
  recorded_at: string | null
  title: string | null
  created_at: string
}

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<VideoRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [title, setTitle] = useState("")
  const [veoUrl, setVeoUrl] = useState("")
  const [tag, setTag] = useState<string>(VIDEO_TAGS[0])
  const [notes, setNotes] = useState("")
  const [recordedAt, setRecordedAt] = useState("")

  const supabase = createClient()

  useEffect(() => {
    fetchVideos()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchVideos() {
    setLoading(true)
    const { data } = await supabase
      .from("video_recordings")
      .select("*")
      .order("recorded_at", { ascending: false })
    setVideos((data as VideoRecord[]) || [])
    setLoading(false)
  }

  function resetForm() {
    setTitle("")
    setVeoUrl("")
    setTag(VIDEO_TAGS[0])
    setNotes("")
    setRecordedAt("")
    setEditingId(null)
  }

  function openEdit(video: VideoRecord) {
    setEditingId(video.id)
    setTitle(video.title || "")
    setVeoUrl(video.veo_url || "")
    setTag(video.kind || VIDEO_TAGS[0])
    setNotes(video.notes_markdown || "")
    setRecordedAt(video.recorded_at?.split("T")[0] || "")
    setShowForm(true)
  }

  async function handleSubmit() {
    if (!title.trim() || !veoUrl.trim()) return
    setSubmitting(true)

    const payload = {
      title: title.trim(),
      veo_url: veoUrl.trim(),
      kind: tag,
      notes_markdown: notes.trim() || null,
      recorded_at: recordedAt || new Date().toISOString().split("T")[0],
    }

    if (editingId) {
      await supabase.from("video_recordings").update(payload).eq("id", editingId)
    } else {
      await supabase.from("video_recordings").insert(payload)
    }

    setShowForm(false)
    resetForm()
    setSubmitting(false)
    fetchVideos()
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this video?")) return
    await supabase.from("video_recordings").delete().eq("id", id)
    fetchVideos()
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">VEO Videos</h1>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-paper hover:bg-brand-light transition-colors"
        >
          Add Video
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : videos.length === 0 ? (
        <div className="rounded-xl border border-border bg-white shadow-sm p-6">
          <p className="text-sm text-muted-foreground">No videos added yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {videos.map((v) => (
            <div key={v.id} className="rounded-xl border border-border bg-white shadow-sm p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <a
                      href={v.veo_url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-ink hover:text-accent-dark transition-colors"
                    >
                      {v.title || "Untitled"}
                    </a>
                    {v.kind && (
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-700">
                        {v.kind}
                      </span>
                    )}
                  </div>
                  {v.recorded_at && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(v.recorded_at).toLocaleDateString()}
                    </p>
                  )}
                  {v.notes_markdown && (
                    <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                      {v.notes_markdown}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 ml-3">
                  <button
                    onClick={() => openEdit(v)}
                    className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-ink/80 hover:bg-zinc-200 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(v.id)}
                    className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-white shadow-sm p-6">
            <h2 className="text-lg font-bold text-ink mb-4">
              {editingId ? "Edit Video" : "Add VEO Video"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. MASL3 vs Philadelphia"
                  className="w-full rounded-lg border border-border bg-white px-4 py-2 text-ink placeholder:text-muted-foreground focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1">VEO Link</label>
                <input
                  type="url"
                  value={veoUrl}
                  onChange={(e) => setVeoUrl(e.target.value)}
                  placeholder="https://app.veo.co/..."
                  className="w-full rounded-lg border border-border bg-white px-4 py-2 text-ink placeholder:text-muted-foreground focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink/80 mb-1">Tag</label>
                  <select
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    className="w-full rounded-lg border border-border bg-white px-4 py-2 text-ink focus:border-amber-500 focus:outline-none"
                  >
                    {VIDEO_TAGS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink/80 mb-1">Date</label>
                  <input
                    type="date"
                    value={recordedAt}
                    onChange={(e) => setRecordedAt(e.target.value)}
                    className="w-full rounded-lg border border-border bg-white px-4 py-2 text-ink focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Coaching notes for this video..."
                  className="w-full rounded-lg border border-border bg-white px-4 py-2 text-ink placeholder:text-muted-foreground focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSubmit}
                  disabled={!title.trim() || !veoUrl.trim() || submitting}
                  className="rounded-lg bg-brand px-6 py-2 text-sm font-medium text-paper hover:bg-brand-light disabled:opacity-50 transition-colors"
                >
                  {submitting ? "Saving..." : editingId ? "Update" : "Add Video"}
                </button>
                <button
                  onClick={() => { setShowForm(false); resetForm() }}
                  className="rounded-lg bg-zinc-100 px-6 py-2 text-sm font-medium text-ink hover:bg-zinc-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
