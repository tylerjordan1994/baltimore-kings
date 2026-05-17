"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { ImageIcon, Play, X, Film } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"

type MediaItem = {
  id: string
  title: string | null
  url: string
  thumbnail_url: string | null
  media_type: "photo" | "video"
  category: string | null
  created_at: string
}

const FILTERS = [
  { value: "all", label: "All" },
  { value: "photo", label: "Photos" },
  { value: "video", label: "Videos" },
]

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [filter, setFilter] = useState("all")
  const [lightbox, setLightbox] = useState<MediaItem | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    async function fetchMedia() {
      const { data } = await supabase
        .from("media_items")
        .select("*")
        .order("created_at", { ascending: false })

      setItems((data as MediaItem[]) || [])
      setLoading(false)
    }

    fetchMedia()
  }, [])

  const filtered = filter === "all" ? items : items.filter((i) => i.media_type === filter)

  return (
    <>
      <section className="bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Media
          </h1>
          <p className="mt-2 text-muted-foreground">
            Match footage, training clips, and game day photos.
          </p>
        </div>
      </section>

      <section className="bg-paper py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Filter */}
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`rounded-full px-4 py-1.5 font-heading text-sm font-semibold transition-all ${
                  filter === f.value
                    ? "bg-brand text-paper"
                    : "border border-border bg-white text-ink/70 hover:border-accent/30 hover:text-ink"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="mt-12 text-center text-muted-foreground">Loading media...</div>
          ) : filtered.length > 0 ? (
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.media_type === "photo") setLightbox(item)
                  }}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-white"
                >
                  {item.thumbnail_url || (item.media_type === "photo" && item.url) ? (
                    <Image
                      src={item.thumbnail_url || item.url}
                      alt={item.title || "Media"}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Film className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  {/* Glass overlay on hover */}
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                    {item.title && (
                      <p className="p-3 text-xs font-medium text-white">{item.title}</p>
                    )}
                  </div>
                  {item.media_type === "video" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
                        <Play className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-12 rounded-xl border border-dashed border-border p-12 text-center">
              <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 font-heading text-lg font-semibold text-ink">No media yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Photos and videos will be posted here after match days.
              </p>
            </div>
          )}

          {/* Inline video players */}
          {filter !== "photo" && filtered.filter((i) => i.media_type === "video").length > 0 && (
            <div className="mt-12 space-y-6">
              <h2 className="font-heading text-xl font-bold text-ink">Videos</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered
                  .filter((i) => i.media_type === "video")
                  .map((video) => (
                    <div key={video.id} className="overflow-hidden rounded-xl border border-border bg-white">
                      <div className="aspect-video bg-paper">
                        {video.url.includes("youtube.com") || video.url.includes("youtu.be") ? (
                          <iframe
                            src={video.url.replace("watch?v=", "embed/")}
                            className="h-full w-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <video
                            src={video.url}
                            controls
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      {video.title && (
                        <div className="p-3">
                          <p className="font-heading text-sm font-semibold text-ink">{video.title}</p>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10"
            onClick={() => setLightbox(null)}
          >
            <X className="h-5 w-5" />
          </button>
          <div className="relative max-h-[85vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={lightbox.url}
              alt={lightbox.title || "Photo"}
              width={1200}
              height={800}
              className="max-h-[85vh] w-auto rounded-lg object-contain"
            />
            {lightbox.title && (
              <p className="mt-3 text-center text-sm text-white/70">{lightbox.title}</p>
            )}
          </div>
        </div>
      )}
    </>
  )
}
