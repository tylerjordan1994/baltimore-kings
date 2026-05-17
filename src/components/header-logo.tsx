"use client"

export function HeaderLogo({ logoUrl }: { logoUrl: string | null }) {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt="Baltimore Kings"
        className="h-9 w-9 rounded-sm object-contain"
      />
    )
  }

  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-primary">
      <span className="font-heading text-lg font-bold text-primary-foreground">
        BK
      </span>
    </div>
  )
}
