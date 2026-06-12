"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, ChevronLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Profile } from "@/types/database"
import { useViewMode } from "@/lib/stores/view-mode-store"
import { playerLinks, adminLinks } from "@/lib/member-nav"
import { NotificationBell } from "./notification-bell"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

// basePath handled by next.config.ts

/** Top bar for the member area: mobile menu, notification bell, identity. */
export function MemberTopbar({ profile }: { profile: Profile }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const isAdmin = profile.role === "coach" || profile.role === "superadmin"
  const canSwitchView = isAdmin && profile.also_plays
  const { viewAs, setViewAs } = useViewMode()
  const showAdmin = isAdmin && (!canSwitchView || viewAs === "admin")

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push(`/login`)
  }

  const initials = profile.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "?"

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Mobile menu */}
        <div className="lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="rounded-lg border border-border bg-white p-2 text-ink" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-[min(86vw,340px)] border-border bg-white p-0">
              <div className="flex h-full flex-col overflow-y-auto px-6 pb-6">
                <button
                  onClick={() => setOpen(false)}
                  className="mt-4 w-fit p-1 text-ink"
                  aria-label="Close menu"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <h2 className="mt-4 text-2xl font-bold text-ink">Menu</h2>

                {canSwitchView && (
                  <div className="mt-4 flex gap-1">
                    <button
                      onClick={() => setViewAs("admin")}
                      className={`rounded-full px-3 py-1 text-xs font-medium ${viewAs === "admin" ? "bg-ink text-white" : "bg-paper text-muted-foreground"}`}
                    >
                      {profile.role === "superadmin" ? "Admin" : "Coach"}
                    </button>
                    <button
                      onClick={() => setViewAs("player")}
                      className={`rounded-full px-3 py-1 text-xs font-medium ${viewAs === "player" ? "bg-ink text-white" : "bg-paper text-muted-foreground"}`}
                    >
                      Player
                    </button>
                  </div>
                )}

                <nav className="mt-6 flex-1">
                  <ul className="space-y-1">
                    {playerLinks.map((link) => {
                      const Icon = link.icon
                      const isActive = pathname === link.href
                      return (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            onClick={() => setOpen(false)}
                            className={`flex items-center gap-4 py-2.5 text-[17px] ${isActive ? "font-semibold text-accent-dark" : "font-medium text-ink"}`}
                          >
                            <Icon className="h-5 w-5 text-ink/70" strokeWidth={1.8} />
                            {link.label}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>

                  {showAdmin && (
                    <>
                      <p className="mb-1 mt-6 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                        Admin
                      </p>
                      <ul className="space-y-1">
                        {adminLinks.map((link) => {
                          const Icon = link.icon
                          const isActive = pathname === link.href
                          return (
                            <li key={link.href}>
                              <Link
                                href={link.href}
                                onClick={() => setOpen(false)}
                                className={`flex items-center gap-4 py-2.5 text-[17px] ${isActive ? "font-semibold text-accent-dark" : "font-medium text-ink"}`}
                              >
                                <Icon className="h-5 w-5 text-ink/70" strokeWidth={1.8} />
                                {link.label}
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    </>
                  )}
                </nav>

                <div className="mt-8 space-y-3 border-t border-border pt-5">
                  <a href="/project/football-team" className="block text-sm text-muted-foreground">
                    Back to site
                  </a>
                  <button onClick={handleSignOut} className="block text-sm font-bold text-ink">
                    Logout
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <span className="font-heading text-base font-bold tracking-tight text-ink lg:hidden">
          Baltimore Kings
        </span>

        {/* Right side (ml-auto: the left-side items are display:none on lg) */}
        <div className="ml-auto flex items-center gap-3">
          <NotificationBell userId={profile.id} />
          <div className="hidden items-center gap-2.5 sm:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-xs font-semibold text-paper">
              {initials}
            </div>
            <div className="hidden leading-tight lg:block">
              <p className="text-sm font-medium text-ink">{profile.full_name}</p>
              <p className="text-xs capitalize text-muted-foreground">{profile.role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
