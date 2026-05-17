"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { Profile } from "@/types/database"
import { useViewMode } from "@/lib/stores/view-mode-store"
import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

// basePath handled by next.config.ts

const playerLinks = [
  { href: "/app", label: "Dashboard", icon: "◆" },
  { href: "/app/profile", label: "Profile", icon: "●" },
  { href: "/app/documents", label: "Documents", icon: "▤" },
  { href: "/app/payments", label: "Payments", icon: "◈" },
  { href: "/app/games", label: "Game History", icon: "▶" },
  { href: "/app/tactics", label: "Tactics", icon: "⬡" },
  { href: "/app/videos", label: "VEO Videos", icon: "▷" },
  { href: "/app/achievements", label: "Achievements", icon: "★" },
  { href: "/app/contracts", label: "Contracts", icon: "◫" },
  { href: "/app/training", label: "Training", icon: "◭" },
  { href: "/app/evaluations", label: "Evaluations", icon: "◮" },
]

const adminLinks = [
  { href: "/app/admin/approvals", label: "Approvals", icon: "✓" },
  { href: "/app/admin/roster", label: "Roster Manager", icon: "⊞" },
  { href: "/app/admin/players", label: "All Players", icon: "⊟" },
  { href: "/app/admin/schedule", label: "Schedule", icon: "▦" },
  { href: "/app/admin/tactics", label: "Tactics Board", icon: "⬡" },
  { href: "/app/admin/videos", label: "VEO Videos", icon: "▷" },
  { href: "/app/admin/achievements", label: "Achievements", icon: "★" },
  { href: "/app/admin/goals", label: "Player Goals", icon: "◎" },
  { href: "/app/admin/applications", label: "Applications", icon: "◧" },
  { href: "/app/admin/media", label: "Media", icon: "◩" },
  { href: "/app/admin/contracts", label: "Contracts", icon: "◫" },
  { href: "/app/admin/training", label: "Training", icon: "◭" },
  { href: "/app/admin/tutorials", label: "Tutorials", icon: "▣" },
  { href: "/app/admin/requirements", label: "Requirements", icon: "▢" },
  { href: "/app/admin/scouting", label: "Scouting", icon: "◬" },
  { href: "/app/admin/evaluations", label: "Evaluations", icon: "◮" },
]

const superadminLinks = [
  { href: "/app/admin/brand", label: "Brand Assets", icon: "★" },
  { href: "/app/admin/audit", label: "Audit Log", icon: "◉" },
]

function SidebarContent({ profile, brandUploaded }: { profile: Profile; brandUploaded: boolean }) {
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
      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
      : profile.role === "coach"
        ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
        : "bg-zinc-500/20 text-zinc-300 border border-zinc-500/30"

  const initials = profile.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "?"

  return (
    <div className="flex h-full w-64 flex-col bg-[#0f0f0f] border-r border-white/5">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4">
        <span className="text-lg font-bold tracking-tight text-white">
          Baltimore Kings
        </span>
      </div>

      {/* User Info */}
      <div className="mx-4 mb-4 rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {profile.full_name}
            </p>
            <span
              className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${roleBadgeColor}`}
            >
              {profile.role}
            </span>
          </div>
        </div>

        {canSwitchView && (
          <div className="mt-3 pt-3 border-t border-white/5">
            <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-amber-400/80">
              Viewing as
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setViewAs("admin")}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  viewAs === "admin"
                    ? "bg-amber-500 text-black"
                    : "bg-white/5 text-white/50 hover:text-white"
                }`}
              >
                {profile.role === "superadmin" ? "Admin" : "Coach"}
              </button>
              <button
                onClick={() => setViewAs("player")}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  viewAs === "player"
                    ? "bg-amber-500 text-black"
                    : "bg-white/5 text-white/50 hover:text-white"
                }`}
              >
                Player
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-amber-400/80">
          Navigation
        </p>
        <ul className="space-y-0.5">
          {playerLinks.map((link) => {
            const isActive = pathname === link.href || pathname === `/${link.href}`
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-white/5 font-medium text-white"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="text-xs opacity-60">{link.icon}</span>
                  {link.label}
                </Link>
              </li>
            )
          })}
        </ul>

        {showAdmin && (
          <>
            <div className="my-4 border-t border-white/5" />
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-amber-400/80">
              Admin
            </p>
            <ul className="space-y-0.5">
              {adminLinks.map((link) => {
                const isActive = pathname === link.href || pathname === `/${link.href}`
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                        isActive
                          ? "bg-white/5 font-medium text-white"
                          : "text-white/60 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="text-xs opacity-60">{link.icon}</span>
                      {link.label}
                    </Link>
                  </li>
                )
              })}
              {isSuperadmin &&
                superadminLinks.map((link) => {
                  const isActive = pathname === link.href || pathname === `/${link.href}`
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                          isActive
                            ? "bg-white/5 font-medium text-white"
                            : "text-white/60 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <span className="text-xs opacity-60">{link.icon}</span>
                        {link.label}
                      </Link>
                    </li>
                  )
                })}
            </ul>
          </>
        )}

        {isSuperadmin && !brandUploaded && (
          <div className="mx-1 mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5">
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
      <div className="border-t border-white/5 p-3">
        <button
          onClick={handleSignOut}
          className="w-full rounded-lg px-3 py-2 text-left text-sm text-white/40 transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}

export function MemberSidebar({ profile, brandUploaded = true }: { profile: Profile; brandUploaded?: boolean }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block">
        <SidebarContent profile={profile} brandUploaded={brandUploaded} />
      </aside>

      {/* Mobile sheet */}
      <div className="lg:hidden fixed top-0 left-0 z-40 p-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            className="rounded-lg border border-white/10 bg-[#0f0f0f] p-2 text-white"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 border-white/5 bg-[#0f0f0f]">
            <SidebarContent profile={profile} brandUploaded={brandUploaded} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
