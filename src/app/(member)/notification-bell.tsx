"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, CreditCard, FileText, ClipboardCheck, GraduationCap } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { fetchMemberNotifications, type MemberNotification } from "@/lib/member-notifications"

const KIND_ICON = {
  payment: CreditCard,
  contract: FileText,
  requirement: ClipboardCheck,
  training: GraduationCap,
} as const

const KIND_COLOR = {
  payment: "bg-red-100 text-red-600",
  contract: "bg-blue-100 text-blue-600",
  requirement: "bg-amber-100 text-amber-700",
  training: "bg-emerald-100 text-emerald-700",
} as const

/**
 * Notification bell with a count badge. Notifications are derived from
 * outstanding items, so they disappear on their own once the item is done —
 * the list refetches on every route change.
 */
export function NotificationBell({ userId }: { userId: string }) {
  const [items, setItems] = useState<MemberNotification[]>([])
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const ref = useRef<HTMLDivElement>(null)

  const refresh = useCallback(async () => {
    const supabase = createClient()
    try {
      setItems(await fetchMemberNotifications(supabase, userId))
    } catch {
      // Non-critical UI; ignore fetch failures.
    }
  }, [userId])

  useEffect(() => {
    refresh()
  }, [refresh, pathname])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-full border border-border bg-white p-2 text-ink transition-colors hover:bg-paper"
        aria-label={`Notifications (${items.length})`}
      >
        <Bell className="h-4.5 w-4.5" strokeWidth={1.8} />
        {items.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {items.length > 9 ? "9+" : items.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(92vw,360px)] overflow-hidden rounded-2xl border border-border bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-sm font-semibold text-ink">Notifications</span>
            {items.length > 0 && (
              <span className="rounded-full bg-paper px-2 py-0.5 text-xs text-muted-foreground">
                {items.length} to address
              </span>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                You&apos;re all caught up. 👑
              </p>
            ) : (
              items.map((n) => {
                const Icon = KIND_ICON[n.kind]
                return (
                  <Link
                    key={n.id}
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 border-b border-border/60 px-4 py-3 transition-colors last:border-0 hover:bg-paper"
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${KIND_COLOR[n.kind]}`}>
                      <Icon className="h-4 w-4" strokeWidth={1.8} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-ink">{n.title}</span>
                      {n.detail ? (
                        <span className="block truncate text-xs text-muted-foreground">{n.detail}</span>
                      ) : null}
                    </span>
                  </Link>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
