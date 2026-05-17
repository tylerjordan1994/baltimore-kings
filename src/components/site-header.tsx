"use client"

import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { Menu, ChevronDown, X, ArrowRight } from "lucide-react"
import { HeaderLogo } from "@/components/header-logo"

// basePath handled by next.config.ts

const teamsDropdown = [
  { href: "/teams/futsal-kings-1", label: "Futsal Kings 1", description: "Premier futsal competition in the Mid-Atlantic" },
  { href: "/teams/futsal-kings-2", label: "Futsal Kings 2", description: "Development squad building the next generation" },
  { href: "/teams/masl3", label: "MASL3 Arena Soccer", description: "Indoor arena soccer at the professional level" },
  { href: "/teams/pathway", label: "Pathway to MASL2", description: "Our roadmap to Division 2 promotion" },
]

const clubDropdown = [
  { href: "/club/expectations", label: "Team Expectations", description: "Standards and culture" },
  { href: "/schedule", label: "Schedule", description: "Games, practices, and events" },
  { href: "/club/achievements", label: "Achievements", description: "Trophies, records, and milestones" },
  { href: "/media", label: "Media", description: "Photos, videos, and press" },
]

const joinDropdown = {
  pathway: [
    { href: "/join/why-kings", label: "Why the Kings" },
    { href: "/join/pathway", label: "The Pathway" },
    { href: "/join/development", label: "Development" },
    { href: "/join/coaches", label: "Coaches" },
  ],
  logistics: [
    { href: "/join/facilities", label: "Facilities" },
    { href: "/schedule", label: "Schedule" },
    { href: "/join/costs", label: "Costs" },
  ],
  outcomes: [
    { href: "/join/alumni", label: "Alumni" },
    { href: "/achievements", label: "Achievements" },
    { href: "/join/stories", label: "Stories" },
  ],
}

type DropdownId = "teams" | "club" | "join" | null

export function SiteHeader({ logoUrl }: { logoUrl?: string | null } = {}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<DropdownId>(null)
  const headerRef = useRef<HTMLElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleDropdownEnter(id: DropdownId) {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setActiveDropdown(id)
  }

  function handleDropdownLeave() {
    timeoutRef.current = setTimeout(() => setActiveDropdown(null), 150)
  }

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-xl border-b border-border"
    >
      <div className="mx-auto flex h-16 md:h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <HeaderLogo logoUrl={logoUrl ?? null} />
          <span className="hidden font-heading text-lg font-bold tracking-tight sm:inline-block text-ink">
            Baltimore Kings
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {/* Teams dropdown */}
          <div
            className="relative"
            onMouseEnter={() => handleDropdownEnter("teams")}
            onMouseLeave={handleDropdownLeave}
          >
            <button
              onClick={() => setActiveDropdown(activeDropdown === "teams" ? null : "teams")}
              className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-ink hover:bg-paper"
            >
              Teams
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${activeDropdown === "teams" ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* Roster */}
          <Link
            href="/roster"
            className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-ink hover:bg-paper"
          >
            Roster
          </Link>

          {/* Club dropdown */}
          <div
            className="relative"
            onMouseEnter={() => handleDropdownEnter("club")}
            onMouseLeave={handleDropdownLeave}
          >
            <button
              onClick={() => setActiveDropdown(activeDropdown === "club" ? null : "club")}
              className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-ink hover:bg-paper"
            >
              Club
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${activeDropdown === "club" ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* Learn */}
          <Link
            href="/learn"
            className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-ink hover:bg-paper"
          >
            Learn
          </Link>

          {/* Merch */}
          <Link
            href="/merch"
            className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-ink hover:bg-paper"
          >
            Merch
          </Link>
        </nav>

        {/* Right side: Sign In + Join CTA */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/sign-in"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-ink"
          >
            Sign In
          </Link>
          <div
            className="relative"
            onMouseEnter={() => handleDropdownEnter("join")}
            onMouseLeave={handleDropdownLeave}
          >
            <button
              onClick={() => setActiveDropdown(activeDropdown === "join" ? null : "join")}
              className="inline-flex items-center gap-1 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-brand/90"
            >
              Join
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${activeDropdown === "join" ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-paper hover:text-ink"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span className="sr-only">Toggle menu</span>
        </button>
      </div>

      {/* Mega Menu Dropdown Panels */}
      <div
        className={`absolute left-0 right-0 top-full overflow-hidden transition-all duration-200 ease-out ${
          activeDropdown ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
        onMouseEnter={() => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }}
        onMouseLeave={handleDropdownLeave}
      >
        <div className="border-b border-border bg-white/95 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {activeDropdown === "teams" && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {teamsDropdown.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setActiveDropdown(null)}
                    className="group rounded-xl border border-border bg-white p-4 transition-colors hover:border-accent/30 hover:bg-paper"
                  >
                    <div className="text-sm font-semibold text-ink group-hover:text-accent transition-colors">
                      {item.label}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {item.description}
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {activeDropdown === "club" && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {clubDropdown.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setActiveDropdown(null)}
                    className="group rounded-xl border border-border bg-white p-4 transition-colors hover:border-accent/30 hover:bg-paper"
                  >
                    <div className="text-sm font-semibold text-ink group-hover:text-accent transition-colors">
                      {item.label}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {item.description}
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {activeDropdown === "join" && (
              <div className="grid gap-6 lg:grid-cols-4">
                {/* Column 1: Pathway */}
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-brand">Pathway</p>
                  <div className="space-y-1">
                    {joinDropdown.pathway.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setActiveDropdown(null)}
                        className="block rounded-lg px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-paper hover:text-accent"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
                {/* Column 2: Logistics */}
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-brand">Logistics</p>
                  <div className="space-y-1">
                    {joinDropdown.logistics.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setActiveDropdown(null)}
                        className="block rounded-lg px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-paper hover:text-accent"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
                {/* Column 3: Outcomes */}
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-brand">Outcomes</p>
                  <div className="space-y-1">
                    {joinDropdown.outcomes.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setActiveDropdown(null)}
                        className="block rounded-lg px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-paper hover:text-accent"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
                {/* Feature card */}
                <div className="rounded-xl border border-accent/20 bg-accent/5 p-5 flex flex-col justify-between">
                  <div>
                    <p className="text-sm font-semibold text-ink">Start your application</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Fill out the form and a coach will reach out within a week.
                    </p>
                  </div>
                  <Link
                    href="/join/apply"
                    onClick={() => setActiveDropdown(null)}
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-paper transition-colors hover:bg-brand/90"
                  >
                    Apply Now
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-white/95 backdrop-blur-xl">
          <nav className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
            <div className="space-y-1">
              <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-brand">Teams</p>
              {teamsDropdown.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-paper"
                >
                  {item.label}
                </Link>
              ))}

              <div className="my-3 border-t border-border" />

              <Link
                href="/roster"
                onClick={() => setMobileOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-paper"
              >
                Roster
              </Link>

              <div className="my-3 border-t border-border" />

              <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-brand">Club</p>
              {clubDropdown.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-paper"
                >
                  {item.label}
                </Link>
              ))}

              <div className="my-3 border-t border-border" />

              <Link
                href="/learn"
                onClick={() => setMobileOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-paper"
              >
                Learn
              </Link>
              <Link
                href="/merch"
                onClick={() => setMobileOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-paper"
              >
                Merch
              </Link>

              <div className="my-3 border-t border-border" />

              <Link
                href="/sign-in"
                onClick={() => setMobileOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-paper"
              >
                Sign In
              </Link>
              <Link
                href="/join"
                onClick={() => setMobileOpen(false)}
                className="mt-3 block rounded-full bg-brand px-4 py-2.5 text-center text-sm font-semibold text-paper transition-colors hover:bg-brand/90"
              >
                Join
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
