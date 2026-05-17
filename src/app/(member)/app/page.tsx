import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"

// basePath handled by next.config.ts

const tiles = [
  {
    href: "/app/profile",
    icon: "●",
    label: "Profile",
    description: "Update your photo, positions, and personal details.",
  },
  {
    href: "/app/payments",
    icon: "◈",
    label: "Payments",
    description: "View dues, pay outstanding fees, and see payment history.",
  },
  {
    href: "/app/schedule",
    icon: "▦",
    label: "Schedule",
    description: "Practices, games, and team events in calendar or list view.",
  },
  {
    href: "/app/tactics",
    icon: "⬡",
    label: "Play Builder",
    description: "Explore team tactics and set-piece plays.",
  },
  {
    href: "/app/videos",
    icon: "▷",
    label: "VEO Videos",
    description: "Watch match film and recorded game footage.",
  },
  {
    href: "/app/training",
    icon: "◭",
    label: "Training & Tutorials",
    description: "Your training assignments and coaching tutorials.",
  },
  {
    href: "/app/evaluations",
    icon: "◮",
    label: "Goals & Evaluations",
    description: "Track your goals and review coach evaluations.",
  },
  {
    href: "/app/achievements",
    icon: "★",
    label: "Achievements",
    description: "Badges and milestones you have earned.",
  },
  {
    href: "/app/contracts",
    icon: "◫",
    label: "Contracts",
    description: "Review and manage your player contracts.",
  },
  {
    href: "/app/requirements",
    icon: "▢",
    label: "Requirements",
    description: "Sign documents and forms the club needs from you.",
  },
]

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect(`/login`)

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Hello, {profile?.full_name?.split(" ")[0] ?? "Player"}
        </h1>
        <p className="mt-1 text-zinc-400">
          Jump to any part of your player area.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((tile) => (
          <Link
            key={tile.href}
            href={tile.href}
            className="group flex flex-col rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition-colors hover:border-amber-500/40 hover:bg-zinc-800/60"
          >
            <span className="mb-3 text-2xl text-amber-400/80">
              {tile.icon}
            </span>
            <span className="text-base font-semibold text-white group-hover:text-amber-300">
              {tile.label}
            </span>
            <span className="mt-1 text-sm text-zinc-400">
              {tile.description}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
