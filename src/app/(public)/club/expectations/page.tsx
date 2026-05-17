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
      <section className="bg-zinc-950 px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl">
            What We Expect
          </h1>
          <p className="mt-4 text-lg text-zinc-400">
            Every player signs this. No exceptions.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        {requirement ? (
          <AccordionSections markdown={requirement.body_markdown} />
        ) : (
          <p className="text-center text-zinc-500">
            No team expectations document has been published yet.
          </p>
        )}
      </section>

      {/* CTA */}
      <section className="border-t border-zinc-800 bg-zinc-950 px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-heading text-2xl font-bold text-white">
            Ready to commit?
          </h2>
          <p className="mt-2 text-zinc-400">
            If you can live up to these standards, we want to hear from you.
          </p>
          <Link
            href="/apply"
            className="mt-6 inline-block rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Apply for a tryout
          </Link>
        </div>
      </section>
    </div>
  )
}
