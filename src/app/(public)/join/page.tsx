import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Join the Baltimore Kings",
  description: "Baltimore's competitive futsal and arena soccer club. See what we offer, what it costs, and how to apply.",
}

const sections = [
  {
    title: "Why the Kings",
    description: "A founding club of League 1 Futsal and PRO-SA. This is the real thing — structured competition, professional coaching, a pathway to the top.",
    href: "/join/why-kings",
  },
  {
    title: "The Pathway",
    description: "Two ladders from development to professional. Futsal and arena soccer, connected by the same club system.",
    href: "/join/pathway",
  },
  {
    title: "How We Develop Players",
    description: "Tactical curriculum, regular evaluations, and an orientation process that gets new players integrated fast.",
    href: "/join/development",
  },
  {
    title: "What It Costs",
    description: "Transparent pricing. No surprises. Payment plans available if you need them.",
    href: "/join/costs",
  },
  {
    title: "Start Your Application",
    description: "Fill out the form. A coach reviews every submission and reaches out within a week.",
    href: "/join/apply",
  },
]

export default function JoinPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-court py-28 sm:py-36">
        <img
          src="/project/football-team/photos/futsal-kings-1.jpg"
          alt="Baltimore Kings futsal team"
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            This is what a serious futsal club looks like.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/80">
            Competitive adults. Structured seasons. A real pathway from development to professional indoor soccer.
          </p>
        </div>
      </section>

      {/* Sections */}
      <section className="bg-paper pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sections.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                className="group rounded-xl border border-border bg-white p-6 transition-colors hover:border-accent/30"
              >
                <h2 className="font-heading text-lg font-semibold text-ink group-hover:text-accent transition-colors">
                  {section.title}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {section.description}
                </p>
                <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent">
                  Learn more
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <Link
              href="/join/apply"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-8 py-4 text-base font-semibold text-paper transition-colors hover:bg-brand/90"
            >
              Apply Now
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
