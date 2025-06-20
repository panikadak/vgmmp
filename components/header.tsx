"use client"

import Link from "next/link"
import Image from "next/image"
import ExploreButton from "@/components/explore-button"
import { CustomConnectButton } from "@/components/connect-button"

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-100 py-4">
      <div className="mx-auto px-4 max-w-[1600px]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="w-full flex flex-col items-center md:hidden">
            <Link href="/" className="w-full max-w-[300px] flex items-center justify-center gap-3 mb-5 hover:opacity-80 transition-opacity">
              <div
                className="h-12 w-12 rounded-[16px] bg-white border border-gray-100 shadow-sm overflow-hidden"
                style={{
                  backgroundImage: "url('/bario-pixel-character.png')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
                aria-label="Bario character logo"
              />
              <div className="h-10 relative w-64" style={{ marginTop: "4px" }}>
                <Image
                  src="/bario-logo.png"
                  alt="Bario Entertainment System"
                  fill
                  className="object-contain object-left"
                  priority
                />
              </div>
            </Link>
            <div className="w-full max-w-[360px] flex flex-row items-center justify-center gap-2">
              <div className="w-[120px] flex-shrink-0">
                <ExploreButton fullWidth compact />
              </div>
              <div className="w-[140px] flex-shrink-0">
                <CustomConnectButton variant="primary" fullWidth compact />
              </div>
            </div>
          </div>

          <Link href="/" className="hidden md:flex md:items-center md:justify-start gap-3 hover:opacity-80 transition-opacity">
            <div
              className="h-14 w-14 rounded-[16px] bg-white border border-gray-100 shadow-sm overflow-hidden"
              style={{
                backgroundImage: "url('/bario-pixel-character.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
              aria-label="Bario character logo"
            />
            <div className="h-12 relative w-72" style={{ marginTop: "4px" }}>
              <Image
                src="/bario-logo.png"
                alt="Bario Entertainment System"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>

          <div className="hidden md:flex md:items-center gap-4">
            <ExploreButton />
            <CustomConnectButton variant="primary" />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header 