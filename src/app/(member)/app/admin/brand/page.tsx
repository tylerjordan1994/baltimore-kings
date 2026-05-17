"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import type { BrandAssets } from "@/types/database"

interface AssetField {
  field: string
  label: string
  storageName: string
  required: boolean
}

const assetFields: AssetField[] = [
  { field: "logo_full_url", label: "Full Color Logo", storageName: "kings-logo-full", required: true },
  { field: "logo_mark_url", label: "Crest Mark", storageName: "kings-logo-mark", required: true },
  { field: "logo_white_url", label: "White/Monochrome", storageName: "kings-logo-white", required: true },
  { field: "logo_mono_url", label: "Black/Monochrome", storageName: "kings-logo-mono", required: false },
  { field: "og_image_url", label: "Social Share Image (1200x630)", storageName: "og-default-image", required: false },
]

export default function BrandAssetsPage() {
  const [brand, setBrand] = useState<BrandAssets | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [warnings, setWarnings] = useState<Record<string, string>>({})

  useEffect(() => {
    loadBrandAssets()
  }, [])

  async function loadBrandAssets() {
    try {
      const res = await fetch("/project/football-team/api/admin/brand")
      if (res.ok) {
        const data = await res.json()
        setBrand(data)
      }
    } catch {
      // Brand assets may not exist yet
    } finally {
      setLoading(false)
    }
  }

  async function handleUpload(field: string, file: File) {
    setError(null)
    setWarnings((prev) => ({ ...prev, [field]: "" }))

    // Validate file type
    if (!file.type.match(/^image\/(png|svg\+xml)$/)) {
      setError("Only SVG or PNG files are accepted.")
      return
    }

    // Client-side dimension check for PNGs
    if (file.type === "image/png") {
      const valid = await checkDimensions(file, field)
      if (!valid) return
    }

    setUploading(field)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("field", field)

      const res = await fetch("/project/football-team/api/admin/brand", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? "Upload failed")
        return
      }

      await loadBrandAssets()
    } catch {
      setError("Upload failed. Please try again.")
    } finally {
      setUploading(null)
    }
  }

  function checkDimensions(file: File, field: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const longest = Math.max(img.width, img.height)
        if (longest < 512) {
          setWarnings((prev) => ({
            ...prev,
            [field]: `Warning: Image is ${img.width}x${img.height}px. Recommended minimum 512px on longest edge.`,
          }))
        }
        URL.revokeObjectURL(img.src)
        resolve(true)
      }
      img.onerror = () => {
        URL.revokeObjectURL(img.src)
        resolve(true)
      }
      img.src = URL.createObjectURL(file)
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-zinc-400">Loading brand assets...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Brand Assets</h1>
        <p className="text-zinc-400">
          Upload and manage club logos and brand imagery.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {assetFields.map((asset) => (
          <AssetCard
            key={asset.field}
            asset={asset}
            currentUrl={(brand as any)?.[asset.field] ?? null}
            uploading={uploading === asset.field}
            warning={warnings[asset.field]}
            onUpload={(file) => handleUpload(asset.field, file)}
          />
        ))}
      </div>
    </div>
  )
}

function AssetCard({
  asset,
  currentUrl,
  uploading,
  warning,
  onUpload,
}: {
  asset: AssetField
  currentUrl: string | null
  uploading: boolean
  warning?: string
  onUpload: (file: File) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">{asset.label}</h3>
        {asset.required && (
          <span className="text-[10px] font-medium uppercase text-amber-400">
            Required
          </span>
        )}
      </div>

      <div className="mb-3 flex h-32 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800">
        {currentUrl ? (
          <img
            src={currentUrl}
            alt={asset.label}
            className="max-h-28 max-w-full object-contain p-2"
          />
        ) : (
          <span className="text-xs text-zinc-500">No image uploaded</span>
        )}
      </div>

      {warning && (
        <p className="mb-2 text-xs text-amber-400">{warning}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".svg,.png,image/svg+xml,image/png"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onUpload(file)
          e.target.value = ""
        }}
      />

      <Button
        size="sm"
        variant="outline"
        className="w-full"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? "Uploading..." : currentUrl ? "Replace" : "Upload"}
      </Button>
    </div>
  )
}
