"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Profile } from "@/types/database"
import { useViewMode } from "@/lib/stores/view-mode-store"
import { playerLinks, adminLinks, type MemberNavLink } from "@/lib/member-nav"

// basePath handled by next.config.ts

function NavList({ links, pathname }: { links: MemberNavLink[]; pathname: string }) {
  return (
    <ul className="space-y-0.5">
      {links.map((link) => {
        const isActive = pathname === link.href || pathname === `/${link.href}`
        const Icon = link.icon
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-accent/15 font-semibold text-accent-dark"
                  : "text-muted-foreground hover:bg-paper hover:text-ink"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={isActive ? 2.2 : 1.8} />
              {link.label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

export function MemberSidebar({ profile, brandUploaded = true }: { profile: Profile; brandUploaded?: boolean }) {
  const pathname = usePathname()
  const router = useRouter()
  const isAdmin = profile.role === "coach" || profile.role === "superadmin"
  const isSuperadmin = profile.role === "superadmin"
  const canSwitchView = isAdmin && profile.also_plays
  const { viewAs, setViewAs } = useViewMode()
  const showAdmin = isAdmin && (!canSwitchView || viewAs === "admin")

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push(`/login`)
  }

  const roleBadgeColor =
    profile.role === "superadmin"
      ? "bg-amber-100 text-amber-800 border border-amber-200"
      : profile.role === "coach"
        ? "bg-blue-100 text-blue-800 border border-blue-200"
        : "bg-zinc-100 text-zinc-700 border border-zinc-200"

  const initials = profile.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "?"

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-0 flex h-screen w-64 flex-col border-r border-border bg-white">
        {/* Logo */}
        <div className="px-5 pb-4 pt-6">
          <span className="font-heading text-lg font-bold tracking-tight text-ink">Baltimore Kings</span>
        </div>

        {/* User Info */}
        <div className="mx-4 mb-4 rounded-xl border border-border bg-paper p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-semibold text-paper">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{profile.full_name}</p>
              <span
                className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${roleBadgeColor}`}
              >
                {profile.role}
              </span>
            </div>
          </div>

          {canSwitchView && (
            <div className="mt-3 border-t border-border pt-3">
              <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Viewing as
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => setViewAs("admin")}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    viewAs === "admin" ? "bg-ink text-white" : "bg-white text-muted-foreground hover:text-ink"
                  }`}
                >
                  {profile.role === "superadmin" ? "Admin" : "Coach"}
                </button>
                <button
                  onClick={() => setViewAs("player")}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    viewAs === "player" ? "bg-ink text-white" : "bg-white text-muted-foreground hover:text-ink"
                  }`}
                >
                  Player
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Navigation
          </p>
          <NavList links={playerLinks} pathname={pathname} />

          {showAdmin && (
            <>
              <div className="my-4 border-t border-border" />
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Admin
              </p>
              <NavList links={adminLinks} pathname={pathname} />
            </>
          )}

          {isSuperadmin && !brandUploaded && (
            <div className="mx-1 mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
              <p className="text-xs text-amber-800">
                Brand assets pending upload.{" "}
                <Link href="/app/admin/social" className="underline hover:text-amber-900">
                  Go to Social &amp; Brand
                </Link>
              </p>
            </div>
          )}
        </nav>

        {/* Sign Out */}
        <div className="border-t border-border p-3">
          <button
            onClick={handleSignOut}
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
          >
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  )
}
