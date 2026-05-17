import Link from "next/link"
import { getInitials } from "@/lib/utils"

export type PlayerCardData = {
  id: string
  fullName: string
  photoUrl: string | null
  jerseyNumber: number | null
  position: string | null
  status?: string | null
  teamTags?: string[]
  nickname?: string | null
}

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  injured: "bg-red-100 text-red-700 ring-red-300",
  inactive: "bg-zinc-100 text-zinc-600 ring-zinc-200",
  pending: "bg-amber-100 text-amber-800 ring-amber-200",
  archived: "bg-zinc-100 text-zinc-500 ring-zinc-200",
}

const TAG_STYLES: Record<string, string> = {
  K1: "bg-brand text-paper",
  K2: "bg-brand-light text-paper",
  MASL3: "bg-court text-accent",
  Steaks: "bg-accent text-court",
}

export function PlayerCard({ player }: { player: PlayerCardData }) {
  const status = player.status?.toLowerCase()
  return (
    <Link
      href={`/roster/${player.id}`}
      className="lift-card group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-white"
    >
      {/* Photo / placeholder */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-secondary">
        {player.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={player.photoUrl}
            alt={player.fullName}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand to-court">
            <span className="font-heading text-5xl text-accent/80">
              {getInitials(player.fullName)}
            </span>
          </div>
        )}

        {/* Jersey number */}
        {player.jerseyNumber != null && (
          <span className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-court/85 font-heading text-sm text-accent backdrop-blur">
            {player.jerseyNumber}
          </span>
        )}

        {/* Status badge */}
        {status && status !== "active" && (
          <span
            className={`absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ${
              STATUS_STYLES[status] ?? STATUS_STYLES.inactive
            }`}
          >
            {status}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-heading text-base leading-tight text-ink">
          {player.fullName}
        </h3>
        {player.nickname && (
          <p className="mt-0.5 text-xs italic text-muted-foreground">
            &ldquo;{player.nickname}&rdquo;
          </p>
        )}
        <p className="mt-1 text-sm text-muted-foreground">
          {player.position || "Position TBA"}
        </p>

        {/* Team tags */}
        {player.teamTags && player.teamTags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {player.teamTags.map((tag) => (
              <span
                key={tag}
                className={`rounded-md px-2 py-0.5 font-heading text-[10px] tracking-wide ${
                  TAG_STYLES[tag] ?? "bg-secondary text-ink"
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
