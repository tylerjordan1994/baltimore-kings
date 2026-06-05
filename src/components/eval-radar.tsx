"use client"

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts"

export type Criterion = { key: string; label: string; type: string; group?: string }

/** Radar of the rating_1_5 criteria from a player evaluation. */
export function EvalRadar({ criteria, scores }: { criteria: Criterion[]; scores: Record<string, unknown> }) {
  const data = criteria
    .filter((c) => c.type === "rating_1_5")
    .map((c) => ({ subject: c.label, value: Number(scores[c.key]) || 0 }))

  if (data.length < 3) return null

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="#E2E0DA" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#6B6B6B" }} />
          <PolarRadiusAxis domain={[0, 5]} tick={{ fontSize: 10, fill: "#9A9A9A" }} />
          <Radar dataKey="value" stroke="#1B2A4A" fill="#C9A94E" fillOpacity={0.5} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
