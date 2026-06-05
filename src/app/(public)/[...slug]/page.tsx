import { notFound } from "next/navigation"
import type { Metadata } from "next"
import type { Data } from "@measured/puck"
import { createAnonClient } from "@/lib/supabase/anon"
import { createClient } from "@/lib/supabase/server"
import { hydrateTokens, type PuckData } from "@/lib/content-tokens/hydrate"
import { PageRenderer } from "@/components/puck/page-renderer"

// Lower priority than every explicit (public) route — this only renders CMS pages
// at slugs not claimed by a folder. Unknown/unpublished slug -> 404.

type Params = { slug: string[] }

const RESERVED = new Set(["app", "api", "auth", "sign-in", "sign-up", "editor"])

async function audienceClient() {
  const session = await createClient()
  const { data: { user } } = await session.auth.getUser()
  if (!user) return { audience: "public" as const, db: createAnonClient(), member: false }
  const { data: prof } = await session.from("profiles").select("role").eq("id", user.id).maybeSingle()
  const member = !!prof && ["player", "coach", "superadmin"].includes((prof as { role: string }).role)
  return { audience: member ? ("member" as const) : ("public" as const), db: member ? session : createAnonClient(), member }
}

async function loadPage(slug: string, member: boolean, db: Awaited<ReturnType<typeof audienceClient>>["db"]) {
  let q = db.from("pages").select("*").eq("slug", slug).eq("status", "published")
  if (!member) q = q.eq("visibility", "public")
  const { data } = await q.maybeSingle()
  return data as
    | { puck_data: PuckData; seo_title: string | null; seo_description: string | null; og_image_url: string | null; title: string }
    | null
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug: parts } = await params
  const slug = parts.join("/")
  if (RESERVED.has(parts[0])) return {}
  const { member, db } = await audienceClient()
  const page = await loadPage(slug, member, db)
  if (!page) return {}
  return {
    title: page.seo_title ?? page.title,
    description: page.seo_description ?? undefined,
    openGraph: page.og_image_url ? { images: [page.og_image_url] } : undefined,
  }
}

export default async function CmsPage({ params }: { params: Promise<Params> }) {
  const { slug: parts } = await params
  if (RESERVED.has(parts[0])) notFound()
  const slug = parts.join("/")

  const { audience, db, member } = await audienceClient()
  const page = await loadPage(slug, member, db)
  if (!page) notFound()

  const hydrated = await hydrateTokens(page.puck_data, { audience, supabase: db })
  return <PageRenderer data={hydrated as unknown as Data} />
}
