import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import "@rainbow-me/rainbowkit/styles.css"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Providers } from "@/components/providers"
import { WalletErrorHandler } from "@/components/ui/wallet-error-handler"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Bario Entertainment System",
  description: "Discover and play games on the Bario Entertainment System",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Header />
          <main className="min-h-screen transition-all duration-300 ease-in-out">
            {children}
          </main>
          <Footer />
          <WalletErrorHandler />
        </Providers>
      </body>
    </html>
  )
}
