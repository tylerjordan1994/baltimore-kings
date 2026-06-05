import { redirect } from "next/navigation"
import { requireRole } from "@/lib/require-role"
import { QuickAddForm } from "./quick-add-form"

export default async function QuickAddPage() {
  try {
    await requireRole("coach")
  } catch {
    redirect("/app")
  }
  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-1 font-heading text-3xl text-ink">Quick-add Players</h1>
      <p className="mb-6 text-sm text-muted-foreground">Paste a roster block to create players and assign them to teams in one go.</p>
      <QuickAddForm />
    </div>
  )
}
