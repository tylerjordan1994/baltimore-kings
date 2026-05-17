"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { Profile } from "@/types/database"
import { useViewMode } from "@/lib/stores/view-mode-store"

// basePath handled by next.config.ts

const playerLinks = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/profile", label: "Profile" },
  { href: "/app/documents", label: "Documents" },
  { href: "/app/payments", label: "Payments" },
  { href: "/app/games", label: "Game History" },
  { href: "/app/tactics", label: "Tactics" },
  { href: "/app/tutorials", label: "Tutorials" },
]

const adminLinks = [
  { href: "/app/admin/approvals", label: "Approvals" },
  { href: "/app/admin/roster", label: "Roster Manager" },
  { href: "/app/admin/schedule", label: "Schedule Manager" },
  { href: "/app/admin/applications", label: "Applications" },
  { href: "/app/admin/media", label: "Media Manager" },
]

const superadminLinks = [
  { href: "/app/admin/brand", label: "Brand Assets" },
]

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
      ? "bg-purple-500/20 text-purple-300"
      : profile.role === "coach"
        ? "bg-blue-500/20 text-blue-300"
        : "bg-green-500/20 text-green-300"

  return (
    <aside className="flex w-64 flex-col border-r border-zinc-800 bg-zinc-900">
      {/* Header */}
      <div className="border-b border-zinc-800 p-4">
        <p className="truncate font-semibold text-white">
          {profile.full_name}
        </p>
        <span
          className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${roleBadgeColor}`}
        >
          {profile.role}
        </span>

        {canSwitchView && (
          <div className="mt-3">
            <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              Viewing as
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setViewAs("admin")}
                className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                  viewAs === "admin"
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                {profile.role === "superadmin" ? "Admin" : "Coach"}
              </button>
              <button
                onClick={() => setViewAs("player")}
                className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                  viewAs === "player"
                    ? "bg-green-600 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                Player
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {playerLinks.map((link) => {
            const fullHref = `/${link.href}`
            const isActive = pathname === fullHref
            return (
              <li key={link.href}>
                <Link
                  href={fullHref}
                  className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-zinc-800 font-medium text-white"
                      : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            )
          })}
        </ul>

        {showAdmin && (
          <>
            <div className="my-3 border-t border-zinc-800" />
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Admin
            </p>
            <ul className="space-y-1">
              {adminLinks.map((link) => {
                const fullHref = `/${link.href}`
                const isActive = pathname === fullHref
                return (
                  <li key={link.href}>
                    <Link
                      href={fullHref}
                      className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                        isActive
                          ? "bg-zinc-800 font-medium text-white"
                          : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                )
              })}
              {isSuperadmin &&
                superadminLinks.map((link) => {
                  const fullHref = `/${link.href}`
                  const isActive = pathname === fullHref
                  return (
                    <li key={link.href}>
                      <Link
                        href={fullHref}
                        className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                          isActive
                            ? "bg-zinc-800 font-medium text-white"
                            : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                        }`}
                      >
                        {link.label}
                      </Link>
                    </li>
                  )
                })}
            </ul>
          </>
        )}

        {isSuperadmin && !brandUploaded && (
          <div className="mx-3 mt-3 rounded-lg border border-amber-800/50 bg-amber-950/30 px-3 py-2">
            <p className="text-xs text-amber-400">
              Brand assets pending upload.{" "}
              <Link href="/app/admin/brand" className="underline hover:text-amber-300">
                Go to Brand Assets
              </Link>
            </p>
          </div>
        )}
      </nav>

      {/* Sign Out */}
      <div className="border-t border-zinc-800 p-3">
        <button
          onClick={handleSignOut}
          className="w-full rounded-md px-3 py-2 text-left text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
        >
          Sign Out
        </button>
      </div>
    </aside>
  )
}
