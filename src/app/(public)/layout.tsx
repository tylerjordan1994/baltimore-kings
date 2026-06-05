import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { createClient } from "@/lib/supabase/server"
import { getPublicNav } from "@/lib/nav"

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const [{ data: brand }, footerLinks] = await Promise.all([
    supabase.from("brand_assets").select("logo_mark_url").limit(1).single(),
    getPublicNav("footer"),
  ])

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader logoUrl={brand?.logo_mark_url ?? null} />
      <main className="flex-1">{children}</main>
      <SiteFooter quickLinks={footerLinks.map(({ label, href, external }) => ({ label, href, external }))} />
    </div>
  )
}
