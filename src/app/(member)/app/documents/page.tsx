"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Document, DocumentKind } from "@/types/database"

// basePath handled by next.config.ts

const documentKinds: DocumentKind[] = ["waiver", "id", "medical", "other"]

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [kind, setKind] = useState<DocumentKind>("waiver")
  const [message, setMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)

  useEffect(() => {
    loadDocuments()
  }, [])

  async function loadDocuments() {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from("documents")
      .select("*")
      .eq("profile_id", user.id)
      .order("uploaded_at", { ascending: false })

    setDocuments(data ?? [])
    setLoading(false)
  }

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage(null)
    setUploading(true)

    const form = e.currentTarget
    const fileInput = form.elements.namedItem("file") as HTMLInputElement
    const file = fileInput?.files?.[0]

    if (!file) {
      setMessage({ type: "error", text: "Please select a file." })
      setUploading(false)
      return
    }

    const formData = new FormData()
    formData.append("file", file)
    formData.append("kind", kind)

    const res = await fetch(`/api/documents/upload`, {
      method: "POST",
      body: formData,
    })

    const json = await res.json()

    if (!res.ok) {
      setMessage({ type: "error", text: json.error ?? "Upload failed." })
    } else {
      setMessage({ type: "success", text: "Document uploaded successfully." })
      form.reset()
      loadDocuments()
    }
    setUploading(false)
  }

  async function getDownloadUrl(storagePath: string) {
    const supabase = createClient()
    const { data } = await supabase.storage
      .from("documents")
      .createSignedUrl(storagePath, 60)

    if (data?.signedUrl) {
      window.open(data.signedUrl, "_blank")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-zinc-400">Loading documents...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <h1 className="text-2xl font-bold text-white">Documents</h1>

      {/* Upload Form */}
      <form
        onSubmit={handleUpload}
        className="rounded-xl border border-zinc-800 bg-zinc-900 p-6"
      >
        <h2 className="mb-4 text-lg font-semibold text-white">
          Upload Document
        </h2>

        {message && (
          <div
            className={`mb-4 rounded-lg p-3 text-sm ${
              message.type === "success"
                ? "bg-green-500/10 text-green-400"
                : "bg-red-500/10 text-red-400"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">
              Type
            </label>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as DocumentKind)}
              className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
            >
              {documentKinds.map((k) => (
                <option key={k} value={k}>
                  {k.charAt(0).toUpperCase() + k.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">
              File (max 10MB)
            </label>
            <input
              type="file"
              name="file"
              className="w-full text-sm text-zinc-400 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-700 file:px-3 file:py-2 file:text-sm file:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </form>

      {/* Document List */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">
          Your Documents
        </h2>

        {documents.length === 0 ? (
          <p className="text-sm text-zinc-500">No documents uploaded yet.</p>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-lg bg-zinc-800/50 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-white">
                    {doc.filename}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {doc.kind} &middot;{" "}
                    {new Date(doc.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => getDownloadUrl(doc.storage_path)}
                  className="rounded-md bg-zinc-700 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-600"
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
