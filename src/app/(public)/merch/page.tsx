import { ArrowRight, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Merch | Baltimore Kings",
  description: "Official Baltimore Kings gear and apparel.",
}

export default function MerchPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-paper py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="font-heading text-4xl font-bold tracking-tight text-ink sm:text-5xl">
              Kings Gear
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Official Baltimore Kings merchandise. All black, all business.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Card */}
      <section className="bg-paper pb-20 sm:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <a
            href="https://baltimorekings.printify.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="mx-auto block max-w-xl rounded-xl border border-border bg-white p-10 text-center transition-all hover:border-accent/30"
          >
            <ShoppingBag className="mx-auto h-12 w-12 text-ink" />
            <h2 className="mt-4 font-heading text-2xl font-bold text-ink">
              Shop the full store on Printify
            </h2>
            <p className="mt-2 text-muted-foreground">
              Tees, hoodies, hats, and accessories. Ships direct to your door.
            </p>
            <Button
              size="lg"
              className="mt-6 bg-accent font-heading font-semibold text-ink hover:bg-accent/90 rounded-full"
            >
              Visit store
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </a>
        </div>
      </section>
    </>
  )
}
