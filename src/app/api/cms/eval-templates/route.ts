import { NextResponse } from "next/server"
import { z } from "zod"
import { requireRole } from "@/lib/require-role"
import { createClient } from "@/lib/supabase/server"

const criterion = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(["rating_1_5", "text", "number"]),
  group: z.string().optional(),
  weight: z.number().optional(),
})
const schema = z.object({
  name: z.string().min(1).max(160),
  description: z.string().nullable().optional(),
  criteria: z.array(criterion).min(1),
})

export async function POST(request: Request) {
  try {
    const { profile } = await requireRole("coach")
    const body = schema.parse(await request.json())
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("eval_templates")
      .insert({ ...body, created_by: profile.id })
      .select("id")
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data)
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error"
    const code = msg === "Unauthorized" ? 401 : msg === "Insufficient permissions" ? 403 : 400
    return NextResponse.json({ error: msg }, { status: code })
  }
}
