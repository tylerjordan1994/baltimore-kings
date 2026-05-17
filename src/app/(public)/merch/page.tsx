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
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0a0a0a] to-[#141414] py-20 sm:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(201,169,78,0.08)_0%,_transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Rep the Kings
            </h1>
            <p className="mt-4 text-lg text-white/70">
              Official gear. Limited drops. All proceeds fund player development and travel.
            </p>
            <div className="mt-8">
              <a
                href="https://baltimorekings.printify.me/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" className="bg-gold font-heading font-semibold text-black hover:bg-gold/90">
                  Shop now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-[#0a0a0a] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-white">Featured</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURED_PRODUCTS.map((product) => (
              <div
                key={product.id}
                className="group rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all hover:border-gold/30"
              >
                <div className="mb-4 flex h-40 items-center justify-center rounded-lg bg-white/5">
                  <ShoppingBag className="h-10 w-10 text-white/20" />
                </div>
                <p className="font-heading font-semibold text-white">{product.name}</p>
                <p className="mt-1 text-sm text-white/60">{product.description}</p>
                <p className="mt-2 font-heading text-lg font-bold text-gold">{product.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/10 bg-[#111111] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-white">Full catalog on Printify</h2>
          <p className="mt-2 text-white/60">
            Tees, hoodies, hats, accessories. Ships direct.
          </p>
          <div className="mt-6">
            <a
              href="https://baltimorekings.printify.me/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" className="bg-gold font-heading font-semibold text-black hover:bg-gold/90">
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
