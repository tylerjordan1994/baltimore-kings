"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
          <CardDescription>
            Welcome back. Sign in to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {mode === "password" ? (
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...passwordForm.register("email")}
                />
                {passwordForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {passwordForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...passwordForm.register("password")}
                />
                {passwordForm.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {passwordForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={passwordForm.formState.isSubmitting}
              >
                {passwordForm.formState.isSubmitting ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          ) : magicLinkSent ? (
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Check your email for a magic link to sign in.
              </p>
              <Button variant="ghost" onClick={() => setMagicLinkSent(false)}>
                Try again
              </Button>
            </div>
          ) : (
            <form onSubmit={magicLinkForm.handleSubmit(onMagicLinkSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="magic-email">Email</Label>
                <Input
                  id="magic-email"
                  type="email"
                  placeholder="you@example.com"
                  {...magicLinkForm.register("email")}
                />
                {magicLinkForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {magicLinkForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={magicLinkForm.formState.isSubmitting}
              >
                {magicLinkForm.formState.isSubmitting ? "Sending..." : "Send Magic Link"}
              </Button>
            </form>
          )}

          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => {
                setMode(mode === "password" ? "magic-link" : "password")
                setError(null)
                setMagicLinkSent(false)
              }}
            >
              {mode === "password" ? "Use magic link instead" : "Use password instead"}
            </Button>
          </div>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href={`/sign-up`} className="text-primary underline underline-offset-4 hover:text-primary/80">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
