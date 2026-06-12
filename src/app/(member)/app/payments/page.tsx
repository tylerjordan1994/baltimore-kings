"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Payment, FeeItem } from "@/types/database"

// basePath handled by next.config.ts

type AssignmentRow = {
  id: string
  status: string
  fee_items: { title: string | null; amount_cents: number } | null
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [fees, setFees] = useState<FeeItem[]>([])
  const [assignments, setAssignments] = useState<AssignmentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [processingFee, setProcessingFee] = useState<string | null>(null)
  const [sendAmount, setSendAmount] = useState("")
  const [sendNote, setSendNote] = useState("")
  const [sending, setSending] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const [paymentsRes, feesRes, assignRes] = await Promise.all([
        supabase
          .from("payments")
          .select("*")
          .eq("profile_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("fee_items")
          .select("*")
          .eq("profile_id", user.id)
          .eq("is_paid", false)
          .order("due_date", { ascending: true }),
        supabase
          .from("fee_assignments")
          .select("id, status, fee_items(title, amount_cents)")
          .eq("profile_id", user.id)
          .order("created_at", { ascending: false }),
      ])

      setPayments(paymentsRes.data ?? [])
      setFees(feesRes.data ?? [])
      setAssignments((assignRes.data ?? []) as unknown as AssignmentRow[])
      setLoading(false)
    }
    load()
  }, [])

  async function handleSend() {
    setSending(true)
    const res = await fetch(`/project/football-team/api/payments/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount_cents: Math.round(parseFloat(sendAmount || "0") * 100), note: sendNote }),
    })
    const json = await res.json()
    if (json.url) window.location.href = json.url
    else { alert(json.error ?? "Could not start payment."); setSending(false) }
  }

  async function handlePayAssignment(id: string) {
    setProcessingFee(id)
    const res = await fetch(`/project/football-team/api/fees/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignment_id: id }),
    })
    const json = await res.json()
    if (json.url) window.location.href = json.url
    else { alert(json.error ?? "Could not start payment."); setProcessingFee(null) }
  }

  async function handlePayNow(feeId: string) {
    setProcessingFee(feeId)

    const res = await fetch(`/api/stripe/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fee_item_id: feeId }),
    })

    const json = await res.json()

    if (json.url) {
      window.location.href = json.url
    } else {
      alert(json.error ?? "Failed to create checkout session.")
      setProcessingFee(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading payments...</p>
      </div>
    )
  }

  const samplePayments = [
    { id: "sample-1", date: "Mar 3, 2026", description: "Spring Dues", amount: "$150.00", status: "completed" },
    { id: "sample-2", date: "Feb 12, 2026", description: "Tournament Fee", amount: "$40.00", status: "completed" },
    { id: "sample-3", date: "Jan 8, 2026", description: "Uniform Kit", amount: "$65.00", status: "completed" },
  ]

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <h1 className="text-2xl font-bold text-ink">Payments &amp; Fees</h1>

      {/* Send a payment to the club */}
      <div className="rounded-xl border border-border bg-white shadow-sm p-6">
        <h2 className="mb-1 text-lg font-semibold text-ink">Send a payment</h2>
        <p className="mb-4 text-sm text-muted-foreground">Pay a practice fee or send money to the club. You&apos;ll be taken to a secure Stripe checkout.</p>
        <div className="flex flex-wrap items-end gap-3">
          <div className="grid gap-1">
            <label className="text-xs text-muted-foreground">Amount (USD)</label>
            <input type="number" min="1" step="0.01" value={sendAmount} onChange={(e) => setSendAmount(e.target.value)}
              placeholder="25.00" className="w-32 rounded-lg border border-border bg-white px-3 py-2 text-sm text-ink placeholder:text-muted-foreground" />
          </div>
          <div className="grid flex-1 gap-1">
            <label className="text-xs text-muted-foreground">What for? (optional)</label>
            <input value={sendNote} onChange={(e) => setSendNote(e.target.value)} placeholder="Practice fee"
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-ink placeholder:text-muted-foreground" />
          </div>
          <button onClick={handleSend} disabled={sending || !sendAmount}
            className="rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-paper transition-colors hover:bg-brand-light disabled:opacity-50">
            {sending ? "Redirecting…" : "Pay with Stripe"}
          </button>
        </div>
      </div>

      {/* Coach-assigned fees (outstanding) */}
      {assignments.filter((a) => a.status === "outstanding").length > 0 && (
        <div className="rounded-xl border border-amber-300 bg-white shadow-sm p-6">
          <h2 className="mb-1 text-lg font-semibold text-accent-dark">Fees assigned to you</h2>
          <p className="mb-4 text-sm text-muted-foreground">Fees your coach assigned (e.g. tournament entry, dues).</p>
          <div className="space-y-3">
            {assignments.filter((a) => a.status === "outstanding").map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-lg bg-paper px-4 py-3">
                <p className="text-sm font-medium text-ink">{a.fee_items?.title ?? "Fee"}</p>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-ink">${((a.fee_items?.amount_cents ?? 0) / 100).toFixed(2)}</span>
                  <button onClick={() => handlePayAssignment(a.id)} disabled={processingFee === a.id}
                    className="rounded-md bg-blue-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                    {processingFee === a.id ? "Processing…" : "Pay Now"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Outstanding Fees */}
      {fees.length > 0 && (
        <div className="rounded-xl border border-amber-300 bg-white shadow-sm p-6">
          <h2 className="mb-4 text-lg font-semibold text-accent-dark">
            Outstanding Fees
          </h2>
          <div className="space-y-3">
            {fees.map((fee) => (
              <div
                key={fee.id}
                className="flex items-center justify-between rounded-lg bg-paper px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-ink">
                    {fee.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {fee.purpose} &middot;{" "}
                    {fee.due_date
                      ? `Due ${new Date(fee.due_date).toLocaleDateString()}`
                      : "No due date"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-ink">
                    ${(fee.amount_cents / 100).toFixed(2)}
                  </span>
                  <button
                    onClick={() => handlePayNow(fee.id)}
                    disabled={processingFee === fee.id}
                    className="rounded-md bg-blue-600 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                  >
                    {processingFee === fee.id ? "Processing..." : "Pay Now"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="rounded-xl border border-border bg-white shadow-sm p-6">
        <h2 className="mb-4 text-lg font-semibold text-ink">
          Payment History
        </h2>

        {payments.length === 0 ? (
          <div>
            <p className="mb-3 inline-block rounded-md border border-amber-300 bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
              Sample data — your real payments will appear here
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="pb-3 pr-4">Date</th>
                    <th className="pb-3 pr-4">Description</th>
                    <th className="pb-3 pr-4">Amount</th>
                    <th className="pb-3 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {samplePayments.map((p) => (
                    <tr key={p.id} className="italic text-muted-foreground">
                      <td className="py-3 pr-4">{p.date}</td>
                      <td className="py-3 pr-4">{p.description}</td>
                      <td className="py-3 pr-4">{p.amount}</td>
                      <td className="py-3 pr-4">
                        <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium not-italic text-green-700">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 pr-4">Description</th>
                  <th className="pb-3 pr-4">Amount</th>
                  <th className="pb-3 pr-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 pr-4 text-ink/80">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 pr-4 text-ink/80">
                      {p.description ?? p.purpose}
                    </td>
                    <td className="py-3 pr-4 text-ink">
                      ${(p.amount_cents / 100).toFixed(2)}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          p.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : p.status === "failed"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
