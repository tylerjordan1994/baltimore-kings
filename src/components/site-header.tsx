"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { HeaderLogo } from "@/components/header-logo"

// basePath handled by next.config.ts

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/teams/futsal-l1", label: "Futsal L1" },
  { href: "/teams/masl3", label: "MASL3" },
  { href: "/roster", label: "Roster" },
  { href: "/schedule", label: "Schedule" },
  { href: "/club/expectations", label: "Club" },
  { href: "/media", label: "Media" },
  { href: "/learn", label: "Learn" },
  { href: "/merch", label: "Merch" },
  { href: "/apply", label: "Apply" },
]

export function SiteHeader({ logoUrl }: { logoUrl?: string | null } = {}) {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <HeaderLogo logoUrl={logoUrl ?? null} />
          <span className="hidden font-heading text-lg font-bold tracking-tight sm:inline-block">
            Baltimore Kings
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <Link href={`/sign-in`}>
            <Button variant="outline" size="sm" className="ml-2">
              Sign In
            </Button>
          </Link>
        </nav>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px]">
            <nav className="flex flex-col gap-1 pt-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-base font-medium text-foreground transition-colors hover:bg-muted"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href={`/sign-in`}
                onClick={() => setOpen(false)}
                className="mt-4 rounded-md bg-primary px-3 py-2 text-center text-base font-medium text-primary-foreground"
              >
                Sign In
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
