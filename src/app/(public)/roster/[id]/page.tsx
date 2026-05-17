import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ArrowLeft, MapPin, GraduationCap, Calendar, Trophy } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { calculateAge, formatDate, getInitials, teamTag } from "@/lib/utils"

export const dynamic = "force-dynamic"

const TAG_STYLES: Record<string, string> = {
  K1: "bg-brand text-paper",
  K2: "bg-brand-light text-paper",
  MASL3: "bg-court text-accent",
  Steaks: "bg-accent text-court",
}

async function getPlayer(id: string) {
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (!profile) return null

  const { data: members } = await supabase
    .from("team_members")
    .select("position, teams(name, slug)")
    .eq("profile_id", id)

  const { data: history } = await supabase
    .from("player_club_history")
    .select("*")
    .eq("profile_id", id)
    .order("display_order", { ascending: true })

  return { profile, members: members ?? [], history: history ?? [] }
}

export async function generateMetadata({
  params,
}: PageProps<"/roster/[id]">): Promise<Metadata> {
  const { id } = await params
  const data = await getPlayer(id)
  if (!data) return { title: "Player Not Found | Baltimore Kings" }
  const { profile } = data
  return {
    title: `${profile.full_name} | Baltimore Kings`,
    description:
      profile.bio?.slice(0, 155) ||
      `${profile.full_name} — Baltimore Kings player profile.`,
  }
}

export default async function PlayerBioPage({
  params,
}: PageProps<"/roster/[id]">) {
  const { id } = await params
  const data = await getPlayer(id)
  if (!data) notFound()

  const { profile, members, history } = data
  const age = calculateAge(profile.date_of_birth)

  const tags = new Set<string>()
  for (const m of members as unknown as {
    teams: { slug: string } | { slug: string }[] | null
  }[]) {
    const team = Array.isArray(m.teams) ? m.teams[0] : m.teams
    const t = teamTag(team?.slug)
    if (t) tags.add(t)
  }
  if (profile.also_plays_for_steaks) tags.add("Steaks")
  const teamTags = Array.from(tags)

  const facts: { label: string; value: string }[] = [
    { label: "Age", value: age != null ? `${age} years old` : "—" },
    { label: "Date of Birth", value: formatDate(profile.date_of_birth) },
    { label: "Primary Position", value: profile.position_primary || "—" },
    { label: "Secondary Position", value: profile.position_secondary || "—" },
    {
      label: "Years in Club",
      value: profile.years_in_club != null ? String(profile.years_in_club) : "—",
    },
    { label: "Status", value: profile.status },
  ]

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/roster"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to roster
          </Link>

          <div className="mt-6 grid gap-8 md:grid-cols-[320px_1fr] md:gap-12">
            {/* Photo */}
            <div className="overflow-hidden rounded-2xl border border-border bg-secondary">
              <div className="relative aspect-[4/5] w-full">
                {profile.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.photo_url}
                    alt={profile.full_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand to-court">
                    <span className="font-heading text-7xl text-accent/80">
                      {getInitials(profile.full_name)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Identity */}
            <div className="flex flex-col justify-center">
              <div className="flex flex-wrap items-center gap-2">
                {profile.jersey_number != null && (
                  <span className="flex h-9 items-center rounded-full bg-court px-3 font-heading text-sm text-accent">
                    #{profile.jersey_number}
                  </span>
                )}
                {profile.is_minor && (
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-800 ring-1 ring-amber-200">
                    Minor
                  </span>
                )}
                {profile.status?.toLowerCase() === "injured" && (
                  <span className="rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-red-700 ring-1 ring-red-300">
                    Injured
                  </span>
                )}
              </div>

              <h1 className="mt-4 font-heading text-4xl tracking-tight text-ink sm:text-5xl">
                {profile.full_name}
              </h1>
              {profile.nickname && (
                <p className="mt-1 text-lg italic text-muted-foreground">
                  &ldquo;{profile.nickname}&rdquo;
                </p>
              )}

              {teamTags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {teamTags.map((tag) => (
                    <span
                      key={tag}
                      className={`rounded-md px-2.5 py-1 font-heading text-xs tracking-wide ${
                        TAG_STYLES[tag] ?? "bg-secondary text-ink"
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Quick meta row */}
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                {profile.hometown && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-accent" />
                    {profile.hometown}
                  </span>
                )}
                {profile.school && (
                  <span className="inline-flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4 text-accent" />
                    {profile.school}
                  </span>
                )}
                {age != null && (
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-accent" />
                    {age} years old
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="bg-paper py-12 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-8">
          {/* Left column — bio, history, stats */}
          <div className="space-y-10">
            {/* Bio */}
            <div>
              <h2 className="font-heading text-2xl text-ink">About</h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-ink/80">
                {profile.bio || "No bio has been added for this player yet."}
              </p>
            </div>

            {/* Club history */}
            <div>
              <h2 className="font-heading text-2xl text-ink">Club History</h2>
              {history.length > 0 ? (
                <div className="mt-4 overflow-hidden rounded-xl border border-border bg-white">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-border bg-secondary/60">
                      <tr>
                        <th className="px-4 py-3 font-heading text-xs uppercase tracking-wide text-muted-foreground">
                          Year
                        </th>
                        <th className="px-4 py-3 font-heading text-xs uppercase tracking-wide text-muted-foreground">
                          Team
                        </th>
                        <th className="px-4 py-3 font-heading text-xs uppercase tracking-wide text-muted-foreground">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {history.map((h) => (
                        <tr key={h.id}>
                          <td className="whitespace-nowrap px-4 py-3 font-heading text-ink">
                            {h.year_label}
                          </td>
                          <td className="px-4 py-3 text-ink/80">{h.team}</td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {h.note || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="mt-3 rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                  No club history recorded yet.
                </p>
              )}
            </div>

            {/* Stats */}
            <div>
              <h2 className="font-heading text-2xl text-ink">Season Stats</h2>
              <div className="mt-3 flex items-center gap-3 rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                <Trophy className="h-5 w-5 text-accent" />
                Stats coming soon — match data will appear here once the season is logged.
              </div>
            </div>
          </div>

          {/* Right column — fact card */}
          <aside>
            <div className="rounded-2xl border border-border bg-white p-6">
              <h3 className="font-heading text-lg text-ink">Player Info</h3>
              <dl className="mt-4 space-y-3">
                {facts.map((f) => (
                  <div
                    key={f.label}
                    className="flex items-center justify-between gap-4 border-b border-border/60 pb-3 last:border-0 last:pb-0"
                  >
                    <dt className="text-sm text-muted-foreground">{f.label}</dt>
                    <dd className="text-right text-sm font-medium capitalize text-ink">
                      {f.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}
