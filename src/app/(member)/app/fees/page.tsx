import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PayButton } from "./pay-button"

type Assignment = {
  id: string
  status: string
  fee_items: { title: string; amount_cents: number } | null
}

const money = (c: number) => `$${(c / 100).toFixed(2)}`

export default async function MyFees() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data } = await supabase
    .from("fee_assignments")
    .select("id, status, fee_items(title, amount_cents)")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false })
  const rows = (data ?? []) as unknown as Assignment[]

  const outstanding = rows.filter((r) => r.status === "outstanding")
  const settled = rows.filter((r) => r.status !== "outstanding")

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-1 font-heading text-3xl text-ink">My Fees</h1>
      <p className="mb-6 text-sm text-muted-foreground">Pay outstanding club fees securely via Stripe.</p>

      <h2 className="mb-2 font-heading text-lg text-ink">Outstanding</h2>
      {outstanding.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">You&apos;re all paid up. 🎉</p>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
          {outstanding.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="font-medium text-ink">{r.fee_items?.title ?? "Fee"}</p>
                <p className="text-sm text-muted-foreground">{r.fee_items ? money(r.fee_items.amount_cents) : ""}</p>
              </div>
              <PayButton assignmentId={r.id} />
            </li>
          ))}
        </ul>
      )}

      {settled.length > 0 ? (
        <>
          <h2 className="mb-2 mt-8 font-heading text-lg text-ink">History</h2>
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
            {settled.map((r) => (
              <li key={r.id} className="flex items-center justify-between p-4 text-sm">
                <span className="text-ink">{r.fee_items?.title ?? "Fee"}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs ${r.status === "paid" ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-700"}`}>{r.status}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  )
}
