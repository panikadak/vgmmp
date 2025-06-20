import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Home } from "lucide-react"
import { Button } from "@/components/ui/button-custom"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header with back navigation */}
      <header className="border-b border-gray-100 py-4">
        <div className="mx-auto px-4 max-w-[1600px]">
          <div className="flex items-center justify-between">
            <Link 
              href="/" 
              className="flex items-center gap-3 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm font-medium">Back to Games</span>
            </Link>
            
            {/* Logo on the right for context */}
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-[12px] bg-white border border-gray-100 shadow-sm overflow-hidden"
                style={{
                  backgroundImage: "url('/bario-pixel-character.png')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
                aria-label="Bario character logo"
              />
              <div className="h-8 relative w-48 hidden sm:block">
                <Image
                  src="/bario-logo.png"
                  alt="Bario Entertainment System"
                  fill
                  className="object-contain object-left"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto px-4 py-16 max-w-[800px] text-center">
        <div className="space-y-6">
          {/* Error Icon */}
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
            <svg 
              className="w-12 h-12 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>

          {/* Error Message */}
          <div className="space-y-3">
            <h1 className="heading-1">Game Not Found</h1>
            <p className="text-gray-600 text-lg">
              Sorry, we couldn't find the game you're looking for. It may have been removed or the link is incorrect.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
            <Link href="/">
              <Button className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Browse All Games
              </Button>
            </Link>
            <Link href="/search">
              <Button variant="secondary" className="flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search Games
              </Button>
            </Link>
          </div>

          {/* Suggestion */}
          <div className="mt-12 p-6 bg-gray-50 rounded-2xl">
            <h3 className="heading-5 mb-2">Looking for something specific?</h3>
            <p className="text-gray-600 text-sm">
              Try browsing our game categories or use the search feature to find games by title, genre, or developer.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
} 