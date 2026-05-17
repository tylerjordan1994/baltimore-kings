import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, ShoppingBag } from "lucide-react"

// basePath handled by next.config.ts

export const metadata = {
  title: "Merch | Baltimore Kings",
  description: "Official Baltimore Kings gear and apparel.",
}

const FEATURED_PRODUCTS = [
  {
    id: 1,
    name: "Match Day Kit",
    description: "Black and gold. Same cut as the squad wears.",
    price: "$65",
  },
  {
    id: 2,
    name: "Training Tee",
    description: "Lightweight performance fabric. Kings crest.",
    price: "$35",
  },
  {
    id: 3,
    name: "Snapback Cap",
    description: "Structured crown, flat brim. Embroidered BK logo.",
    price: "$30",
  },
  {
    id: 4,
    name: "Hoodie",
    description: "Heavyweight fleece. Baltimore Kings across the chest.",
    price: "$55",
  },
]

export default function MerchPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-primary py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="font-heading text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl">
              Rep the Kings
            </h1>
            <p className="mt-4 text-lg text-primary-foreground/80">
              Official gear. Limited drops. All proceeds fund player development and travel.
            </p>
            <div className="mt-8">
              <a
                href="https://baltimorekings.printify.me/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" variant="secondary" className="font-heading font-semibold">
                  Shop now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold tracking-tight">Featured</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURED_PRODUCTS.map((product) => (
              <div
                key={product.id}
                className="group rounded-lg border border-border bg-card p-5 transition-colors hover:border-gold/50"
              >
                <div className="mb-4 flex h-40 items-center justify-center rounded bg-muted">
                  <ShoppingBag className="h-10 w-10 text-muted-foreground/40" />
                </div>
                <p className="font-heading font-semibold">{product.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{product.description}</p>
                <p className="mt-2 font-heading text-lg font-bold text-gold">{product.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-muted/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-2xl font-bold tracking-tight">Full catalog on Printify</h2>
          <p className="mt-2 text-muted-foreground">
            Tees, hoodies, hats, accessories. Ships direct.
          </p>
          <div className="mt-6">
            <a
              href="https://baltimorekings.printify.me/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" className="font-heading font-semibold">
                Browse full store
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
