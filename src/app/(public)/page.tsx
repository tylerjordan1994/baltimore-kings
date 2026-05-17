import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, MapPin, Calendar, Users } from "lucide-react"

// basePath handled by next.config.ts

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary py-24 sm:py-32 lg:py-40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gold/10 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="font-heading text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl">
              Indoor soccer and futsal, played seriously, in Baltimore.
            </h1>
            <p className="mt-6 text-lg text-primary-foreground/80">
              The Baltimore Kings compete in MASL3 arena soccer and Pro-SA League 1 Futsal.
              We run year-round programs out of GOALS Baltimore and Benfield Sports — training players
              who want to compete at the highest level of indoor play on the East Coast.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href={`/apply`}>
                <Button size="lg" variant="secondary" className="font-heading font-semibold">
                  Apply for a Tryout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href={`/schedule`}>
                <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  See the Schedule
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Three team cards */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold sm:text-3xl">Our Programs</h2>
          <p className="mt-2 text-muted-foreground">Three competitive tracks. One pathway up.</p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Link href={`/teams/masl3`}>
              <Card className="group h-full transition-shadow hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary">
                    <Users className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="mt-4 font-heading text-xl font-bold group-hover:text-gold-dark">MASL3 Arena Soccer</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Six-a-side on a walled arena pitch. Fast, physical, technical.
                    The Kings compete in the Major Arena Soccer League 3 — the third tier of
                    professional arena soccer in the US.
                  </p>
                  <span className="mt-4 inline-flex items-center text-sm font-medium text-gold-dark">
                    View team <ArrowRight className="ml-1 h-3 w-3" />
                  </span>
                </CardContent>
              </Card>
            </Link>

            <Link href={`/teams/futsal-l1`}>
              <Card className="group h-full transition-shadow hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gold">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 font-heading text-xl font-bold group-hover:text-gold-dark">League 1 Futsal</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Five-a-side on a regulation futsal court. Technical precision,
                    tight rotations, rapid decision-making. Pro-SA League 1 competition.
                  </p>
                  <span className="mt-4 inline-flex items-center text-sm font-medium text-gold-dark">
                    View team <ArrowRight className="ml-1 h-3 w-3" />
                  </span>
                </CardContent>
              </Card>
            </Link>

            <Card className="h-full border-dashed">
              <CardContent className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/30">
                  <ArrowRight className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="mt-4 font-heading text-xl font-bold">Pathway to MASL2</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  The Salisbury Steaks — same ownership, one tier up. Stand-out Kings players
                  get promoted to the MASL2 roster. This is how you move up.
                </p>
                <Link
                  href={`/teams/masl3#pathway`}
                  className="mt-4 inline-flex items-center text-sm font-medium text-gold-dark"
                >
                  Learn about the pathway <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Venues */}
      <section className="border-t bg-muted/50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold sm:text-3xl">Where We Play</h2>
          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            <div className="overflow-hidden rounded-lg border bg-card">
              <div className="aspect-video w-full bg-muted">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3087.5!2d-76.6!3d39.3!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sGOALS+Baltimore!5e0!3m2!1sen!2sus!4v1"
                  className="h-full w-full border-0"
                  loading="lazy"
                  title="GOALS Baltimore location"
                />
              </div>
              <div className="p-4">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-gold-dark" />
                  <div>
                    <h3 className="font-heading font-bold">GOALS Baltimore</h3>
                    <p className="text-sm text-muted-foreground">Home games — MASL3 match days</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      [NEEDS CONFIRMATION] Exact address. Parking available on-site.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border bg-card">
              <div className="aspect-video w-full bg-muted">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3087.5!2d-76.6!3d39.2!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sBenfield+Sportscenter!5e0!3m2!1sen!2sus!4v1"
                  className="h-full w-full border-0"
                  loading="lazy"
                  title="Benfield Sports location"
                />
              </div>
              <div className="p-4">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-gold-dark" />
                  <div>
                    <h3 className="font-heading font-bold">Benfield Sportscenter</h3>
                    <p className="text-sm text-muted-foreground">Practice facility — weekly training sessions</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      903 Benfield Rd, Severna Park, MD 21146
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Next game / schedule teaser */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-2xl font-bold sm:text-3xl">Upcoming</h2>
            <Link href={`/schedule`} className="text-sm font-medium text-gold-dark hover:underline">
              Full schedule <ArrowRight className="ml-1 inline h-3 w-3" />
            </Link>
          </div>
          <div className="mt-8 rounded-lg border bg-card p-6 text-center">
            <Calendar className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-muted-foreground">Schedule updates coming soon. Check back for the 2025-2026 season fixtures.</p>
          </div>
        </div>
      </section>

      {/* Sponsors */}
      <section className="border-t bg-muted/30 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Affiliated with
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-8">
            <a href="https://www.masl3.com/" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              MASL3
            </a>
            <a href="http://www.prosocceralliance.com/" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Pro-SA
            </a>
            <span className="text-sm text-muted-foreground">Salisbury Steaks (MASL2)</span>
          </div>
        </div>
      </section>
    </>
  )
}
