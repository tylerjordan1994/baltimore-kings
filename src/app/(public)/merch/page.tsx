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
      <section className="relative overflow-hidden bg-paper py-20 sm:py-28">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="font-heading text-4xl font-bold tracking-tight text-ink sm:text-5xl">
              Rep the Kings
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Official gear. Limited drops. All proceeds fund player development and travel.
            </p>
            <div className="mt-8">
              <a
                href="https://baltimorekings.printify.me/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" className="bg-accent font-heading font-semibold text-ink hover:bg-accent/90 rounded-full">
                  Shop now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-ink">Featured</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURED_PRODUCTS.map((product) => (
              <div
                key={product.id}
                className="group rounded-xl border border-border bg-white p-5 transition-all hover:border-accent/30"
              >
                <div className="mb-4 flex h-40 items-center justify-center rounded-lg bg-paper">
                  <ShoppingBag className="h-10 w-10 text-muted-foreground" />
                </div>
                <p className="font-heading font-semibold text-ink">{product.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{product.description}</p>
                <p className="mt-2 font-heading text-lg font-bold text-accent">{product.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-ink">Full catalog on Printify</h2>
          <p className="mt-2 text-muted-foreground">
            Tees, hoodies, hats, accessories. Ships direct.
          </p>
          <div className="mt-6">
            <a
              href="https://baltimorekings.printify.me/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" className="bg-accent font-heading font-semibold text-ink hover:bg-accent/90 rounded-full">
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
