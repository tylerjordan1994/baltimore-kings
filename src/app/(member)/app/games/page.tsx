import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

// basePath handled by next.config.ts

export default async function GamesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect(`/login`)

  const { data: participations } = await supabase
    .from("game_participations")
    .select("*, games(*, teams(name))")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-white">Game History</h1>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        {!participations || participations.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No game participations recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-800 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 pr-4">Opponent</th>
                  <th className="pb-3 pr-4">Team</th>
                  <th className="pb-3 pr-4">Result</th>
                  <th className="pb-3 pr-4">Minutes</th>
                  <th className="pb-3 pr-4">Goals</th>
                  <th className="pb-3 pr-4">Assists</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {participations.map((gp: any) => (
                  <tr key={gp.id}>
                    <td className="py-3 pr-4 text-zinc-300">
                      {new Date(gp.games.starts_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 pr-4 text-white">
                      {gp.games.opponent}
                    </td>
                    <td className="py-3 pr-4 text-zinc-400">
                      {gp.games.teams?.name}
                    </td>
                    <td className="py-3 pr-4">
                      {gp.games.result ? (
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                            gp.games.result === "W"
                              ? "bg-green-500/20 text-green-400"
                              : gp.games.result === "L"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {gp.games.result}{" "}
                          {gp.games.score_for !== null &&
                            `${gp.games.score_for}-${gp.games.score_against}`}
                        </span>
                      ) : (
                        <span className="text-zinc-500">-</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-zinc-300">{gp.minutes}</td>
                    <td className="py-3 pr-4 text-zinc-300">{gp.goals}</td>
                    <td className="py-3 pr-4 text-zinc-300">{gp.assists}</td>
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
