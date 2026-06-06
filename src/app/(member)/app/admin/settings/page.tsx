import { redirect } from "next/navigation"
import { requireRole } from "@/lib/require-role"
import { createClient } from "@/lib/supabase/server"
import { SettingsForm, type Settings } from "./settings-form"

export default async function SettingsAdmin() {
  try {
    await requireRole("coach")
  } catch {
    redirect("/app")
  }
  const supabase = await createClient()
  const { data } = await supabase.from("site_settings").select("*").eq("id", true).maybeSingle()
  const s = (data ?? {}) as Partial<Settings>

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-1 font-heading text-3xl text-ink">Site Settings</h1>
      <p className="mb-6 text-sm text-muted-foreground">Founding year, contact, socials, and themes. These feed value tokens (e.g. <code>[club-founded-year]</code>) and the public site.</p>
      <SettingsForm
        initial={{
          founded_year: s.founded_year ?? null,
          contact_email: s.contact_email ?? null,
          contact_phone: s.contact_phone ?? null,
          default_og_image_url: s.default_og_image_url ?? null,
          public_theme: s.public_theme ?? "light",
          dashboard_theme: s.dashboard_theme ?? "dark",
          social_handles: s.social_handles ?? {},
        }}
      />
    </div>
  )
}
