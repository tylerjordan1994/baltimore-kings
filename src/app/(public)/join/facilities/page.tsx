import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Facilities | Baltimore Kings",
  description: "The Court (USA Futsal Federation national training center), Benfield Sportscenter, and GOALS Baltimore. Where the Kings train and compete.",
}

const venues = [
  {
    name: "The Court",
    role: "National training center — USA Futsal Federation (opening June 15)",
    address: "Forest Hill, MD — beside The Soccer Factory, 98 Industry Ln, Forest Hill, MD 21050",
    photo: "/project/football-team/photos/venue-the-court.jpg",
    features: [
      "Opening June 15, affiliated with The Soccer Factory in Maryland",
      "National training center of the USA Futsal Federation",
      "Home base for the U.S. Men's international futsal team",
    ],
    parking: "On-site parking at the Industry Lane complex.",
  },
  {
    name: "Benfield Sportscenter",
    role: "Futsal home court & practice facility",
    address: "1031 Benfield Blvd, Millersville, MD 21108",
    photo: "/project/football-team/photos/venue-benfield.webp",
    features: [
      "Dedicated futsal court with proper surface",
      "Indoor climate-controlled facility",
      "Spectator seating & locker rooms",
    ],
    parking: "Free on-site parking lot.",
  },
  {
    name: "GOALS Baltimore",
    role: "MASL3 home arena",
    address: "6159 Edmondson Ave, Catonsville, MD 21228",
    photo: "/project/football-team/photos/venue-goals-baltimore.webp",
    features: [
      "Full-size arena soccer field with boards",
      "Professional lighting and sound",
      "Food and beverage available",
    ],
    parking: "Street parking and nearby lot.",
  },
]

export default function FacilitiesPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-court py-28 sm:py-36">
        <img
          src="/project/football-team/photos/court-aerial-1.jpg"
          alt="Aerial view of the court"
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Facilities
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/80">
            Three venues — including The Court, the USA Futsal Federation&apos;s national training
            center, opening June 15 beside The Soccer Factory in Forest Hill.
          </p>
        </div>
      </section>

      <section className="bg-paper pb-24 pt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {venues.map((venue) => (
              <div
                key={venue.name}
                className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-colors hover:border-accent/30"
              >
                {/* Photo */}
                <img
                  src={venue.photo}
                  alt={venue.name}
                  className="aspect-video w-full object-cover"
                />

                {/* Info */}
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="font-heading text-lg font-semibold text-ink">{venue.name}</h2>
                  <p className="mt-1 text-sm text-accent">{venue.role}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{venue.address}</p>

                  <ul className="mt-4 space-y-1.5">
                    {venue.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <p className="mt-3 text-xs text-muted-foreground">{venue.parking}</p>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-medium text-accent hover:underline"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    View on map
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}