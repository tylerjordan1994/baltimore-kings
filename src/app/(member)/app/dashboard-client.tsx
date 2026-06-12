"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Calendar,
  ClipboardCheck,
  CreditCard,
  FileText,
  GraduationCap,
  Inbox,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  UserCheck,
  Eye,
  MousePointerClick,
} from "lucide-react"
import { useViewMode } from "@/lib/stores/view-mode-store"
import type { MemberNotification } from "@/lib/member-notifications"
import { QuickLinksRow } from "./quick-links"

export type QuickLink = { href: string; label: string }

export type PlayerData = {
  notifications: MemberNotification[]
  events: { id: string; title: string; kind: string; starts_at: string; location: string | null }[]
  recentPayments: { id: string; amount_cents: number; status: string; purpose: string | null; created_at: string }[]
}

export type CoachData = {
  newApplications: number
  trialingPlayers: number
  pendingFeesCount: number
  pendingFeesCents: number
  pendingTrainings: number
  clubIssues: number
  failedPayments: number
  overdueFees: number
  views7d: number
  clicks7d: number
  views30d: number
  quickLinks: QuickLink[]
}

function dollars(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
}

function eventDate(iso: string): { day: string; date: string; time: string } {
  const d = new Date(iso)
  return {
    day: d.toLocaleDateString("en-US", { weekday: "short" }),
    date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
  }
}

const KIND_LABEL: Record<string, string> = {
  home_game: "Home Game",
  away_game: "Away Game",
  practice: "Practice",
  tryout: "Tryout",
  meeting: "Meeting",
  other: "Event",
}

function Card({
  title,
  seeAllHref,
  children,
  className = "",
}: {
  title: string
  seeAllHref?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={`rounded-2xl border border-border bg-white p-5 shadow-sm ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        {seeAllHref ? (
          <Link href={seeAllHref} className="text-sm font-medium text-accent-dark hover:underline">
            See All
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  )
}

/* ── Pay the Club — dedicated practice-fee payment ── */

function PayClubButton() {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function pay() {
    setSending(true)
    setError(null)
    const res = await fetch(`/project/football-team/api/payments/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount_cents: Math.round(parseFloat(amount || "0") * 100),
        note: "Practice fees",
      }),
    })
    const json = await res.json()
    if (json.url) {
      window.location.href = json.url
    } else {
      setError(json.error ?? "Could not start payment.")
      setSending(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-paper transition-colors hover:bg-brand-light"
      >
        <DollarSign className="h-4 w-4" />
        Pay the Club — Practice Fees
      </button>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-paper p-3">
      <p className="mb-2 text-xs font-medium text-muted-foreground">Practice fee amount (USD)</p>
      <div className="flex gap-2">
        <input
          type="number"
          min="1"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="25.00"
          className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          onClick={pay}
          disabled={sending || !amount}
          className="shrink-0 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-paper disabled:opacity-50"
        >
          {sending ? "..." : "Pay"}
        </button>
      </div>
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
    </div>
  )
}

/* ── Player dashboard ── */

const NOTIF_META = {
  payment: { icon: CreditCard, color: "bg-red-100 text-red-600" },
  contract: { icon: FileText, color: "bg-blue-100 text-blue-600" },
  requirement: { icon: ClipboardCheck, color: "bg-amber-100 text-amber-700" },
  training: { icon: GraduationCap, color: "bg-emerald-100 text-emerald-700" },
} as const

function NotificationList({ items, empty }: { items: MemberNotification[]; empty: string }) {
  if (items.length === 0) {
    return (
      <p className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
        <CheckCircle2 className="h-4 w-4 text-emerald-600" /> {empty}
      </p>
    )
  }
  return (
    <ul className="space-y-1">
      {items.map((n) => {
        const meta = NOTIF_META[n.kind]
        const Icon = meta.icon
        return (
          <li key={n.id}>
            <Link
              href={n.href}
              className="group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-paper"
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${meta.color}`}>
                <Icon className="h-4 w-4" strokeWidth={1.8} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-ink">{n.title}</span>
                {n.detail ? <span className="block truncate text-xs text-muted-foreground">{n.detail}</span> : null}
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

function PlayerDashboard({ firstName, data }: { firstName: string; data: PlayerData }) {
  const payments = data.notifications.filter((n) => n.kind === "payment")
  const todos = data.notifications.filter((n) => n.kind !== "payment")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink sm:text-3xl">Hello, {firstName}</h1>
        <p className="mt-1 text-muted-foreground">
          {data.notifications.length > 0
            ? `You have ${data.notifications.length} item${data.notifications.length === 1 ? "" : "s"} that need your attention.`
            : "You're all caught up. Nothing needs your attention."}
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Upcoming games */}
        <Card title="Upcoming Games & Events" seeAllHref="/app/schedule" className="lg:col-span-1">
          {data.events.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">No upcoming events on the calendar.</p>
          ) : (
            <ul className="space-y-1">
              {data.events.map((e) => {
                const d = eventDate(e.starts_at)
                return (
                  <li key={e.id}>
                    <Link href="/app/schedule" className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-paper">
                      <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-brand text-paper">
                        <span className="text-[9px] font-semibold uppercase leading-none">{d.day}</span>
                        <span className="mt-0.5 text-xs font-bold leading-none">{d.date.split(" ")[1]}</span>
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-ink">{e.title}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {KIND_LABEL[e.kind] ?? "Event"} · {d.time}
                          {e.location ? ` · ${e.location}` : ""}
                        </span>
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>

        {/* Payments due */}
        <Card title="Payments Due" seeAllHref="/app/payments">
          <NotificationList items={payments} empty="No payments due. You're squared up." />
          <div className="mt-4 border-t border-border pt-4">
            <PayClubButton />
          </div>
        </Card>

        {/* Required trainings & contracts */}
        <Card title="Trainings & Contracts">
          <NotificationList items={todos} empty="No required trainings or documents." />
        </Card>
      </div>

      {/* Needs attention */}
      {data.notifications.length > 0 && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-ink">
            <AlertCircle className="h-4 w-4 text-amber-600" /> Needs your attention
          </h2>
          <ul className="space-y-2">
            {data.notifications.map((n) => (
              <li key={n.id}>
                <Link href={n.href} className="text-sm text-ink hover:underline">
                  <span className="font-medium">{n.title}</span>
                  {n.detail ? <span className="text-muted-foreground"> — {n.detail}</span> : null}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

/* ── Coach dashboard ── */

function MetricCard({
  label,
  value,
  sub,
  href,
  icon: Icon,
  tone = "default",
}: {
  label: string
  value: string
  sub?: string
  href: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  tone?: "default" | "warn" | "danger"
}) {
  const toneClass =
    tone === "danger"
      ? "bg-red-100 text-red-600"
      : tone === "warn"
        ? "bg-amber-100 text-amber-700"
        : "bg-accent/15 text-accent-dark"
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-border bg-white p-5 shadow-sm transition-colors hover:border-accent/50"
    >
      <div className="flex items-start justify-between">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneClass}`}>
          <Icon className="h-5 w-5" strokeWidth={1.8} />
        </span>
        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <p className="mt-4 text-2xl font-bold text-ink">{value}</p>
      <p className="text-sm font-medium text-ink">{label}</p>
      {sub ? <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p> : null}
    </Link>
  )
}

function CoachDashboard({ firstName, data }: { firstName: string; data: CoachData }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink sm:text-3xl">Hello, Coach {firstName}</h1>
        <p className="mt-1 text-muted-foreground">Here&apos;s what&apos;s happening across the club.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          label="New Applications"
          value={String(data.newApplications)}
          sub="Awaiting review"
          href="/app/admin/applications"
          icon={Inbox}
          tone={data.newApplications > 0 ? "warn" : "default"}
        />
        <MetricCard
          label="Trialing Players"
          value={String(data.trialingPlayers)}
          sub="Invited to trial"
          href="/app/admin/applications"
          icon={UserCheck}
        />
        <MetricCard
          label="Pending Club Fees"
          value={dollars(data.pendingFeesCents)}
          sub={`${data.pendingFeesCount} outstanding assignment${data.pendingFeesCount === 1 ? "" : "s"}`}
          href="/app/admin/fees"
          icon={DollarSign}
          tone={data.overdueFees > 0 ? "warn" : "default"}
        />
        <MetricCard
          label="Pending Trainings"
          value={String(data.pendingTrainings)}
          sub="Marked complete, awaiting confirmation"
          href="/app/admin/training"
          icon={GraduationCap}
        />
        <MetricCard
          label="Club Issues"
          value={String(data.clubIssues)}
          sub={`${data.failedPayments} failed payment${data.failedPayments === 1 ? "" : "s"} · ${data.overdueFees} overdue fee${data.overdueFees === 1 ? "" : "s"}`}
          href="/app/admin/fees"
          icon={AlertCircle}
          tone={data.clubIssues > 0 ? "danger" : "default"}
        />
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent-dark">
              <Eye className="h-5 w-5" strokeWidth={1.8} />
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold text-ink">{data.views7d.toLocaleString()}</p>
          <p className="text-sm font-medium text-ink">Page Views (7 days)</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <MousePointerClick className="h-3 w-3" /> {data.clicks7d.toLocaleString()} clicks ·{" "}
            {data.views30d.toLocaleString()} views / 30d
          </p>
        </div>
      </div>

      {/* Quick links — drag to reorder, saved per account */}
      <QuickLinksRow initial={data.quickLinks} />

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Calendar className="h-3.5 w-3.5" />
        Analytics are first-party page views and clicks recorded on the public site.
      </p>
    </div>
  )
}

/* ── Switcher ── */

export function DashboardClient({
  firstName,
  isAdmin,
  canSwitchView,
  playerData,
  coachData,
}: {
  firstName: string
  isAdmin: boolean
  canSwitchView: boolean
  playerData: PlayerData
  coachData: CoachData | null
}) {
  const { viewAs } = useViewMode()
  const showCoach = isAdmin && coachData && (!canSwitchView || viewAs === "admin")

  return showCoach ? (
    <CoachDashboard firstName={firstName} data={coachData} />
  ) : (
    <PlayerDashboard firstName={firstName} data={playerData} />
  )
}
