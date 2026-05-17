import type { Metadata } from "next"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { AccordionSections } from "./accordion-sections"

export const metadata: Metadata = {
  title: "Team Expectations",
}

export default async function ExpectationsPage() {
  const supabase = await createClient()

  const { data: requirement } = await supabase
    .from("requirements")
    .select("*")
    .eq("is_active", true)
    .ilike("title", "%Team Expectations%")
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-paper px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-3xl">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            What We Expect
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Every player signs this. No exceptions.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-3xl bg-paper px-4 py-12 sm:px-6 lg:px-8">
        {requirement ? (
          <AccordionSections markdown={requirement.body_markdown} />
        ) : (
          <p className="text-center text-muted-foreground">
            No team expectations document has been published yet.
          </p>
        )}
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-paper px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-heading text-2xl font-bold text-ink">
            Ready to commit?
          </h2>
          <p className="mt-2 text-muted-foreground">
            If you can live up to these standards, we want to hear from you.
          </p>
          <Link
            href="/apply"
            className="mt-6 inline-block rounded-full bg-accent px-8 py-3 text-sm font-semibold text-ink transition-colors hover:bg-accent/90"
          >
            Apply for a tryout
          </Link>
        </div>
      </section>
    </div>
  )
}
