import Link from "next/link"
import { Button } from "@/components/ui/button"

// basePath handled by next.config.ts

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="font-heading text-6xl font-bold">404</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Page not found. Might have been offside.
      </p>
      <Link href="/" className="mt-8">
        <Button>Back to Home</Button>
      </Link>
    </div>
  )
}
