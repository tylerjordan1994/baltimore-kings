"use client"

import { DbSiteHeader } from "@/components/db-site-header"
import type { NavNode } from "@/lib/nav"

const BASE = "/project/football-team"

/* Hardcoded fallback nav, rendered through the same mega-menu header as the
   CMS-driven nav. Hrefs include the basePath because DbSiteHeader uses raw
   anchors (nav_items hrefs arrive pre-prefixed). */
const fallbackNav: NavNode[] = [
  {
    id: "teams",
    label: "Teams",
    href: null,
    isCta: false,
    featureCard: {
      title: "Three squads, one crown",
      blurb: "Futsal, arena soccer, and a pathway to MASL2 — find the squad that fits your game.",
      href: `${BASE}/teams/futsal-kings-1`,
      imageUrl: `${BASE}/photos/futsal-kings-combined.jpg`,
    },
    children: [
      { label: "Futsal Kings 1", href: `${BASE}/teams/futsal-kings-1`, description: "Premier futsal in the Mid-Atlantic." },
      { label: "Futsal Kings 2", href: `${BASE}/teams/futsal-kings-2`, description: "Development squad, next generation." },
      { label: "MASL3 Arena Soccer", href: `${BASE}/teams/masl3`, description: "Indoor arena soccer, pro level." },
      { label: "Pathway to MASL2", href: `${BASE}/teams/pathway`, description: "Our roadmap to Division 2." },
    ],
  },
  { id: "roster", label: "Roster", href: `${BASE}/roster`, isCta: false, featureCard: null, children: [] },
  {
    id: "club",
    label: "Club",
    href: null,
    isCta: false,
    featureCard: {
      title: "Built different. Built in Baltimore.",
      blurb: "Who we are, how we develop players, and what it takes to wear the crown.",
      href: `${BASE}/club`,
      imageUrl: `${BASE}/photos/futsal-kings-1.jpg`,
    },
    children: [
      { label: "About", href: `${BASE}/club`, description: "The club, the mission, the crown." },
      { label: "Why Kings", href: `${BASE}/join/why-kings`, description: "What makes us different." },
      { label: "Coaches", href: `${BASE}/join/coaches`, description: "Meet the coaching staff." },
      { label: "Development", href: `${BASE}/join/development`, description: "How we grow players." },
      { label: "Expectations", href: `${BASE}/club/expectations`, description: "Standards we hold." },
      { label: "Costs", href: `${BASE}/join/costs`, description: "Fees, dues, and what's included." },
      { label: "Locations", href: `${BASE}/join/facilities`, description: "Where we train and play." },
      { label: "Trial", href: `${BASE}/join/apply`, description: "Apply to join the club." },
      { label: "Alumni", href: `${BASE}/join/alumni`, description: "Where Kings go next." },
      { label: "Achievements", href: `${BASE}/club/achievements`, description: "Trophies and milestones." },
    ],
  },
  { id: "tickets", label: "Tickets", href: `${BASE}/tickets`, isCta: false, featureCard: null, children: [] },
  { id: "merch", label: "Merch", href: "https://baltimorekings.printify.me/", isCta: false, featureCard: null, children: [] },
  // The header renders a dedicated tonal "Log in" button; the primary CTA here is Apply.
  { id: "apply", label: "Apply", href: `${BASE}/join/apply`, isCta: true, featureCard: null, children: [] },
]

export function SiteHeader({ logoUrl }: { logoUrl?: string | null } = {}) {
  return <DbSiteHeader nav={fallbackNav} logoUrl={logoUrl} />
}
