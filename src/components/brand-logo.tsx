import { createClient } from "@/lib/supabase/server"

interface BrandLogoProps {
  variant: "header" | "footer" | "og"
}

export async function BrandLogo({ variant }: BrandLogoProps) {
  const supabase = await createClient()
  const { data: brand } = await supabase
    .from("brand_assets")
    .select("logo_mark_url, logo_full_url, logo_white_url")
    .limit(1)
    .single()

  const logoUrl = brand?.logo_mark_url ?? null

  if (logoUrl) {
    if (variant === "header") {
      return (
        <img
          src={logoUrl}
          alt="Baltimore Kings"
          className="h-9 w-9 rounded-sm object-contain"
        />
      )
    }

    if (variant === "footer") {
      const footerLogo = brand?.logo_white_url ?? logoUrl
      return (
        <img
          src={footerLogo}
          alt="Baltimore Kings"
          className="h-10 w-auto object-contain"
        />
      )
    }

    // og
    const ogLogo = brand?.logo_full_url ?? logoUrl
    return (
      <img
        src={ogLogo}
        alt="Baltimore Kings"
        className="h-16 w-auto object-contain"
      />
    )
  }

  // Text fallback
  if (variant === "header") {
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-primary">
        <span className="font-heading text-lg font-bold text-primary-foreground">
          BK
        </span>
      </div>
    )
  }

  if (variant === "footer") {
    return (
      <span className="font-heading text-xl font-bold tracking-wider text-white">
        BALTIMORE KINGS
      </span>
    )
  }

  // og
  return (
    <span className="font-heading text-3xl font-bold tracking-tight text-white">
      BALTIMORE KINGS
    </span>
  )
}
