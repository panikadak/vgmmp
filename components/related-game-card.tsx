"use client"

import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface RelatedGameCardProps {
  id: string
  images: string[]
  title?: string
  source?: string
  slug?: string
  className?: string
  useGrayBackground?: boolean
}

export function RelatedGameCard({ id, images, title, source, slug, className, useGrayBackground = false }: RelatedGameCardProps) {
  // Use the first image as the main preview
  const mainImage = images && images.length > 0 ? images[0] : "/placeholder.svg"

  return (
    <Link href={`/${slug}`} className="block">
      <div
        id={id}
        className={cn(
          "group relative overflow-hidden rounded-2xl p-6px cursor-pointer transition-colors duration-300 hover-glow",
          useGrayBackground ? "bg-gray-100" : "bg-card-custom",
          className,
        )}
      >
        <div className="relative aspect-auto overflow-hidden rounded-2xl">
          <Image
            src={mainImage || "/placeholder.svg"}
            alt={title || "Card image"}
            width={300}
            height={200}
            className="h-auto w-full object-cover rounded-2xl shadow-card"
          />

          {/* Full page indicator */}
          <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Quick Look
          </div>
        </div>

        {title && (
          <div className="pt-3 pb-2 px-2">
            <h3 className="card-title">{title}</h3>
            {source && <p className="text-xs text-gray-500 mt-0.5">{source}</p>}
          </div>
        )}
      </div>
    </Link>
  )
} 