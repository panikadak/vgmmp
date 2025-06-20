"use client"

import { useState, useRef } from "react"
import { Compass } from "lucide-react"
import { SearchModal } from "./search-modal"
import { cn } from "@/lib/utils"

interface ExploreButtonProps {
  fullWidth?: boolean
  compact?: boolean
}

export default function ExploreButton({ fullWidth = false, compact = false }: ExploreButtonProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleOpenSearch = () => {
    setIsSearchOpen(true)
  }

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleOpenSearch}
        className={cn(
          "rounded-[16px] flex items-center gap-2 transition-colors focus:outline-none hover-glow",
          "bg-gray-100 text-gray-600 hover:bg-gray-200",
          compact ? "py-2.5 px-3 text-sm" : "py-3 px-4 text-base",
          fullWidth ? "w-full justify-center" : "",
        )}
      >
        <Compass className={`${compact ? "h-4 w-4" : "h-5 w-5"} text-gray-500`} />
        <span>Explore</span>
      </button>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} sourceRect={null} />
    </>
  )
}
