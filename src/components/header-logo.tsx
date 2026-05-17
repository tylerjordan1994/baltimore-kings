"use client"

export function HeaderLogo({ logoUrl }: { logoUrl: string | null }) {
  return (
    <img
      src={logoUrl || "/project/football-team/logo.png"}
      alt="Baltimore Kings"
      className="h-10 w-10 rounded-full object-contain"
    />
  )
}
