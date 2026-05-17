import Link from "next/link"

// basePath handled by next.config.ts

export function SiteFooter() {
  return (
    <footer className="border-t bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="font-heading text-lg font-bold">Baltimore Kings</h3>
            <p className="mt-2 text-sm opacity-80">
              Pro indoor soccer and futsal in Baltimore. MASL3 arena soccer, League 1 Futsal, and more.
            </p>
            <div className="mt-4 flex gap-3">
              <a
                href="https://www.instagram.com/baltimoreprofutsal/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm opacity-80 hover:opacity-100"
              >
                @baltimoreprofutsal
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider opacity-60">Teams</h4>
            <ul className="mt-3 space-y-2">
              <li><Link href={`/teams/masl3`} className="text-sm opacity-80 hover:opacity-100">MASL3 Kings</Link></li>
              <li><Link href={`/teams/futsal-l1`} className="text-sm opacity-80 hover:opacity-100">Futsal League 1</Link></li>
              <li><a href="https://www.masl3.com/" target="_blank" rel="noopener noreferrer" className="text-sm opacity-80 hover:opacity-100">MASL3 League</a></li>
              <li><a href="http://www.prosocceralliance.com/" target="_blank" rel="noopener noreferrer" className="text-sm opacity-80 hover:opacity-100">Pro-SA</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider opacity-60">Venues</h4>
            <ul className="mt-3 space-y-2">
              <li className="text-sm opacity-80">
                <strong className="block">GOALS Baltimore</strong>
                Home games
              </li>
              <li className="text-sm opacity-80">
                <strong className="block">Benfield Sports</strong>
                Practice facility
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider opacity-60">Quick Links</h4>
            <ul className="mt-3 space-y-2">
              <li><Link href={`/apply`} className="text-sm opacity-80 hover:opacity-100">Apply for Tryout</Link></li>
              <li><Link href={`/schedule`} className="text-sm opacity-80 hover:opacity-100">Full Schedule</Link></li>
              <li><a href="https://baltimorekings.printify.me/" target="_blank" rel="noopener noreferrer" className="text-sm opacity-80 hover:opacity-100">Merch Store</a></li>
              <li><Link href={`/sign-in`} className="text-sm opacity-80 hover:opacity-100">Member Login</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-primary-foreground/20 pt-6 text-center text-xs opacity-60">
          &copy; {new Date().getFullYear()} Baltimore Kings / Pro-Soccer Alliance. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
