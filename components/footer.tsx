"use client"

import Link from "next/link"
import Image from "next/image"
import { Github, MessageCircle, ExternalLink } from "lucide-react"

const Footer = () => {
  return (
    <footer className={`bg-white mt-16`}>
      <div className="mx-auto px-4 py-16 max-w-[1600px]">
        
        {/* Top section with logo and tagline */}
        <div className="text-center mb-16">
          <div className="flex flex-col items-center justify-center gap-4 mb-6">
            <div
              className="h-16 w-16 rounded-[20px] bg-white border border-gray-100 shadow-sm overflow-hidden"
              style={{
                backgroundImage: "url('/bario-pixel-character.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
              aria-label="Bario character logo"
            />
            <div className="h-12 relative w-80">
              <Image 
                src="/bario-logo.png" 
                alt="Bario Entertainment System" 
                fill
                className="object-contain"
              />
            </div>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Crafted with boundless dreams and a love for games. A testament to those who play, 
            create, and imagine. It's always day 1, because the future belongs to the 
            passionate.
          </p>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          
          {/* Community section */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Community</h3>
            <div className="space-y-4">
              <Link 
                href="https://t.me/barioportal" 
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 p-4 rounded-[16px] bg-gray-50 border border-gray-100 hover:border-gray-200 hover:bg-gray-100 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-[12px] bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="text-gray-900 font-medium">Telegram</div>
                  <div className="text-gray-500 text-sm">Join our community</div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </Link>

              <Link 
                href="https://x.com/basebario" 
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 p-4 rounded-[16px] bg-gray-50 border border-gray-100 hover:border-gray-200 hover:bg-gray-100 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-[12px] bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="text-gray-900 font-medium">Twitter</div>
                  <div className="text-gray-500 text-sm">Follow updates</div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </Link>
            </div>
          </div>

          {/* Development section */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Development</h3>
            <div className="space-y-4">
              <Link 
                href="https://github.com/barioentertainmentsystem" 
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 p-4 rounded-[16px] bg-gray-50 border border-gray-100 hover:border-gray-200 hover:bg-gray-100 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-[12px] bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <Github className="w-5 h-5 text-gray-700" />
                </div>
                <div className="flex-1">
                  <div className="text-gray-900 font-medium">GitHub</div>
                  <div className="text-gray-500 text-sm">Open source code</div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </Link>

              <Link 
                href="https://paragraph.xyz/@baes" 
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 p-4 rounded-[16px] bg-gray-50 border border-gray-100 hover:border-gray-200 hover:bg-gray-100 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-[12px] bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <div className="w-5 h-5 rounded bg-gradient-to-br from-orange-400 to-pink-500"></div>
                </div>
                <div className="flex-1">
                  <div className="text-gray-900 font-medium">Blog</div>
                  <div className="text-gray-500 text-sm">Latest updates</div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </Link>
            </div>
          </div>

          {/* Trading platforms section */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Trading</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link 
                href="https://www.coingecko.com/en/coins/based-bario" 
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 p-4 rounded-[16px] bg-gray-50 border border-gray-100 hover:border-gray-200 hover:bg-gray-100 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-[12px] bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                  <Image 
                    src="/coingecko.avif" 
                    alt="CoinGecko" 
                    width={20} 
                    height={20} 
                    className="w-5 h-5 rounded-full"
                  />
                </div>
                <div className="flex-1">
                  <div className="text-gray-900 font-medium">CoinGecko</div>
                  <div className="text-gray-500 text-sm">Price tracking</div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </Link>

              <Link 
                href="https://dexscreener.com/base/0x19efcd30370cd4858df84415d9b63eda2048ef27" 
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 p-4 rounded-[16px] bg-gray-50 border border-gray-100 hover:border-gray-200 hover:bg-gray-100 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-[12px] bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <Image 
                    src="/dexscreener.avif" 
                    alt="DexScreener" 
                    width={20} 
                    height={20} 
                    className="w-5 h-5 rounded-full"
                  />
                </div>
                <div className="flex-1">
                  <div className="text-gray-900 font-medium">DexScreener</div>
                  <div className="text-gray-500 text-sm">DEX analytics</div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </Link>

              <Link 
                href="https://coinmarketcap.com/dexscan/base/0x19efcd30370cd4858df84415d9b63eda2048ef27/" 
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 p-4 rounded-[16px] bg-gray-50 border border-gray-100 hover:border-gray-200 hover:bg-gray-100 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-[12px] bg-yellow-50 flex items-center justify-center group-hover:bg-yellow-100 transition-colors">
                  <Image 
                    src="/cmc.avif" 
                    alt="CoinMarketCap" 
                    width={20} 
                    height={20} 
                    className="w-5 h-5 rounded-full"
                  />
                </div>
                <div className="flex-1">
                  <div className="text-gray-900 font-medium">CMC</div>
                  <div className="text-gray-500 text-sm">Market data</div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </Link>

              <Link 
                href="https://www.dextools.io/app/en/token/bario?t=1728859614315" 
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 p-4 rounded-[16px] bg-gray-50 border border-gray-100 hover:border-gray-200 hover:bg-gray-100 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-[12px] bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                  <Image 
                    src="/dextools.avif" 
                    alt="DexTools" 
                    width={20} 
                    height={20} 
                    className="w-5 h-5 rounded-full"
                  />
                </div>
                <div className="flex-1">
                  <div className="text-gray-900 font-medium">DexTools</div>
                  <div className="text-gray-500 text-sm">Trading tools</div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-blue-200 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Contact info */}
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">hello@baes.so</span>
            </div>

            {/* Copyright */}
            <div className="flex items-center gap-4">
              <span className="text-gray-500 text-sm">All rights reserved to the players</span>
              <Link 
                href="https://app.copyrighted.com/website/gXXYjEvLhYSGpPC5" 
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                <Image 
                  src="/copyright.png" 
                  alt="Copyrighted.com Certificate" 
                  width={60} 
                  height={40} 
                  className="object-contain"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer 