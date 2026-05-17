"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

// basePath handled by next.config.ts

const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  full_name: z.string().min(1, "Full name is required"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\+[1-9]\d{1,14}$/, "Phone must be in E.164 format (e.g. +14155551234)"),
})

type SignUpValues = z.infer<typeof signUpSchema>

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: "", password: "", full_name: "", phone: "" },
  })

  async function onSubmit(values: SignUpValues) {
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.full_name,
          phone: values.phone,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
      return
    }
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-[#0a0a0a] px-4">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm text-center">
          <h1 className="font-heading text-2xl font-bold text-white">Check Your Email</h1>
          <p className="mt-2 text-sm text-white/60">
            We&apos;ve sent a confirmation link to your email address. Please click the link to verify your account.
          </p>
          <Link href={`/sign-in`} className="mt-4 inline-block text-sm text-gold hover:text-gold/80">
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-[#0a0a0a] px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold text-white">Create Account</h1>
          <p className="mt-1 text-sm text-white/60">
            Sign up to join Baltimore Kings.
          </p>
        </div>

        <div className="mt-6">
          {error && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="full_name" className="block text-sm font-medium text-white">Full Name</label>
              <input
                id="full_name"
                type="text"
                placeholder="John Doe"
                {...form.register("full_name")}
                className="block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-gold focus:ring-1 focus:ring-gold"
              />
              {form.formState.errors.full_name && (
                <p className="text-sm text-red-400">
                  {form.formState.errors.full_name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-white">Email</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...form.register("email")}
                className="block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-gold focus:ring-1 focus:ring-gold"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-400">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-white">Phone</label>
              <input
                id="phone"
                type="tel"
                placeholder="+14155551234"
                {...form.register("phone")}
                className="block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-gold focus:ring-1 focus:ring-gold"
              />
              {form.formState.errors.phone && (
                <p className="text-sm text-red-400">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-white">Password</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                {...form.register("password")}
                className="block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-gold focus:ring-1 focus:ring-gold"
              />
              {form.formState.errors.password && (
                <p className="text-sm text-red-400">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gold font-heading font-semibold text-black hover:bg-gold/90"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-white/60">
            Already have an account?{" "}
            <Link href={`/sign-in`} className="text-gold hover:text-gold/80">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
