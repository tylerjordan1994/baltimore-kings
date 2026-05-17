"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Payment, FeeItem } from "@/types/database"

const basePath = "/project/football-team"

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [fees, setFees] = useState<FeeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [processingFee, setProcessingFee] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const [paymentsRes, feesRes] = await Promise.all([
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
      ])

      setPayments(paymentsRes.data ?? [])
      setFees(feesRes.data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function handlePayNow(feeId: string) {
    setProcessingFee(feeId)

    const res = await fetch(`${basePath}/api/stripe/checkout`, {
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
        <p className="text-zinc-400">Loading payments...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <h1 className="text-2xl font-bold text-white">Payments</h1>

      {/* Outstanding Fees */}
      {fees.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-zinc-900 p-6">
          <h2 className="mb-4 text-lg font-semibold text-amber-300">
            Outstanding Fees
          </h2>
          <div className="space-y-3">
            {fees.map((fee) => (
              <div
                key={fee.id}
                className="flex items-center justify-between rounded-lg bg-zinc-800/50 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-white">
                    {fee.description}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {fee.purpose} &middot;{" "}
                    {fee.due_date
                      ? `Due ${new Date(fee.due_date).toLocaleDateString()}`
                      : "No due date"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-white">
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
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">
          Payment History
        </h2>

        {payments.length === 0 ? (
          <p className="text-sm text-zinc-500">No payments found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-800 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 pr-4">Description</th>
                  <th className="pb-3 pr-4">Amount</th>
                  <th className="pb-3 pr-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 pr-4 text-zinc-300">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 pr-4 text-zinc-300">
                      {p.description ?? p.purpose}
                    </td>
                    <td className="py-3 pr-4 text-white">
                      ${(p.amount_cents / 100).toFixed(2)}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          p.status === "completed"
                            ? "bg-green-500/20 text-green-400"
                            : p.status === "failed"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-yellow-500/20 text-yellow-400"
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
