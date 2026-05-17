import type { Metadata } from "next"
import { Quote } from "lucide-react"

export const metadata: Metadata = {
  title: "Player Stories | Baltimore Kings",
  description: "Hear from current and former Baltimore Kings players about their experience.",
}

const storyTemplates = [
  { name: "[Player Name]", role: "[Position / Team]", quote: "[Testimonial to be collected]" },
  { name: "[Player Name]", role: "[Position / Team]", quote: "[Testimonial to be collected]" },
  { name: "[Player Name]", role: "[Position / Team]", quote: "[Testimonial to be collected]" },
]

export default function StoriesPage() {
  return (
    <>
      <section className="bg-paper py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Player Stories
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            What it is actually like to be part of this club.
          </p>
        </div>
      </section>

      <section className="bg-paper pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 rounded-xl border border-border bg-white p-6">
            <p className="text-sm text-muted-foreground italic">
              [NEEDS CONTENT] - Player stories to be collected
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {storyTemplates.map((story, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-white p-6"
              >
                <Quote className="h-6 w-6 text-accent/40" />
                <p className="mt-4 text-sm text-muted-foreground italic">
                  &ldquo;{story.quote}&rdquo;
                </p>
                <div className="mt-4 border-t border-border pt-4">
                  <p className="text-sm font-semibold text-ink">{story.name}</p>
                  <p className="text-xs text-muted-foreground">{story.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
