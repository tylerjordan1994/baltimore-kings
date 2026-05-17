import type { Metadata } from "next"
import { Space_Grotesk, Inter } from "next/font/google"
import "./globals.css"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "Baltimore Kings | Pro Indoor Soccer & Futsal",
    template: "%s | Baltimore Kings",
  },
  description: "MASL3 arena soccer and League 1 Futsal in Baltimore. Apply for tryouts, view schedules, and follow the Kings.",
  metadataBase: new URL("https://tylerjordandesigns.com/project/football-team"),
  openGraph: {
    title: "Baltimore Kings",
    description: "Pro indoor soccer and futsal, played seriously, in Baltimore.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Baltimore Kings",
    description: "Pro indoor soccer and futsal, played seriously, in Baltimore.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
