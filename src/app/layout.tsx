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
    default: "Baltimore Kings | Futsal & Arena Soccer",
    template: "%s | Baltimore Kings",
  },
  description: "League 1 Futsal and MASL3 arena soccer in Baltimore. Apply for tryouts, view schedules, and follow the Kings.",
  metadataBase: new URL("https://tylerjordandesigns.com/project/football-team"),
  openGraph: {
    title: "Baltimore Kings",
    description: "Futsal and arena soccer, played seriously, in Baltimore.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Baltimore Kings",
    description: "Futsal and arena soccer, played seriously, in Baltimore.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`} style={{ colorScheme: "dark" }}>
      <body className="min-h-screen bg-[#0a0a0a] text-white antialiased">
        {children}
      </body>
    </html>
  )
}
