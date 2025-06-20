"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  Search,
  X,
  Gamepad,
  Zap,
  Car,
  Sword,
  Puzzle,
  Heart,
  Sparkles,
  Trophy,
  Target,
  Rocket,
  Crown,
  Shield,
  Wand2,
  Dice6,
  Music,
  Palette,
  Camera,
  Headphones,
  Mic,
  Video,
  Book,
  GraduationCap,
  Calculator,
  Globe,
  Compass,
  Map,
  Plane,
  Building,
  Home,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  BarChart,
  PieChart,
  Activity,
  Zap as Lightning,
  Sun,
  Moon,
  Star,
  Cloud,
  Snowflake,
  Droplets,
  Wind,
  Thermometer,
  Eye,
  EyeOff,
  Boxes,
} from "lucide-react"
import { useOnClickOutside } from "@/hooks/use-click-outside"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"
import { searchGames, getCategoryCounts } from "@/lib/supabase/games"
import { GAME_CATEGORIES } from "@/lib/constants"

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
  sourceRect: DOMRect | null
}

export function SearchModal({ isOpen, onClose, sourceRect }: SearchModalProps) {
  const [animationComplete, setAnimationComplete] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [closeButtonVisible, setCloseButtonVisible] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})
  const modalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const router = useRouter()

  // Load category counts when modal opens
  useEffect(() => {
    if (isOpen) {
      const loadCategoryCounts = async () => {
        try {
          const counts = await getCategoryCounts()
          console.log('Category counts received in modal:', counts)
          console.log('GAME_CATEGORIES names:', GAME_CATEGORIES.map(c => c.name))
          setCategoryCounts(counts)
        } catch (error) {
          console.error('Error loading category counts:', error)
        }
      }
      loadCategoryCounts()
    }
  }, [isOpen])

  // Search games when search value changes
  useEffect(() => {
    const searchGamesAsync = async () => {
      if (!searchValue.trim()) {
        setSearchResults([])
        return
      }

      setIsSearching(true)
      try {
        const results = await searchGames(searchValue)
        setSearchResults(results)
      } catch (error) {
        console.error('Search error:', error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }

    const debounceTimer = setTimeout(searchGamesAsync, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchValue])

  // Filter categories based on search
  const filteredCategories = GAME_CATEGORIES.filter((category) =>
    category.name.toLowerCase().includes(searchValue.toLowerCase()),
  )

  // Handle modal opening and closing with proper animation sequence
  useEffect(() => {
    if (isOpen) {
      // First make the backdrop visible but transparent
      setIsVisible(true)

      // Use RAF to ensure the initial state is rendered before starting animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Then start the animation
          setAnimationComplete(true)

          // Show close button slightly before other elements
          setTimeout(() => {
            setCloseButtonVisible(true)
          }, 50)

          // Focus the input after animation completes
          setTimeout(() => {
            inputRef.current?.focus()
          }, 300)
        })
      })
    } else {
      // First animate out
      setAnimationComplete(false)
      setCloseButtonVisible(false)

      // Then hide after animation completes
      const timer = setTimeout(() => {
        setIsVisible(false)
        setSearchValue("")
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Close modal when clicking outside
  useOnClickOutside(modalRef as React.RefObject<HTMLDivElement>, (e) => {
    if (animationComplete) {
      onClose()
    }
  })

  // Close modal on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEsc)
    }

    return () => {
      document.removeEventListener("keydown", handleEsc)
    }
  }, [isOpen, onClose])

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  // Handle search form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchValue.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchValue.trim())}`)
      onClose()
    }
  }

  if (!isVisible) return null

  // Calculate initial styles for animation from top middle
  const getInitialStyles = () => {
    const viewportHeight = window.innerHeight

    return {
      transform: `translateY(-${viewportHeight / 2 + 300}px)`,
      opacity: 0,
    }
  }

  // Update the modal backdrop
  const backdropClass = "backdrop-blur-md bg-gray-400/80"

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center pt-16 transition-all duration-300 ease-out will-change-[backdrop-filter,background-color] overflow-auto",
        animationComplete ? backdropClass : "backdrop-blur-none bg-transparent",
      )}
      style={{ willChange: "backdrop-filter, background-color" }}
      onClick={onClose} // Close when clicking the backdrop
    >
      {/* Close button positioned above the modal */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        className={cn(
          "absolute top-4 right-4 z-[60] rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-gray-300",
          "bg-white text-gray-800",
        )}
        aria-label="Close"
        style={{
          opacity: closeButtonVisible ? 1 : 0,
          transform: closeButtonVisible ? "scale(1)" : "scale(0.8)",
          transition: "opacity 300ms ease, transform 300ms cubic-bezier(0.16, 1, 0.3, 1)",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)", // RainbowKit dialog shadow
        }}
      >
        <X className="h-5 w-5" />
      </button>

      {/* Update the modal container */}
      <div
        ref={modalRef}
        className={cn(
          "rounded-2xl overflow-hidden will-change-transform",
          "bg-white",
          isMobile ? "w-[calc(100%-32px)] max-w-[400px]" : "w-full max-w-3xl", // Match game modal width on mobile
        )}
        style={{
          transition: "transform 400ms cubic-bezier(0.16, 1, 0.3, 1), opacity 300ms cubic-bezier(0.16, 1, 0.3, 1)",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)", // RainbowKit dialog shadow
          ...(animationComplete ? { transform: "translateY(0)", opacity: 1 } : getInitialStyles()),
        }}
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside the modal from closing it
      >
        <div className="p-4">
          {/* Search form */}
          <form ref={formRef} onSubmit={handleSubmit}>
            <div className="flex items-center px-4 py-3 rounded-[16px] bg-gray-100">
              <Search className="h-5 w-5 flex-shrink-0 mr-2 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search games, categories, and more..."
                className="flex-1 bg-transparent border-none outline-none text-base text-gray-800 placeholder:text-gray-500"
                autoComplete="off"
              />
              <button
                type="submit"
                className={cn(
                  "ml-2 px-3 py-1 rounded-md text-sm font-medium transition-colors",
                  searchValue.trim()
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed",
                )}
                disabled={!searchValue.trim()}
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Search content area */}
        <div className="max-h-[70vh] overflow-y-auto p-4">
          {searchValue && searchResults.length === 0 && filteredCategories.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <p>No results found for "{searchValue}"</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Game results */}
              {searchValue && searchResults.length > 0 && (
                <div>
                  <h3 className="heading-4 mb-4">Games ({searchResults.length})</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {searchResults.slice(0, 5).map((game, index) => (
                      <Link
                        key={index}
                        href={`/${game.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-3 p-3 rounded-[16px] bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        <div className="relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden">
                          <Image
                            src={game.images?.[0] || "/placeholder.svg"}
                            alt={game.title || "Game"}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="heading-5 truncate">{game.title}</h4>
                          <p className="text-sm text-gray-500 truncate">{game.source}</p>
                        </div>
                      </Link>
                    ))}
                    {searchResults.length > 5 && (
                      <Link
                        href={`/search?q=${encodeURIComponent(searchValue)}`}
                        onClick={onClose}
                        className="text-center text-blue-500 hover:text-blue-600 py-2"
                      >
                        View all {searchResults.length} games
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* Category results */}
              {filteredCategories.length > 0 && (
                <div>
                  <h3 className="heading-4 mb-4">Game Categories</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {filteredCategories.map((category) => (
                      <Link
                        key={category.name}
                        href={`/category/${category.slug}`}
                        onClick={onClose}
                        className="rounded-[16px] p-4 text-left flex items-center gap-3 transition-colors bg-gray-100 hover:bg-gray-200"
                      >
                        <div className="p-2 rounded-full shadow-sm bg-white">
                          <category.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-medium block truncate">{category.name}</span>
                          <span className="text-sm text-gray-500">
                            {(() => {
                              // Try exact match first
                              let count = categoryCounts[category.name] || 0
                              
                              // If no exact match, try case-insensitive
                              if (count === 0) {
                                const exactKey = Object.keys(categoryCounts).find(
                                  key => key.toLowerCase() === category.name.toLowerCase()
                                )
                                if (exactKey) {
                                  count = categoryCounts[exactKey]
                                }
                              }
                              
                              // If still no match, try matching by slug (convert spaces to hyphens)
                              if (count === 0) {
                                const slugKey = Object.keys(categoryCounts).find(
                                  key => key.toLowerCase().replace(/\s+/g, '-') === category.slug
                                )
                                if (slugKey) {
                                  count = categoryCounts[slugKey]
                                }
                              }
                              
                              return count
                            })()} games
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
