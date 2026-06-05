import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { EvalRadar, type Criterion } from "@/components/eval-radar"

type Evaluation = {
  id: string
  season: string | null
  summary_note: string | null
  scores: Record<string, unknown>
  created_at: string
  eval_templates: { name: string; criteria: Criterion[] } | null
}

export default async function MyEvaluations() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // RLS guarantees: a player only sees their OWN evals that are visibility='shared'.
  const { data } = await supabase
    .from("player_evaluations")
    .select("id, season, summary_note, scores, created_at, eval_templates(name, criteria)")
    .eq("profile_id", user.id)
    .eq("visibility", "shared")
    .order("created_at", { ascending: false })

  const evals = (data ?? []) as unknown as Evaluation[]

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-1 font-heading text-3xl text-ink">My Evaluations</h1>
      <p className="mb-6 text-sm text-muted-foreground">Feedback your coaches have shared with you.</p>
      {evals.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
          No shared evaluations yet.
        </div>
      ) : (
        <div className="grid gap-5">
          {evals.map((e) => (
            <div key={e.id} className="rounded-xl border border-border bg-card p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-heading text-lg text-ink">{e.eval_templates?.name ?? "Evaluation"}</h2>
                <span className="text-xs text-muted-foreground">{e.season ?? new Date(e.created_at).toLocaleDateString()}</span>
              </div>
              {e.eval_templates?.criteria ? <EvalRadar criteria={e.eval_templates.criteria} scores={e.scores} /> : null}
              {e.summary_note ? <p className="mt-3 whitespace-pre-wrap text-sm text-ink">{e.summary_note}</p> : null}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
