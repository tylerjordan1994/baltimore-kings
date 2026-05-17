import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/require-role"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    await requireRole("superadmin")
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("brand_assets")
      .select("*")
      .limit(1)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message ?? "Unauthorized" },
      { status: 401 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { profile } = await requireRole("superadmin")
    const supabase = await createClient()

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const field = formData.get("field") as string | null

    if (!file || !field) {
      return NextResponse.json(
        { error: "Missing file or field" },
        { status: 400 }
      )
    }

    const validFields = [
      "logo_full_url",
      "logo_mark_url",
      "logo_white_url",
      "logo_mono_url",
      "og_image_url",
    ]

    if (!validFields.includes(field)) {
      return NextResponse.json({ error: "Invalid field" }, { status: 400 })
    }

    // Map field to storage path
    const fieldToPath: Record<string, string> = {
      logo_full_url: "kings-logo-full",
      logo_mark_url: "kings-logo-mark",
      logo_white_url: "kings-logo-white",
      logo_mono_url: "kings-logo-mono",
      og_image_url: "og-default-image",
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "png"
    const storagePath = `${fieldToPath[field]}.${ext}`

    // Upload to brand bucket
    const arrayBuffer = await file.arrayBuffer()
    const { error: uploadError } = await supabase.storage
      .from("brand")
      .upload(storagePath, arrayBuffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 }
      )
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("brand").getPublicUrl(storagePath)

    // Update brand_assets row
    const { data: existing } = await supabase
      .from("brand_assets")
      .select("id")
      .limit(1)
      .single()

    if (existing) {
      const { error: updateError } = await supabase
        .from("brand_assets")
        .update({ [field]: publicUrl, updated_at: new Date().toISOString(), updated_by: profile.id })
        .eq("id", existing.id)

      if (updateError) {
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        )
      }
    } else {
      const { error: insertError } = await supabase
        .from("brand_assets")
        .insert({ [field]: publicUrl, updated_by: profile.id })

      if (insertError) {
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ url: publicUrl })
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message ?? "Unauthorized" },
      { status: 401 }
    )
  }
}
