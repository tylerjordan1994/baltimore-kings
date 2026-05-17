"use client"

import { useEffect, useState } from "react"
import { BookOpen, ExternalLink, Video } from "lucide-react"
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

type StaticTutorial = {
  id: string
  title: string
  description: string
  category: string
  youtube_url?: string
}

const STATIC_TUTORIALS: StaticTutorial[] = [
  // Principles
  {
    id: "static-our-style",
    title: "Our Style",
    description:
      "We play man-to-man with help defense on the back end. On offense, the ball moves through screens and off-ball rotations. No hero ball. Every action creates an advantage for someone else.",
    category: "Principles",
  },
  {
    id: "static-futsal-vs-arena",
    title: "Futsal vs Indoor Arena",
    description:
      "Futsal uses a low-bounce ball on a hard court with touchline kick-ins and no boards. Arena soccer uses boards, a bouncier ball, and allows wall passes. The tactical demands are completely different — futsal rewards tight control and quick combination play, arena rewards physicality and transition speed.",
    category: "Principles",
  },
  // Positions (Futsal)
  {
    id: "static-goleiro",
    title: "Goleiro (Goalkeeper)",
    description:
      "The futsal keeper is a sweeper-keeper who starts attacks with precise distribution. In power play situations, the goleiro pushes up as a fifth outfield player. Command your box, read passing lanes, and stay connected to the back line.",
    category: "Positions (Futsal)",
  },
  {
    id: "static-fixo",
    title: "Fixo (Anchor)",
    description:
      "The fixo is the last outfield player, sitting deep to control tempo and cover rotations. You dictate when the team speeds up or slows down. Think of yourself as the safety valve — always available, always balanced, always scanning.",
    category: "Positions (Futsal)",
  },
  {
    id: "static-alas",
    title: "Alas (Wingers)",
    description:
      "Wingers make diagonal runs to stretch the defense and partner with the pivot on screen actions. Your job is to arrive in dangerous areas at the right moment — not too early, not too late. Master the cut-back and the underlap.",
    category: "Positions (Futsal)",
  },
  {
    id: "static-pivo",
    title: "Piv\u00f4 (Pivot)",
    description:
      "The pivot plays with their back to goal, holding the ball under pressure and setting screens for runners. You are the fulcrum of the attack — receive, protect, lay off, or turn. Physical strength and spatial awareness are everything in this role.",
    category: "Positions (Futsal)",
  },
  // Positions (Arena)
  {
    id: "static-arena-gk",
    title: "Arena Goalkeeper",
    description:
      "Arena keepers deal with boards, deflections, and power shots off the wall. Positioning changes because the ball can come from anywhere. Stay big, react fast, and communicate constantly with your back line about board bounces.",
    category: "Positions (Arena)",
  },
  {
    id: "static-arena-defender",
    title: "Arena Defender",
    description:
      "Arena defenders use physicality and the boards to their advantage. Win the ball, use the wall to pass to yourself, and get the transition started immediately. The best arena defenders are relentless in transition — defense to attack in one touch.",
    category: "Positions (Arena)",
  },
  {
    id: "static-arena-forward",
    title: "Arena Forward",
    description:
      "The arena forward is a target player who finishes in tight spaces. Hold the ball up, draw fouls, and put away chances. You live in the danger zone — six yards and in. First touch, first shot, no hesitation.",
    category: "Positions (Arena)",
  },
  // Defending
  {
    id: "static-man-to-man",
    title: "Man-to-Man with Help",
    description:
      "Our defensive system is simple: you have a man, you stay with your man, and your teammates provide help from behind. No switching unless forced. Communication is non-negotiable — call screens, call switches, call help. The system only works if everyone talks.",
    category: "Defending",
  },
  // Attacking
  {
    id: "static-off-ball",
    title: "Off-Ball Movement",
    description:
      "The player without the ball does the most important work. Create space by dragging your defender away from the action. Timing your run is more important than speed. If you are standing still, you are helping the defense.",
    category: "Attacking",
  },
  {
    id: "static-screens",
    title: "Screens and Picks",
    description:
      "We are a screen-heavy team. Set your feet, make contact legal, and let your teammate use you. The screener is often the one who ends up open — after you set it, roll hard to the ball or slip to space. Screens only work if both players commit.",
    category: "Attacking",
  },
]

const ALL_CATEGORIES = [
  "Principles",
  "Positions (Futsal)",
  "Positions (Arena)",
  "Defending",
  "Attacking",
]

export default function LearnPage() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([])
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

      setTutorials((data as Tutorial[]) || [])
      setLoading(false)
    }

    fetchTutorials()
  }, [])

  // Combine DB tutorials with static fallback
  const allCategories = [
    ...ALL_CATEGORIES,
    ...new Set(tutorials.map((t) => t.category).filter(Boolean) as string[]),
  ].filter((v, i, a) => a.indexOf(v) === i)

  const staticFiltered =
    filter === "all"
      ? STATIC_TUTORIALS
      : STATIC_TUTORIALS.filter((t) => t.category === filter)

  const dbFiltered =
    filter === "all" ? tutorials : tutorials.filter((t) => t.category === filter)

  return (
    <>
      <section className="relative overflow-hidden bg-court py-20 sm:py-24">
        <img
          src="/project/football-team/photos/futsal-action.jpg"
          alt="Futsal in action"
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Learn
          </h1>
          <p className="mt-2 text-white/80">
            Futsal and arena soccer education. How we play, how we think, how we train.
          </p>
          <a
            href="https://www.youtube.com/@danzafut"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            <Video className="h-4 w-4 text-red-400" />
            Coach Josh on YouTube
            <ExternalLink className="h-3 w-3 text-white/60" />
          </a>
        </div>
      </section>

      <section className="bg-paper py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-full px-4 py-1.5 font-heading text-sm font-semibold transition-all ${
                filter === "all"
                  ? "bg-brand text-paper"
                  : "border border-border bg-white text-ink/70 hover:border-accent/30 hover:text-ink"
              }`}
            >
              All
            </button>
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`rounded-full px-4 py-1.5 font-heading text-sm font-semibold transition-all ${
                  filter === cat
                    ? "bg-brand text-paper"
                    : "border border-border bg-white text-ink/70 hover:border-accent/30 hover:text-ink"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="mt-12 text-center text-muted-foreground">Loading tutorials...</div>
          ) : (
            <>
              {/* DB tutorials */}
              {dbFiltered.length > 0 && (
                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {dbFiltered.map((tutorial) => (
                    <div
                      key={tutorial.id}
                      className="overflow-hidden rounded-xl border border-border bg-white transition-all hover:border-accent/30"
                    >
                      {tutorial.youtube_url && (
                        <div className="aspect-video bg-paper">
                          <iframe
                            src={getEmbedUrl(tutorial.youtube_url)}
                            className="h-full w-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <p className="font-heading font-semibold text-ink">{tutorial.title}</p>
                        {tutorial.description && (
                          <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
                            {tutorial.description}
                          </p>
                        )}
                        {tutorial.category && (
                          <span className="mt-3 inline-block rounded-full bg-paper px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                            {tutorial.category}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Static tutorials */}
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {staticFiltered.map((tutorial) => (
                  <div
                    key={tutorial.id}
                    className="rounded-xl border border-border bg-white p-5 transition-all hover:border-accent/30"
                  >
                    <span className="inline-block rounded-full bg-paper px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      {tutorial.category}
                    </span>
                    <h3 className="mt-3 font-heading text-base font-semibold text-ink">
                      {tutorial.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {tutorial.description}
                    </p>
                    {tutorial.youtube_url && (
                      <a
                        href={tutorial.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                      >
                        Watch on YouTube <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>

              {dbFiltered.length === 0 && staticFiltered.length === 0 && (
                <div className="mt-12 rounded-xl border border-dashed border-border p-12 text-center">
                  <BookOpen className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-3 font-heading text-lg font-semibold text-ink">
                    No tutorials in this category yet
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  )
}

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
