import Link from "next/link"
import { Users } from "lucide-react"
import { getInitials } from "@/lib/utils"

export type TeamRosterEntry = {
  id: string
  profileId: string
  fullName: string
  photoUrl: string | null
  jerseyNumber: number | null
  position: string | null
}

export function TeamRosterGrid({
  members,
  emptyTitle = "Roster coming soon",
  emptyText = "Tryouts are in progress. Check back for the full squad.",
}: {
  members: TeamRosterEntry[]
  emptyTitle?: string
  emptyText?: string
}) {
  if (members.length === 0) {
    return (
      <div className="mt-8 rounded-xl border border-dashed border-border p-12 text-center">
        <Users className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-3 font-heading text-lg font-semibold text-ink">
          {emptyTitle}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{emptyText}</p>
      </div>
    )
  }

  return (
    <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {members.map((m) => (
        <Link
          key={m.id}
          href={`/roster/${m.profileId}`}
          className="lift-card group flex flex-col overflow-hidden rounded-xl border border-border bg-white"
        >
          <div className="relative aspect-square w-full overflow-hidden bg-secondary">
            {m.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={m.photoUrl}
                alt={m.fullName}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand to-court">
                <span className="font-heading text-4xl text-accent/80">
                  {getInitials(m.fullName)}
                </span>
              </div>
            )}
            {m.jerseyNumber != null && (
              <span className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-court/85 font-heading text-xs text-accent backdrop-blur">
                {m.jerseyNumber}
              </span>
            )}
          </div>
          <div className="p-3 text-center">
            <p className="font-heading text-sm leading-tight text-ink">
              {m.fullName}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {m.position || "—"}
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}
