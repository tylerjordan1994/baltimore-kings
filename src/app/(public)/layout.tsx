import { SiteHeader } from "@/components/site-header"
import { DbSiteHeader } from "@/components/db-site-header"
import { SiteFooter } from "@/components/site-footer"
import { AdminBar } from "@/components/admin-bar"
import { AnalyticsTracker } from "@/components/analytics-tracker"
import { SmoothScroll } from "@/components/smooth-scroll"
import { createClient } from "@/lib/supabase/server"
import { getPublicNav, getPrimaryNavTree } from "@/lib/nav"

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const [{ data: brand }, footerLinks, primaryNav, { data: partnerData }, { data: { user } }] = await Promise.all([
    supabase.from("brand_assets").select("logo_mark_url").limit(1).single(),
    getPublicNav("footer"),
    getPrimaryNavTree(),
    supabase
      .from("sponsors")
      .select("id, name, logo_url, website_url, tier")
      .eq("is_active", true)
      .order("order_index", { ascending: true }),
    supabase.auth.getUser(),
  ])
  const logoUrl = brand?.logo_mark_url ?? null
  const partners = (partnerData ?? []) as {
    id: string
    name: string
    logo_url: string | null
    website_url: string | null
    tier: string
  }[]

  let isCoach = false
  if (user) {
    const { data: prof } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
    isCoach = !!prof && ["coach", "superadmin"].includes((prof as { role: string }).role)
  }

  return (
    <div className="flex min-h-screen flex-col">
      {primaryNav.length > 0 ? (
        <DbSiteHeader nav={primaryNav} logoUrl={logoUrl} />
      ) : (
        <SiteHeader logoUrl={logoUrl} />
      )}
      <main className="flex-1">{children}</main>
      <SiteFooter quickLinks={footerLinks.map(({ label, href, external }) => ({ label, href, external }))} partners={partners} />
      {isCoach ? <AdminBar /> : null}
      <AnalyticsTracker />
      <SmoothScroll />
    </div>
  )
}
