"use client"

import { useRef, useState } from "react"
import { toPng } from "html-to-image"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

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

export default function SocialStudioPage() {
  const cardRef = useRef<HTMLDivElement | null>(null)
  const [template, setTemplate] = useState<Template>(TEMPLATES[0])
  const [photoUrl, setPhotoUrl] = useState("")
  const [headline, setHeadline] = useState(TEMPLATES[0].headline)
  const [subhead, setSubhead] = useState(TEMPLATES[0].subhead)
  const [detail, setDetail] = useState(TEMPLATES[0].detail)
  const [badge, setBadge] = useState(TEMPLATES[0].badge)
  const [busy, setBusy] = useState(false)

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
    "h-9 w-full rounded border border-zinc-700 bg-zinc-800 px-3 text-sm text-white placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Social Studio</h1>
        <p className="mt-1 text-zinc-400">
          Build branded announcement graphics and export them for social media.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
        {/* Controls */}
        <div className="space-y-5">
          <div>
            <p className="mb-2 text-xs font-medium text-zinc-500">
              Post type
            </p>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => selectTemplate(t)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    template.id === t.id
                      ? "bg-amber-500 text-zinc-950"
                      : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-zinc-500">
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
              className="mt-2 block w-full text-xs text-zinc-400 file:mr-3 file:rounded file:border-0 file:bg-zinc-800 file:px-3 file:py-1.5 file:text-xs file:text-zinc-200"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-zinc-500">
              Badge label
            </label>
            <input
              className={inputClass}
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-500">
              Headline
            </label>
            <input
              className={inputClass}
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-500">
              Subhead
            </label>
            <input
              className={inputClass}
              value={subhead}
              onChange={(e) => setSubhead(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-500">
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
          <p className="mb-2 text-xs font-medium text-zinc-500">Preview</p>
          <div
            className="overflow-hidden rounded-lg border border-zinc-700"
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
