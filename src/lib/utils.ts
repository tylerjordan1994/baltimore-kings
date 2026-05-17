import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Compute age in whole years from an ISO date string (YYYY-MM-DD). */
export function calculateAge(dateOfBirth: string | null | undefined): number | null {
  if (!dateOfBirth) return null
  const dob = new Date(dateOfBirth)
  if (Number.isNaN(dob.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - dob.getFullYear()
  const m = now.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--
  return age >= 0 && age < 130 ? age : null
}

/** Format an ISO date as a readable label, e.g. "March 4, 1998". */
export function formatDate(date: string | null | undefined): string {
  if (!date) return "—"
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  })
}

/** Produce initials (max 2) from a full name. */
export function getInitials(name: string | null | undefined): string {
  if (!name) return "?"
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("")
}

/** Map a team slug to a short display tag. */
const TEAM_TAG_MAP: Record<string, string> = {
  "futsal-kings-1": "K1",
  "futsal-kings-2": "K2",
  "kings-masl3": "MASL3",
  "salisbury-steaks": "Steaks",
}

export function teamTag(slug: string | null | undefined): string {
  if (!slug) return ""
  return TEAM_TAG_MAP[slug] ?? slug
}
