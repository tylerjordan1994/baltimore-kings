import {
  Home,
  User,
  Calendar,
  CreditCard,
  Shapes,
  Video,
  GraduationCap,
  Target,
  Trophy,
  FileText,
  ClipboardCheck,
  PanelsTopLeft,
  Braces,
  ListTree,
  Users,
  ContactRound,
  UserPlus,
  Inbox,
  Image,
  FileSignature,
  Search,
  DollarSign,
  Ticket,
  Handshake,
  Megaphone,
  Settings,
  type LucideIcon,
} from "lucide-react"

export type MemberNavLink = { href: string; label: string; icon: LucideIcon }

export const playerLinks: MemberNavLink[] = [
  { href: "/app", label: "Home", icon: Home },
  { href: "/app/profile", label: "Profile", icon: User },
  { href: "/app/schedule", label: "Schedule", icon: Calendar },
  { href: "/app/payments", label: "Payments & Fees", icon: CreditCard },
  { href: "/app/tactics", label: "Play Builder", icon: Shapes },
  { href: "/app/videos", label: "VEO Videos", icon: Video },
  { href: "/app/training", label: "Training & Tutorials", icon: GraduationCap },
  { href: "/app/evaluations", label: "Goals & Evaluations", icon: Target },
  { href: "/app/achievements", label: "Achievements", icon: Trophy },
  { href: "/app/contracts", label: "Contracts", icon: FileText },
  { href: "/app/requirements", label: "Team Expectations", icon: ClipboardCheck },
]

export const adminLinks: MemberNavLink[] = [
  { href: "/app/admin/pages", label: "Pages", icon: PanelsTopLeft },
  { href: "/app/admin/tokens", label: "Content Tokens", icon: Braces },
  { href: "/app/admin/navigation", label: "Navigation", icon: ListTree },
  { href: "/app/admin/roster", label: "Roster Manager", icon: Users },
  { href: "/app/admin/players", label: "All Players", icon: ContactRound },
  { href: "/app/admin/quick-add", label: "Quick-add Players", icon: UserPlus },
  { href: "/app/admin/schedule", label: "Schedule", icon: Calendar },
  { href: "/app/admin/tactics", label: "Play Builder", icon: Shapes },
  { href: "/app/admin/videos", label: "VEO Videos", icon: Video },
  { href: "/app/admin/achievements", label: "Achievements", icon: Trophy },
  { href: "/app/admin/evaluations", label: "Evaluations & Goals", icon: Target },
  { href: "/app/admin/applications", label: "Applications", icon: Inbox },
  { href: "/app/admin/media", label: "Media", icon: Image },
  { href: "/app/admin/training", label: "Training & Tutorials", icon: GraduationCap },
  { href: "/app/admin/requirements", label: "Player Agreements", icon: FileSignature },
  { href: "/app/admin/scouting", label: "Scouting", icon: Search },
  { href: "/app/admin/fees", label: "Fees", icon: DollarSign },
  { href: "/app/admin/tickets", label: "Ticketed Events", icon: Ticket },
  { href: "/app/admin/sponsors", label: "Sponsors", icon: Handshake },
  { href: "/app/admin/social", label: "Social & Brand", icon: Megaphone },
  { href: "/app/admin/settings", label: "Site Settings", icon: Settings },
]

export const allMemberLinks: MemberNavLink[] = [...playerLinks, ...adminLinks]

export function iconFor(href: string): LucideIcon {
  return allMemberLinks.find((l) => l.href === href)?.icon ?? Home
}
