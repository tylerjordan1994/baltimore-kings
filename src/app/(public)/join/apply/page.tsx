"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2 } from "lucide-react"

// basePath handled by next.config.ts

const applicationSchema = z.object({
  full_name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(7, "Phone number required"),
  date_of_birth: z.string().min(1, "Date of birth required"),
  years_experience: z.coerce.number().min(0).max(50),
  prior_teams: z.string().optional(),
  position_preference: z.string().min(1, "Pick a position"),
  notes: z.string().optional(),
})

type ApplicationData = z.infer<typeof applicationSchema>

const POSITIONS = [
  "Goalkeeper",
  "Defender",
  "Wing",
  "Pivot / Forward",
  "Utility (any)",
]

export default function JoinApplyPage() {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationData>({
    resolver: zodResolver(applicationSchema) as any,
  })

  async function onSubmit(data: ApplicationData) {
    setError(null)
    try {
      const res = await fetch(`/api/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || "Submission failed")
      }
      setSubmitted(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.")
    }
  }

  if (submitted) {
    return (
      <section className="bg-paper py-24 sm:py-32">
        <div className="mx-auto max-w-lg px-4 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-accent" />
          <h1 className="mt-4 font-heading text-2xl font-bold text-ink">Application received</h1>
          <p className="mt-2 text-muted-foreground">
            A coach will review your info and reach out within a week. Check your email.
          </p>
        </div>
      </section>
    )
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Join the Kings
          </h1>
          <p className="mt-2 text-muted-foreground">
            Fill this out. We will contact you with tryout details.
          </p>
        </div>
      </section>

      <section className="bg-paper py-12 sm:py-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-ink">
                Full name
              </label>
              <input
                id="full_name"
                type="text"
                {...register("full_name")}
                className="mt-1 block w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-ink outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-accent"
              />
              {errors.full_name && (
                <p className="mt-1 text-xs text-red-600">{errors.full_name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink">
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                className="mt-1 block w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-ink outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-accent"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-ink">
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                {...register("phone")}
                className="mt-1 block w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-ink outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-accent"
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label htmlFor="date_of_birth" className="block text-sm font-medium text-ink">
                Date of birth
              </label>
              <input
                id="date_of_birth"
                type="date"
                {...register("date_of_birth")}
                className="mt-1 block w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-ink outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-accent"
              />
              {errors.date_of_birth && (
                <p className="mt-1 text-xs text-red-600">{errors.date_of_birth.message}</p>
              )}
            </div>

            {/* Years Experience */}
            <div>
              <label htmlFor="years_experience" className="block text-sm font-medium text-ink">
                Years of indoor/futsal experience
              </label>
              <input
                id="years_experience"
                type="number"
                min={0}
                max={50}
                {...register("years_experience")}
                className="mt-1 block w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-ink outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-accent"
              />
              {errors.years_experience && (
                <p className="mt-1 text-xs text-red-600">{errors.years_experience.message}</p>
              )}
            </div>

            {/* Prior Teams */}
            <div>
              <label htmlFor="prior_teams" className="block text-sm font-medium text-ink">
                Prior teams (optional)
              </label>
              <textarea
                id="prior_teams"
                rows={2}
                {...register("prior_teams")}
                placeholder="List any relevant teams you've played for"
                className="mt-1 block w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-ink outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-accent"
              />
            </div>

            {/* Position Preference */}
            <div>
              <label htmlFor="position_preference" className="block text-sm font-medium text-ink">
                Position preference
              </label>
              <select
                id="position_preference"
                {...register("position_preference")}
                className="mt-1 block w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">Select position</option>
                {POSITIONS.map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
              {errors.position_preference && (
                <p className="mt-1 text-xs text-red-600">{errors.position_preference.message}</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-ink">
                Anything else (optional)
              </label>
              <textarea
                id="notes"
                rows={3}
                {...register("notes")}
                placeholder="Availability, links to highlight tape, questions"
                className="mt-1 block w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-ink outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-accent"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              size="lg"
              className="w-full bg-brand font-heading font-semibold text-paper hover:bg-brand/90 rounded-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit application"
              )}
            </Button>
          </form>
        </div>
      </section>
    </>
  )
}
