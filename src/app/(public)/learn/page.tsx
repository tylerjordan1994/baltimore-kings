"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { BookOpen, ExternalLink } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"

type Tutorial = {
  id: string
  title: string
  description: string | null
  youtube_url: string | null
  external_url: string | null
  category: string | null
  published: boolean
}

export default function LearnPage() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [filter, setFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    async function fetchTutorials() {
      const { data } = await supabase
        .from("tutorials")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false })

      const items = (data as Tutorial[]) || []
      setTutorials(items)
      const cats = [...new Set(items.map((t) => t.category).filter(Boolean))] as string[]
      setCategories(cats)
      setLoading(false)
    }

    fetchTutorials()
  }, [])

  const filtered = filter === "all" ? tutorials : tutorials.filter((t) => t.category === filter)

  function getEmbedUrl(url: string) {
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1]?.split("?")[0]
      return `https://www.youtube.com/embed/${id}`
    }
    if (url.includes("watch?v=")) {
      const id = url.split("watch?v=")[1]?.split("&")[0]
      return `https://www.youtube.com/embed/${id}`
    }
    return url
  }

  return (
    <>
      <section className="bg-primary py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
            Learn
          </h1>
          <p className="mt-2 text-primary-foreground/70">
            Futsal and arena soccer tutorials. Technical breakdowns, set pieces, positioning.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
              className="font-heading"
            >
              All
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={filter === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(cat)}
                className="font-heading capitalize"
              >
                {cat}
              </Button>
            ))}
          </div>

          {loading ? (
            <div className="mt-12 text-center text-muted-foreground">Loading tutorials...</div>
          ) : filtered.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((tutorial) => (
                <div
                  key={tutorial.id}
                  className="overflow-hidden rounded-lg border border-border bg-card"
                >
                  {tutorial.youtube_url && (
                    <div className="aspect-video">
                      <iframe
                        src={getEmbedUrl(tutorial.youtube_url)}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <p className="font-heading font-semibold">{tutorial.title}</p>
                    {tutorial.description && (
                      <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
                        {tutorial.description}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {tutorial.category && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                          {tutorial.category}
                        </span>
                      )}
                      {tutorial.external_url && (
                        <a
                          href={tutorial.external_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-gold hover:underline"
                        >
                          futsal.tech <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-12 rounded-lg border border-dashed border-border p-12 text-center">
              <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <p className="mt-3 font-heading text-lg font-semibold">Tutorials incoming</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Video breakdowns and written guides drop here throughout the season.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
