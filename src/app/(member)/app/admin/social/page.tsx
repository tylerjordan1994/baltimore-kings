"use client"

import { useEffect, useRef, useState } from "react"
import { toPng } from "html-to-image"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { BrandAssets } from "@/types/database"

interface Template {
  id: string
  label: string
  badge: string
  headline: string
  subhead: string
  detail: string
}

const TEMPLATES: Template[] = [
  {
    id: "game_day",
    label: "Game Day",
    badge: "GAME DAY",
    headline: "Kings vs Opponent",
    subhead: "Come support the squad",
    detail: "Sat 7:00 PM · CCBC Catonsville",
  },
  {
    id: "final_score",
    label: "Final Score",
    badge: "FULL TIME",
    headline: "Kings 5 — 3 Opponent",
    subhead: "Another one in the books",
    detail: "MASL3 · Regular Season",
  },
  {
    id: "team_promo",
    label: "Team Promo",
    badge: "JOIN THE KINGS",
    headline: "Tryouts Are Open",
    subhead: "Earn your place on the roster",
    detail: "Register at baltimorekings.com",
  },
  {
    id: "roster_decision",
    label: "Roster Decision",
    badge: "ROSTER UPDATE",
    headline: "2025–26 Roster Announced",
    subhead: "Meet the squad",
    detail: "Baltimore Kings FC",
  },
  {
    id: "new_player",
    label: "New Player",
    badge: "NEW SIGNING",
    headline: "Welcome to Baltimore",
    subhead: "A new King joins the throne",
    detail: "#00 · Forward",
  },
]

// ── Brand assets (merged in from the former admin/brand page) ──
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
    <div className="rounded-xl border border-border bg-white shadow-sm p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-ink">{asset.label}</h3>
        {asset.required && (
          <span className="text-[10px] font-medium uppercase text-accent-dark">
            Required
          </span>
        )}
      </div>

      <div className="mb-3 flex h-32 items-center justify-center rounded-lg border border-border bg-paper">
        {currentUrl ? (
          <img
            src={currentUrl}
            alt={asset.label}
            className="max-h-28 max-w-full object-contain p-2"
          />
        ) : (
          <span className="text-xs text-muted-foreground">No image uploaded</span>
        )}
      </div>

      {warning && <p className="mb-2 text-xs text-accent-dark">{warning}</p>}

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

export default function SocialStudioPage() {
  const [section, setSection] = useState<"studio" | "brand">("studio")
  const cardRef = useRef<HTMLDivElement | null>(null)
  const [template, setTemplate] = useState<Template>(TEMPLATES[0])
  const [photoUrl, setPhotoUrl] = useState("")
  const [headline, setHeadline] = useState(TEMPLATES[0].headline)
  const [subhead, setSubhead] = useState(TEMPLATES[0].subhead)
  const [detail, setDetail] = useState(TEMPLATES[0].detail)
  const [badge, setBadge] = useState(TEMPLATES[0].badge)
  const [busy, setBusy] = useState(false)

  // Brand assets state
  const [brand, setBrand] = useState<BrandAssets | null>(null)
  const [brandLoading, setBrandLoading] = useState(true)
  const [brandUploading, setBrandUploading] = useState<string | null>(null)
  const [brandError, setBrandError] = useState<string | null>(null)
  const [brandWarnings, setBrandWarnings] = useState<Record<string, string>>({})

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
      setBrandLoading(false)
    }
  }

  function checkBrandDimensions(file: File, field: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const longest = Math.max(img.width, img.height)
        if (longest < 512) {
          setBrandWarnings((prev) => ({
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

  async function handleBrandUpload(field: string, file: File) {
    setBrandError(null)
    setBrandWarnings((prev) => ({ ...prev, [field]: "" }))

    if (!file.type.match(/^image\/(png|svg\+xml)$/)) {
      setBrandError("Only SVG or PNG files are accepted.")
      return
    }

    if (file.type === "image/png") {
      const valid = await checkBrandDimensions(file, field)
      if (!valid) return
    }

    setBrandUploading(field)
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
        setBrandError(data.error ?? "Upload failed")
        return
      }
      await loadBrandAssets()
    } catch {
      setBrandError("Upload failed. Please try again.")
    } finally {
      setBrandUploading(null)
    }
  }

  function selectTemplate(t: Template) {
    setTemplate(t)
    setBadge(t.badge)
    setHeadline(t.headline)
    setSubhead(t.subhead)
    setDetail(t.detail)
  }

  async function handlePhotoUpload(file: File) {
    setBusy(true)
    try {
      const supabase = createClient()
      const path = `social/${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`
      const { error } = await supabase.storage
        .from("media")
        .upload(path, file, { upsert: true })
      if (error) throw error
      const { data } = supabase.storage.from("media").getPublicUrl(path)
      setPhotoUrl(data.publicUrl)
      toast.success("Photo uploaded")
    } catch {
      toast.error("Upload failed — you can paste an image URL instead")
    } finally {
      setBusy(false)
    }
  }

  async function handleExport() {
    if (!cardRef.current) return
    setBusy(true)
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 1,
        cacheBust: true,
      })
      const a = document.createElement("a")
      a.href = dataUrl
      a.download = `kings-${template.id}.png`
      a.click()
      toast.success("Image exported")
    } catch {
      toast.error("Could not export — check the photo URL allows embedding")
    } finally {
      setBusy(false)
    }
  }

  const inputClass =
    "h-9 w-full rounded border border-border bg-white px-3 text-sm text-ink placeholder:text-muted-foreground focus:border-blue-500 focus:outline-none"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Social Studio &amp; Brand</h1>
        <p className="mt-1 text-muted-foreground">
          Build branded graphics for social media and manage club brand assets.
        </p>
      </div>

      {/* Section toggle */}
      <div className="flex gap-1 rounded-lg border border-border bg-white shadow-sm p-1">
        {([
          { key: "studio", label: "Social Studio" },
          { key: "brand", label: "Brand Assets" },
        ] as { key: "studio" | "brand"; label: string }[]).map((s) => (
          <button
            key={s.key}
            onClick={() => setSection(s.key)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              section === s.key
                ? "bg-paper text-ink"
                : "text-muted-foreground hover:text-ink"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {section === "brand" && (
        <div className="space-y-6">
          {brandLoading ? (
            <p className="text-muted-foreground">Loading brand assets...</p>
          ) : (
            <>
              {brandError && (
                <div className="rounded-lg border border-red-200 bg-red-100 px-4 py-3 text-sm text-red-700">
                  {brandError}
                </div>
              )}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {assetFields.map((asset) => (
                  <AssetCard
                    key={asset.field}
                    asset={asset}
                    currentUrl={(brand as any)?.[asset.field] ?? null}
                    uploading={brandUploading === asset.field}
                    warning={brandWarnings[asset.field]}
                    onUpload={(file) => handleBrandUpload(asset.field, file)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <div className={`grid gap-6 lg:grid-cols-[1fr_auto] ${section === "studio" ? "" : "hidden"}`}>
        {/* Controls */}
        <div className="space-y-5">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Post type
            </p>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => selectTemplate(t)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    template.id === t.id
                      ? "bg-brand text-paper"
                      : "bg-zinc-100 text-ink/80 hover:bg-zinc-200"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Photo (team or player)
            </label>
            <input
              className={inputClass}
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="Paste an image URL..."
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handlePhotoUpload(file)
              }}
              className="mt-2 block w-full text-xs text-muted-foreground file:mr-3 file:rounded file:border-0 file:bg-paper file:px-3 file:py-1.5 file:text-xs file:text-ink/80"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Badge label
            </label>
            <input
              className={inputClass}
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Headline
            </label>
            <input
              className={inputClass}
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Subhead
            </label>
            <input
              className={inputClass}
              value={subhead}
              onChange={(e) => setSubhead(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Detail line
            </label>
            <input
              className={inputClass}
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
            />
          </div>

          <Button onClick={handleExport} disabled={busy}>
            {busy ? "Working..." : "Export PNG (1080×1080)"}
          </Button>
        </div>

        {/* Preview — card is rendered at 1080px and scaled for display */}
        <div className="mx-auto">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Preview</p>
          <div
            className="overflow-hidden rounded-lg border border-border"
            style={{ width: 432, height: 432 }}
          >
            <div
              style={{
                width: 1080,
                height: 1080,
                transform: "scale(0.4)",
                transformOrigin: "top left",
              }}
            >
            <div
              ref={cardRef}
              style={{
                width: 1080,
                height: 1080,
                position: "relative",
                background: "#0A1A3F",
                fontFamily: "system-ui, sans-serif",
                overflow: "hidden",
              }}
            >
              {/* Photo */}
              {photoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoUrl}
                  alt=""
                  crossOrigin="anonymous"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              )}
              {/* Gradient overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(180deg, rgba(10,26,63,0.55) 0%, rgba(10,26,63,0.15) 40%, rgba(10,26,63,0.95) 100%)",
                }}
              />
              {/* Gold top border */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 14,
                  background: "#C9A94E",
                }}
              />
              {/* Badge */}
              <div
                style={{
                  position: "absolute",
                  top: 72,
                  left: 72,
                  background: "#C9A94E",
                  color: "#0A1A3F",
                  fontWeight: 800,
                  fontSize: 34,
                  letterSpacing: 3,
                  padding: "14px 28px",
                  borderRadius: 8,
                }}
              >
                {badge}
              </div>
              {/* Text block */}
              <div
                style={{
                  position: "absolute",
                  left: 72,
                  right: 72,
                  bottom: 96,
                }}
              >
                <div
                  style={{
                    color: "#ffffff",
                    fontWeight: 800,
                    fontSize: 96,
                    lineHeight: 1.05,
                    textShadow: "0 2px 16px rgba(0,0,0,0.5)",
                  }}
                >
                  {headline}
                </div>
                <div
                  style={{
                    color: "#E6D9A8",
                    fontWeight: 600,
                    fontSize: 46,
                    marginTop: 24,
                  }}
                >
                  {subhead}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 20,
                    marginTop: 36,
                  }}
                >
                  <div
                    style={{ width: 56, height: 4, background: "#C9A94E" }}
                  />
                  <div
                    style={{
                      color: "#ffffff",
                      fontWeight: 500,
                      fontSize: 38,
                      opacity: 0.9,
                    }}
                  >
                    {detail}
                  </div>
                </div>
              </div>
              {/* Wordmark */}
              <div
                style={{
                  position: "absolute",
                  top: 72,
                  right: 72,
                  color: "#ffffff",
                  fontWeight: 800,
                  fontSize: 40,
                  letterSpacing: 1,
                  textAlign: "right",
                }}
              >
                BALTIMORE
                <br />
                <span style={{ color: "#C9A94E" }}>KINGS</span>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
