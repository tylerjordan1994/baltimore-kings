"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

// basePath handled by next.config.ts

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

type SignInValues = z.infer<typeof signInSchema>

const magicLinkSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

type MagicLinkValues = z.infer<typeof magicLinkSchema>

export default function SignInPage() {
  const router = useRouter()
  const [mode, setMode] = useState<"password" | "magic-link">("password")
  const [error, setError] = useState<string | null>(null)
  const [magicLinkSent, setMagicLinkSent] = useState(false)

  const passwordForm = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  })

  const magicLinkForm = useForm<MagicLinkValues>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: { email: "" },
  })

  async function onPasswordSubmit(values: SignInValues) {
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })
    if (error) {
      setError(error.message)
      return
    }
    router.push(`/app`)
  }

  async function onMagicLinkSubmit(values: MagicLinkValues) {
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email: values.email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
      return
    }
    setMagicLinkSent(true)
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-[#0a0a0a] px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold text-white">Sign In</h1>
          <p className="mt-1 text-sm text-white/60">
            Welcome back. Sign in to your account.
          </p>
        </div>

        <div className="mt-6">
          {error && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {mode === "password" ? (
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-white">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...passwordForm.register("email")}
                  className="block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-gold focus:ring-1 focus:ring-gold"
                />
                {passwordForm.formState.errors.email && (
                  <p className="text-sm text-red-400">
                    {passwordForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-white">Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...passwordForm.register("password")}
                  className="block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-gold focus:ring-1 focus:ring-gold"
                />
                {passwordForm.formState.errors.password && (
                  <p className="text-sm text-red-400">
                    {passwordForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gold font-heading font-semibold text-black hover:bg-gold/90"
                disabled={passwordForm.formState.isSubmitting}
              >
                {passwordForm.formState.isSubmitting ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          ) : magicLinkSent ? (
            <div className="text-center space-y-2">
              <p className="text-sm text-white/60">
                Check your email for a magic link to sign in.
              </p>
              <Button variant="ghost" onClick={() => setMagicLinkSent(false)} className="text-white/70 hover:text-white hover:bg-white/5">
                Try again
              </Button>
            </div>
          ) : (
            <form onSubmit={magicLinkForm.handleSubmit(onMagicLinkSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="magic-email" className="block text-sm font-medium text-white">Email</label>
                <input
                  id="magic-email"
                  type="email"
                  placeholder="you@example.com"
                  {...magicLinkForm.register("email")}
                  className="block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-gold focus:ring-1 focus:ring-gold"
                />
                {magicLinkForm.formState.errors.email && (
                  <p className="text-sm text-red-400">
                    {magicLinkForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gold font-heading font-semibold text-black hover:bg-gold/90"
                disabled={magicLinkForm.formState.isSubmitting}
              >
                {magicLinkForm.formState.isSubmitting ? "Sending..." : "Send Magic Link"}
              </Button>
            </form>
          )}

          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setMode(mode === "password" ? "magic-link" : "password")
                setError(null)
                setMagicLinkSent(false)
              }}
              className="text-sm text-gold hover:text-gold/80"
            >
              {mode === "password" ? "Use magic link instead" : "Use password instead"}
            </button>
          </div>

          <div className="mt-4 text-center text-sm text-white/60">
            Don&apos;t have an account?{" "}
            <Link href={`/sign-up`} className="text-gold hover:text-gold/80">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
