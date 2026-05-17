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
      <section className="bg-[#0a0a0a] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Player Stories
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/60">
            What it is actually like to be part of this club.
          </p>
        </div>
      </section>

      <section className="bg-[#0a0a0a] pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-white/40 italic">
              [NEEDS CONTENT] - Player stories to be collected
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {storyTemplates.map((story, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                <Quote className="h-6 w-6 text-gold/40" />
                <p className="mt-4 text-sm text-white/60 italic">
                  &ldquo;{story.quote}&rdquo;
                </p>
                <div className="mt-4 border-t border-white/5 pt-4">
                  <p className="text-sm font-semibold text-white">{story.name}</p>
                  <p className="text-xs text-white/40">{story.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
