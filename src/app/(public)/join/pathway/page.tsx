import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "The Pathway | Baltimore Kings",
  description: "Two ladders from development to professional indoor soccer. Futsal and arena, connected by the same club.",
}

export default function PathwayPage() {
  return (
    <>
      <section className="bg-paper py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            The Pathway
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Two ladders. One system. Development to professional, in both futsal and arena soccer.
          </p>
        </div>
      </section>

      <section className="bg-paper pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Futsal Ladder */}
            <div>
              <h2 className="mb-8 text-xs font-semibold uppercase tracking-wider text-brand">
                Futsal Ladder
              </h2>
              <div className="relative space-y-4 pl-6">
                {/* Vertical line */}
                <div className="absolute left-[11px] top-4 bottom-4 w-px bg-border" />

                <PathwayStep
                  label="Futsal Kings 2"
                  description="Development team. Build your game in competitive matches."
                  active
                />
                <PathwayStep
                  label="Futsal Kings 1 (L1F)"
                  description="League 1 Futsal. The top division of US futsal."
                  active
                />
                <PathwayStep
                  label="National / Pro Futsal"
                  description="National team call-ups and professional opportunities abroad."
                  active={false}
                />
              </div>
            </div>

            {/* Arena Ladder */}
            <div>
              <h2 className="mb-8 text-xs font-semibold uppercase tracking-wider text-brand">
                Arena Ladder
              </h2>
              <div className="relative space-y-4 pl-6">
                <div className="absolute left-[11px] top-4 bottom-4 w-px bg-border" />

                <PathwayStep
                  label="Kings MASL3"
                  description="Third division of the Major Arena Soccer League."
                  active
                />
                <PathwayStep
                  label="Salisbury Steaks (MASL2)"
                  description="Second division. Kings players who earn it move up."
                  active={false}
                />
                <PathwayStep
                  label="Baltimore Blast (MASL1)"
                  description="The top. First division professional arena soccer."
                  active={false}
                />
              </div>
            </div>
          </div>

          {/* Alumni proof points placeholder */}
          <div className="mt-16 rounded-xl border border-border bg-white p-8">
            <p className="text-sm text-muted-foreground italic">
              [NEEDS CONTENT] - Alumni proof points to be added
            </p>
          </div>
        </div>
      </section>
    </>
  )
}

function PathwayStep({
  label,
  description,
  active,
}: {
  label: string
  description: string
  active: boolean
}) {
  return (
    <div className="relative flex items-start gap-4">
      {/* Dot */}
      <div
        className={`absolute -left-6 top-1.5 h-3 w-3 rounded-full border-2 ${
          active
            ? "border-accent bg-accent/20"
            : "border-muted-foreground/30 bg-paper"
        }`}
      />
      <div className="min-w-0">
        <p className={`text-base font-semibold ${active ? "text-accent" : "text-muted-foreground"}`}>
          {label}
        </p>
        <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
