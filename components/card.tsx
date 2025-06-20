"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { ImageModal } from "./image-modal"
import { incrementGamePlays } from "@/lib/supabase/games"

interface CardProps {
  id: string
  images: string[]
  title?: string
  subtitle?: string
  description?: string
  source?: string
  className?: string
  slug?: string
  directNavigation?: boolean
  contract_address?: string
  opensea_url?: string
}

export function Card({ id, images, title, subtitle, description, source, className, slug, directNavigation = false, contract_address, opensea_url }: CardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [sourceRect, setSourceRect] = useState<DOMRect | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Card click now goes directly to game detail page
  const handleCardClick = async () => {
    if (slug) {
      router.push(`/${slug}`)
    }
  }

  // Quick Look button opens preview modal
  const handleQuickLookClick = async (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click
    
    if (slug && cardRef.current) {
      // Get the current position and size of the card for animation
      setSourceRect(cardRef.current.getBoundingClientRect())
      setIsModalOpen(true)

      // Change URL to preview route without page refresh
      window.history.pushState({}, "", `/preview/${slug}`)

      // Increment plays count
      try {
        await incrementGamePlays(id)
      } catch (error) {
        console.error('Error incrementing plays:', error)
      }
    }
  }

  // Close modal and restore URL
  const handleCloseModal = () => {
    setIsModalOpen(false)
    
    // Go back to previous URL (usually homepage)
    window.history.back()
  }

  // Use the first image as the main preview
  const mainImage = images && images.length > 0 ? images[0] : "/placeholder.svg"

  return (
    <>
      <div
        id={id}
        ref={cardRef}
        className={cn(
          "group relative overflow-hidden rounded-2xl bg-card-custom p-6px cursor-pointer transition-colors duration-300 hover-glow",
          className,
        )}
        onClick={handleCardClick}
      >
        <div className="relative aspect-auto overflow-hidden rounded-2xl">
          <Image
            src={mainImage || "/placeholder.svg"}
            alt={title || "Card image"}
            width={300}
            height={200}
            className="h-auto w-full object-cover rounded-2xl shadow-card"
          />

          {/* Quick Look button */}
          <div 
            className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/70 cursor-pointer"
            onClick={handleQuickLookClick}
          >
            Quick Look
          </div>

          {subtitle && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
              <div className="text-white font-bold tracking-wider text-xl">{subtitle}</div>
              {description && <div className="text-white text-sm">{description}</div>}
            </div>
          )}
        </div>

        {title && (
          <div className="pt-3 pb-2 px-2">
            <h3 className="card-title">{title}</h3>
            {source && <p className="text-xs text-gray-500 mt-0.5">{source}</p>}
          </div>
        )}
      </div>

      <ImageModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        images={images}
        title={title}
        source={source}
        subtitle={subtitle}
        description={description}
        sourceRect={sourceRect}
        id={id}
        slug={slug}
        contract_address={contract_address}
        opensea_url={opensea_url}
      />
    </>
  )
}
