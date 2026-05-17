import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createServiceClient } from "@/lib/supabase/server"

const applicationSchema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  date_of_birth: z.string().min(1),
  years_experience: z.coerce.number().min(0).max(50),
  prior_teams: z.string().optional().default(""),
  position_preference: z.string().min(1),
  notes: z.string().optional().default(""),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = applicationSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const supabase = await createServiceClient()

    const { error } = await supabase.from("applications").insert({
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      date_of_birth: parsed.data.date_of_birth,
      years_experience: parsed.data.years_experience,
      prior_teams: parsed.data.prior_teams,
      position_preference: parsed.data.position_preference,
      notes: parsed.data.notes,
      status: "pending",
    })

    if (error) {
      console.error("Application insert error:", error)
      return NextResponse.json(
        { error: "Failed to save application" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    )
  }
}
