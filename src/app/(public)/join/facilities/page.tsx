import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Facilities | Baltimore Kings",
  description: "Benfield Sportscenter and GOALS Baltimore. Where the Kings train and compete.",
}

const venues = [
  {
    name: "Benfield Sportscenter",
    role: "Futsal home court & practice facility",
    address: "1031 Benfield Blvd, Millersville, MD 21108",
    mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3094.8!2d-76.6274!3d39.0712!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89b7fabc12345678%3A0xabcdef!2sBenfield+Sportscenter!5e0!3m2!1sen!2sus!4v1",
    features: [
      "Dedicated futsal court with proper surface",
      "Indoor climate-controlled facility",
      "Spectator seating",
      "Locker rooms available",
    ],
    parking: "Free parking lot on-site. Ample space for game days.",
  },
  {
    name: "GOALS Baltimore",
    role: "MASL3 home arena",
    address: "6159 Edmondson Ave, Catonsville, MD 21228",
    mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3094.8!2d-76.7274!3d39.2812!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89b7fabc12345678%3A0xfedcba!2sGOALS+Baltimore!5e0!3m2!1sen!2sus!4v1",
    features: [
      "Full-size arena soccer field with boards",
      "Professional lighting and sound",
      "Spectator capacity for game day atmosphere",
      "Food and beverage available",
    ],
    parking: "Street parking and nearby lot. Arrive early on game nights.",
  },
]

export default function FacilitiesPage() {
  return (
    <>
      <section className="bg-[#0a0a0a] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Facilities
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/60">
            Two venues. One for futsal, one for arena. Both purpose-built for the sport.
          </p>
        </div>
      </section>

      <section className="bg-[#0a0a0a] pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          {venues.map((venue) => (
            <div
              key={venue.name}
              className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden"
            >
              {/* Map */}
              <div className="aspect-video w-full bg-white/[0.02]">
                <iframe
                  src={venue.mapEmbed}
                  className="h-full w-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Map of ${venue.name}`}
                />
              </div>

              {/* Info */}
              <div className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
                  <h2 className="font-heading text-xl font-semibold text-white">{venue.name}</h2>
                  <span className="text-sm text-gold">{venue.role}</span>
                </div>
                <p className="mt-2 text-sm text-white/60">{venue.address}</p>

                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">Features</h3>
                    <ul className="space-y-2">
                      {venue.features.map((f) => (
                        <li key={f} className="text-sm text-white/60 flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gold flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">Parking</h3>
                    <p className="text-sm text-white/60">{venue.parking}</p>
                  </div>
                </div>

                {/* Photos placeholder */}
                <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                  <p className="text-sm text-white/40 italic">[Photos to be added]</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
