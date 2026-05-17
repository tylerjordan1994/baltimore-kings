import Link from "next/link"

// basePath handled by next.config.ts

export function SiteFooter() {
  return (
    <footer className="relative bg-[#0a0a0a]">
      {/* Top gold gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Club Info */}
          <div>
            <h3 className="font-heading text-lg font-bold text-foreground">Baltimore Kings</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Futsal and arena soccer in Baltimore. League 1 Futsal, MASL3 arena soccer, and a pathway to the top of American indoor soccer.
            </p>
            <div className="mt-5 flex items-center gap-4">
              <a
                href="https://www.instagram.com/baltimoreprofutsal/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-gold"
                aria-label="Instagram"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a
                href="https://twitter.com/BaltimoreKings"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-gold"
                aria-label="X / Twitter"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Teams */}
          <div>
            <h4 className="font-heading text-xs font-semibold uppercase tracking-widest text-gold">Teams</h4>
            <ul className="mt-4 space-y-3">
              <li><Link href="/teams/futsal-l1" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Futsal League 1</Link></li>
              <li><Link href="/teams/masl3" className="text-sm text-muted-foreground transition-colors hover:text-foreground">MASL3 Arena Soccer</Link></li>
              <li><a href="https://www.masl3.com/" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground transition-colors hover:text-foreground">MASL3 League</a></li>
              <li><a href="http://www.prosocceralliance.com/" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Pro-SA</a></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-xs font-semibold uppercase tracking-widest text-gold">Quick Links</h4>
            <ul className="mt-4 space-y-3">
              <li><Link href="/apply" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Apply for Tryout</Link></li>
              <li><Link href="/roster" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Roster</Link></li>
              <li><Link href="/schedule" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Full Schedule</Link></li>
              <li><a href="https://baltimorekings.printify.me/" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Merch Store</a></li>
              <li><Link href="/sign-in" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Member Login</Link></li>
            </ul>
          </div>

          {/* Venues */}
          <div>
            <h4 className="font-heading text-xs font-semibold uppercase tracking-widest text-gold">Venues</h4>
            <ul className="mt-4 space-y-4">
              <li>
                <p className="text-sm font-medium text-foreground">GOALS Baltimore</p>
                <p className="text-xs text-muted-foreground">Home games</p>
              </li>
              <li>
                <p className="text-sm font-medium text-foreground">Benfield Sports</p>
                <p className="text-xs text-muted-foreground">Practice facility</p>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright bar */}
        <div className="mt-14 border-t border-white/5 pt-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Baltimore Kings / Pro-Soccer Alliance. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
