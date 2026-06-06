"use client"

import { useState } from "react"

const BASE = "/project/football-team"

export type Settings = {
  founded_year: number | null
  contact_email: string | null
  contact_phone: string | null
  default_og_image_url: string | null
  public_theme: string
  dashboard_theme: string
  social_handles: Record<string, string> | null
}

const SOCIALS = ["instagram", "twitter", "facebook", "youtube"]

export function SettingsForm({ initial }: { initial: Settings }) {
  const [s, setS] = useState<Settings>({ ...initial, social_handles: initial.social_handles ?? {} })
  const [msg, setMsg] = useState("")
  const set = (p: Partial<Settings>) => setS((prev) => ({ ...prev, ...p }))
  const social = s.social_handles ?? {}
  const input = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
  const label = "text-xs font-semibold text-muted-foreground"

  async function save() {
    setMsg("Saving…")
    const res = await fetch(`${BASE}/api/cms/settings`, {
      method: "PUT", headers: { "content-type": "application/json" },
      body: JSON.stringify({
        founded_year: s.founded_year ? Number(s.founded_year) : null,
        contact_email: s.contact_email || null,
        contact_phone: s.contact_phone || null,
        default_og_image_url: s.default_og_image_url || null,
        public_theme: s.public_theme === "dark" ? "dark" : "light",
        dashboard_theme: s.dashboard_theme === "light" ? "light" : "dark",
        social_handles: social,
      }),
    })
    setMsg(res.ok ? "Saved ✓" : "Error saving")
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 rounded-xl border border-border bg-card p-5 sm:grid-cols-2">
        <label className="grid gap-1"><span className={label}>Founded year</span>
          <input className={input} type="number" value={s.founded_year ?? ""} onChange={(e) => set({ founded_year: e.target.value ? Number(e.target.value) : null })} placeholder="2012" />
        </label>
        <label className="grid gap-1"><span className={label}>Contact email</span>
          <input className={input} value={s.contact_email ?? ""} onChange={(e) => set({ contact_email: e.target.value })} />
        </label>
        <label className="grid gap-1"><span className={label}>Contact phone</span>
          <input className={input} value={s.contact_phone ?? ""} onChange={(e) => set({ contact_phone: e.target.value })} />
        </label>
        <label className="grid gap-1"><span className={label}>Default share image URL (OG)</span>
          <input className={input} value={s.default_og_image_url ?? ""} onChange={(e) => set({ default_og_image_url: e.target.value })} />
        </label>
      </div>

      <div className="grid gap-3 rounded-xl border border-border bg-card p-5">
        <p className={label}>Social handles</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {SOCIALS.map((k) => (
            <label key={k} className="grid gap-1"><span className="text-xs capitalize text-muted-foreground">{k}</span>
              <input className={input} value={social[k] ?? ""} onChange={(e) => set({ social_handles: { ...social, [k]: e.target.value } })} placeholder={`@handle or URL`} />
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-3 rounded-xl border border-border bg-card p-5 sm:grid-cols-2">
        <label className="grid gap-1"><span className={label}>Public theme</span>
          <select className={input} value={s.public_theme} onChange={(e) => set({ public_theme: e.target.value })}><option value="light">Light</option><option value="dark">Dark</option></select>
        </label>
        <label className="grid gap-1"><span className={label}>Dashboard theme</span>
          <select className={input} value={s.dashboard_theme} onChange={(e) => set({ dashboard_theme: e.target.value })}><option value="dark">Dark</option><option value="light">Light</option></select>
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={save} className="rounded-full bg-brand px-6 py-2 text-sm font-semibold text-paper">Save settings</button>
        <span className="text-sm text-muted-foreground">{msg}</span>
      </div>
    </div>
  )
}
