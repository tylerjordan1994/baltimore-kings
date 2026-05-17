import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const kind = formData.get("kind") as string | null

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    if (!kind || !["waiver", "id", "medical", "other"].includes(kind)) {
      return NextResponse.json(
        { error: "Invalid document kind" },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File exceeds 10MB limit" },
        { status: 400 }
      )
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not allowed" },
        { status: 400 }
      )
    }

    const ext = file.name.split(".").pop() ?? "bin"
    const storagePath = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error("Storage upload error:", uploadError)
      return NextResponse.json(
        { error: "Upload failed" },
        { status: 500 }
      )
    }

    const { error: dbError } = await supabase.from("documents").insert({
      profile_id: user.id,
      storage_path: storagePath,
      filename: file.name,
      kind,
    })

    if (dbError) {
      console.error("DB insert error:", dbError)
      return NextResponse.json(
        { error: "Failed to save document record" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, path: storagePath })
  } catch (error: any) {
    console.error("Document upload error:", error)
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    )
  }
}
