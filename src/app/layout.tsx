import type { Metadata } from "next"
import { Archivo_Black, Plus_Jakarta_Sans, DM_Serif_Display, Great_Vibes } from "next/font/google"
import "./globals.css"
import { Preloader } from "@/components/preloader"

const archivoBlack = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

// Hero lockup: thick display serif for "Baltimore", elegant script for "Kings".
const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
})

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-script",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "Baltimore Kings | Futsal & Arena Soccer",
    template: "%s | Baltimore Kings",
  },
  description: "League 1 Futsal and MASL3 arena soccer in Baltimore. Apply for tryouts, view schedules, and follow the Kings.",
  metadataBase: new URL("https://tylerjordandesigns.com/project/football-team"),
  openGraph: {
    title: "Baltimore Kings",
    description: "Baltimore's futsal club. League 1 Futsal, MASL3 arena soccer, and a pathway up.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Baltimore Kings",
    description: "Baltimore's futsal club. League 1 Futsal, MASL3 arena soccer, and a pathway up.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${archivoBlack.variable} ${dmSerif.variable} ${greatVibes.variable}`}>
      <body className="min-h-screen bg-paper text-ink antialiased">
        <Preloader />
        {children}
      </body>
    </html>
  )
}
