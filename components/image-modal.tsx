"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { X, Coins, Gamepad, Copy, ChevronLeft, ChevronRight } from "lucide-react"
import { useOnClickOutside } from "@/hooks/use-click-outside"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"
import { SupplyProgress } from "./supply-progress"

interface ImageModalProps {
  isOpen: boolean
  onClose: () => void
  images: string[]
  title?: string
  source?: string
  subtitle?: string
  description?: string
  sourceRect?: DOMRect | null
  id: string // Added id for permalink
  slug?: string // Add slug property
  contract_address?: string
  opensea_url?: string
}

export function ImageModal({
  isOpen,
  onClose,
  images,
  title,
  source,
  subtitle,
  description,
  sourceRect,
  id,
  slug,
  contract_address,
  opensea_url,
}: ImageModalProps) {
  const [animationComplete, setAnimationComplete] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [menuItemsVisible, setMenuItemsVisible] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [thumbnailsVisible, setThumbnailsVisible] = useState(false)
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0)
  const modalRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const router = useRouter()

  // Constants for thumbnail carousel
  const THUMBNAILS_PER_VIEW = isMobile ? 3 : 5
  const hasMultipleImages = images && images.length > 1
  const showThumbnailNavigation = images && images.length > THUMBNAILS_PER_VIEW

  // Reset current image index and image loaded state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(0)
      setImageLoaded(false)
      setImageAspectRatio(null)
      setThumbnailStartIndex(0)
    }
  }, [isOpen])

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

          // Delay menu items animation to start after the main popup animation
          setTimeout(() => {
            setMenuItemsVisible(true)
          }, 200)

          // Show thumbnails after a slight delay
          setTimeout(() => {
            setThumbnailsVisible(true)
          }, 300)
        })
      })
    } else {
      // First animate out
      setAnimationComplete(false)
      setMenuItemsVisible(false)
      setThumbnailsVisible(false)

      // Then hide after animation completes
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Close modal when clicking outside
  useOnClickOutside(containerRef as React.RefObject<HTMLElement>, () => {
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

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || !images || images.length <= 1) return

      if (e.key === "ArrowLeft") {
        goToPreviousImage()
      } else if (e.key === "ArrowRight") {
        goToNextImage()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown)
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, currentImageIndex, images])

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

  // Function to copy URL to clipboard
  const copyUrl = () => {
    // Just copy the current page URL
    navigator.clipboard.writeText(window.location.href)
    // Could add a toast notification here
  }

  // Navigation functions
  const goToNextImage = () => {
    if (!images || images.length <= 1) return
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
    setImageLoaded(false)
    setImageAspectRatio(null)
  }

  const goToPreviousImage = () => {
    if (!images || images.length <= 1) return
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
    setImageLoaded(false)
    setImageAspectRatio(null)
  }

  const goToImage = (index: number) => {
    if (!images || index < 0 || index >= images.length) return
    setCurrentImageIndex(index)
    setImageLoaded(false)
    setImageAspectRatio(null)
    
    // Auto-scroll thumbnails to keep current image visible
    if (showThumbnailNavigation) {
      if (index < thumbnailStartIndex) {
        setThumbnailStartIndex(index)
      } else if (index >= thumbnailStartIndex + THUMBNAILS_PER_VIEW) {
        setThumbnailStartIndex(index - THUMBNAILS_PER_VIEW + 1)
      }
    }
  }

  // Thumbnail navigation functions
  const goToPreviousThumbnails = () => {
    setThumbnailStartIndex(Math.max(0, thumbnailStartIndex - THUMBNAILS_PER_VIEW))
  }

  const goToNextThumbnails = () => {
    if (!images) return
    setThumbnailStartIndex(Math.min(images.length - THUMBNAILS_PER_VIEW, thumbnailStartIndex + THUMBNAILS_PER_VIEW))
  }

  // Get visible thumbnails
  const getVisibleThumbnails = () => {
    if (!images) return []
    if (!showThumbnailNavigation) return images
    return images.slice(thumbnailStartIndex, thumbnailStartIndex + THUMBNAILS_PER_VIEW)
  }

  // Handle image load to check if it's square
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    const ratio = img.naturalWidth / img.naturalHeight
    setImageAspectRatio(ratio)
    setImageLoaded(true)
  }

  // Check if image is approximately square (within 10% tolerance)
  const isImageSquare = () => {
    if (!imageAspectRatio) return true // Default to square if we don't know yet
    return imageAspectRatio >= 0.9 && imageAspectRatio <= 1.1
  }

  if (!isVisible) return null

  // Calculate initial styles based on source element position
  const getInitialStyles = () => {
    if (!sourceRect) return {}

    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    const scaleX = sourceRect.width / Math.min(viewportWidth * 0.9, 1200)
    const scaleY = sourceRect.height / Math.min(viewportHeight * 0.9, 800)
    const scale = Math.max(scaleX, scaleY)

    const centerX = viewportWidth / 2
    const centerY = viewportHeight / 2
    const sourceX = sourceRect.left + sourceRect.width / 2
    const sourceY = sourceRect.top + sourceRect.height / 2

    const translateX = (sourceX - centerX) / scale
    const translateY = (sourceY - centerY) / scale

    return {
      transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
      opacity: 0,
    }
  }

  // Get menu container animation styles based on device
  const getMenuContainerStyles = (delayMs = 100) => {
    if (!animationComplete) {
      return {
        opacity: 0,
        transform: isMobile ? "translateY(100%)" : "translateX(50px)",
      }
    }

    return {
      opacity: 1,
      transform: "translate(0)",
      transitionProperty: "opacity, transform",
      transitionDuration: "300ms, 400ms",
      transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1), cubic-bezier(0.16, 1, 0.3, 1)",
      transitionDelay: `${delayMs}ms`,
    }
  }

  // Menu items with conditional logic based on available data
  const menuItems = [
    {
      label: "Mint Game",
      icon: <Coins className="h-5 w-5 text-gray-800" />,
      onClick: () => window.open("#mint", "_blank"),
    },
    {
      label: "Play Game",
      icon: <Gamepad className="h-5 w-5 text-gray-800" />,
      onClick: () => window.open("#play", "_blank"),
    },
    // Only show OpenSea button if opensea_url is available
    ...(opensea_url ? [{
      label: "OpenSea",
      icon: (
        <div className="relative h-5 w-5 flex items-center justify-center">
          <svg
            width="20"
            height="20"
            viewBox="0 0 360 360"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-gray-800"
          >
            <path
              d="M181.566 1.00604e-05C80.91 -0.82799 -0.82799 80.91 1.00604e-05 181.566C0.84601 279.306 80.694 359.172 178.416 359.982C279.072 360.846 360.846 279.072 359.982 178.416C359.172 80.712 279.306 0.84601 181.566 1.00604e-05ZM127.746 89.586C139.266 104.22 146.16 122.742 146.16 142.83C146.16 160.236 140.994 176.436 132.12 189.954H69.714L127.728 89.568L127.746 89.586ZM318.006 199.242V212.202C318.006 213.048 317.556 213.768 316.782 214.092C312.552 215.892 298.602 222.372 292.788 230.436C277.812 251.28 266.382 284.04 240.822 284.04H134.172C96.408 284.04 64.818 254.07 64.836 214.146C64.836 213.156 65.682 212.346 66.672 212.346H117.216C118.962 212.346 120.33 213.75 120.33 215.46V225.216C120.33 230.4 124.524 234.612 129.726 234.612H168.066V212.292H141.876C156.942 193.212 165.906 169.128 165.906 142.902C165.906 113.652 154.692 86.976 136.332 67.032C147.438 68.328 158.058 70.542 168.066 73.476V67.266C168.066 60.822 173.286 55.602 179.73 55.602C186.174 55.602 191.394 60.822 191.394 67.266V82.242C227.178 98.946 250.614 126.666 250.614 158.022C250.614 176.418 242.568 193.536 228.69 207.936C226.026 210.69 222.336 212.256 218.466 212.256H191.412V234.54H225.378C232.704 234.54 245.844 220.644 252.072 212.274C252.072 212.274 252.342 211.86 253.062 211.644C253.782 211.428 315.432 197.28 315.432 197.28C316.728 196.92 318.006 197.91 318.006 199.224V199.242Z"
              fill="currentColor"
            />
          </svg>
        </div>
      ),
      onClick: () => window.open(opensea_url, "_blank"),
    }] : []),
    // Only show BaseScan button if contract_address is available
    ...(contract_address ? [{
      label: "BaseScan",
      icon: (
        <div className="relative h-5 w-5 flex items-center justify-center">
          <svg
            width="20"
            height="20"
            viewBox="0 0 46 46"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-gray-800"
          >
            <g>
              <rect width="46" height="46" rx="23" fill="#f0f0f0" />
              <path
                d="M22.9803 34.3703C29.2728 34.3703 34.3739 29.2796 34.3739 23.0001C34.3739 16.7205 29.2728 11.6299 22.9803 11.6299C17.0104 11.6299 12.1129 16.212 11.6265 22.0443H26.6861V23.9558H11.6265C12.1129 29.7882 17.0104 34.3703 22.9803 34.3703Z"
                fill="currentColor"
              />
            </g>
          </svg>
        </div>
      ),
      onClick: () => window.open(`https://basescan.org/address/${contract_address}`, "_blank"),
    }] : []),
    {
      label: "Copy URL",
      icon: <Copy className="h-5 w-5 text-gray-800" />,
      onClick: () => copyUrl(),
    },
  ]

  // Get current image
  const currentImage = images && images.length > 0 ? images[currentImageIndex] : "/placeholder.svg"

  // Determine if we should use a square container
  // Use square if: multiple images OR single image that is square
  const useSquareContainer = hasMultipleImages || (images.length === 1 && isImageSquare())

  // Calculate square container size based on viewport
  const squareSize = isMobile ? "80vh" : "70vh"

  // Determine backdrop and background colors based on theme
  const backdropClass = "backdrop-blur-md bg-gray-400/80"

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex transition-all duration-300 ease-out will-change-[backdrop-filter,background-color] overflow-auto",
        isMobile ? "items-start" : "items-center",
        "justify-center p-4",
        animationComplete ? backdropClass : "backdrop-blur-none bg-transparent",
      )}
      style={{ willChange: "backdrop-filter, background-color" }}
    >
      {/* Container for modal and menu - flex column on mobile, row on desktop */}
      <div
        ref={containerRef}
        className={cn(
          "flex max-w-[1400px] transition-all duration-300 relative",
          isMobile
            ? "flex-col items-center w-full max-h-none justify-start gap-4 overflow-y-auto py-4" // Allow scrolling on mobile
            : "flex-row items-start justify-center gap-4",
        )}
      >
        {/* Main Modal */}
        <div
          ref={modalRef}
          className={cn(
            "relative overflow-hidden rounded-2xl p-6px will-change-transform transition-colors duration-300",
            "bg-white",
          )}
          style={{
            width: isMobile ? "100%" : "auto", // Full width on mobile
            maxWidth: isMobile ? "100%" : "80%", // Match menu width on mobile
            transitionProperty: "transform, opacity, background-color",
            transitionDuration: "300ms, 300ms, 300ms",
            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1), cubic-bezier(0.16, 1, 0.3, 1), ease",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)", // RainbowKit dialog shadow
            ...(animationComplete ? { transform: "scale(1)", opacity: 1 } : getInitialStyles()),
          }}
        >
          {/* Main image container with rounded corners */}
          <div ref={imageRef} className="relative overflow-hidden rounded-2xl">
            {/* Image container - square for multiple images or square single images, natural aspect ratio for non-square single images */}
            <div
              className={cn("relative rounded-[16px] flex items-center justify-center", "bg-gray-50")}
              style={{
                ...(useSquareContainer
                  ? {
                      // Square container for multiple images or square single images
                      width: isMobile ? "100%" : `min(80vw, ${squareSize})`,
                      height: isMobile ? "auto" : `min(70vh, ${squareSize})`,
                      aspectRatio: useSquareContainer ? "1/1" : "auto",
                    }
                  : {
                      // Natural aspect ratio for non-square single images
                      maxWidth: isMobile ? "100%" : "80vw",
                      maxHeight: isMobile ? "auto" : "70vh",
                    }),
              }}
            >
              <div
                className={cn(
                  "relative flex items-center justify-center",
                  useSquareContainer ? "w-full h-full" : "max-w-full max-h-full",
                )}
              >
                <Image
                  src={currentImage || "/placeholder.svg"}
                  alt={title || "Image"}
                  width={1200}
                  height={800}
                  className={cn(
                    "object-contain rounded-[16px]",
                    useSquareContainer ? "max-w-full max-h-full" : "",
                    // Apply max-width: 90% only to non-square images in multiple image entries
                    hasMultipleImages && imageLoaded && !isImageSquare() ? "max-w-[90%]" : "",
                  )}
                  style={{
                    position: "relative", // Override Next.js Image absolute positioning
                    width: "auto",
                    height: "auto",
                  }}
                  priority
                  onLoad={handleImageLoad}
                />
              </div>

              {/* Navigation arrows for multiple images */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      goToPreviousImage()
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors z-10"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      goToNextImage()
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors z-10"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              {/* Overlay for subtitle and description if present */}
              {subtitle && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 z-10">
                  <div className="text-white font-bold tracking-wider text-xl">{subtitle}</div>
                  {description && <div className="text-white text-sm">{description}</div>}
                </div>
              )}
            </div>

            {/* Thumbnails for multiple images */}
            {hasMultipleImages && (
              <div
                className="mt-3 pb-6"
                style={{
                  opacity: thumbnailsVisible ? 1 : 0,
                  transform: thumbnailsVisible ? "translateY(0)" : "translateY(10px)",
                  transitionProperty: "opacity, transform",
                  transitionDuration: "300ms, 300ms",
                  transitionTimingFunction: "ease, cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                {/* Thumbnail carousel container */}
                <div className="relative flex items-center justify-center">
                  {/* Thumbnails */}
                  <div className="flex justify-center gap-3 py-2">
                    {getVisibleThumbnails().map((img, index) => {
                      const actualIndex = showThumbnailNavigation ? thumbnailStartIndex + index : index
                      return (
                        <button
                          key={actualIndex}
                          onClick={(e) => {
                            e.stopPropagation()
                            goToImage(actualIndex)
                          }}
                          className={cn(
                            "relative flex-shrink-0 w-20 h-20 rounded-[16px] overflow-hidden border-2 transition-all",
                            currentImageIndex === actualIndex
                              ? "border-blue-500 ring-2 ring-blue-500/20 scale-105"
                              : "border-gray-200 hover:border-gray-300 hover:scale-102",
                          )}
                          aria-label={`View image ${actualIndex + 1}`}
                        >
                          <Image
                            src={img || "/placeholder.svg"}
                            alt={`Thumbnail ${actualIndex + 1}`}
                            fill
                            className="object-cover"
                          />
                        </button>
                      )
                    })}
                  </div>

                  {/* Thumbnail indicator dots */}
                  {showThumbnailNavigation && (
                    <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1">
                      {Array.from({ length: Math.ceil(images.length / THUMBNAILS_PER_VIEW) }).map((_, pageIndex) => (
                        <button
                          key={pageIndex}
                          onClick={(e) => {
                            e.stopPropagation()
                            setThumbnailStartIndex(pageIndex * THUMBNAILS_PER_VIEW)
                          }}
                          className={cn(
                            "w-2 h-2 rounded-full transition-colors",
                            Math.floor(thumbnailStartIndex / THUMBNAILS_PER_VIEW) === pageIndex
                              ? "bg-blue-500"
                              : "bg-gray-300 hover:bg-gray-400"
                          )}
                          aria-label={`Go to thumbnail page ${pageIndex + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Title and source at bottom */}
          {title && (
            <div className="pt-2 pb-1 px-2">
              <h3 className="card-title">{title}</h3>
              {source && (
                <p className={cn("text-xs mt-0.5 transition-colors duration-300", "text-gray-500")}>{source}</p>
              )}
            </div>
          )}
        </div>

        {/* Right side column with Supply Progress and Menu stacked vertically */}
        <div className={cn("flex flex-col gap-4", isMobile ? "w-full" : "w-56 self-start")}>
          {/* Supply Progress */}
          <div
            className={cn(
              "overflow-hidden will-change-transform transition-colors duration-300",
              "bg-white",
              "rounded-3xl", // Full rounded corners on all sides
            )}
            style={{
              ...getMenuContainerStyles(50), // Show slightly before the menu
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)", // RainbowKit dialog shadow
            }}
          >
            <div className="px-5 py-4">
              <SupplyProgress id={id} animate={menuItemsVisible} />
            </div>
          </div>

          {/* Context menu */}
          <div
            className={cn(
              "overflow-hidden will-change-transform transition-colors duration-300",
              "bg-white",
              "rounded-3xl", // Full rounded corners on all sides
            )}
            style={{
              ...getMenuContainerStyles(),
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)", // RainbowKit dialog shadow
            }}
          >
            <div className="flex flex-col">
              {menuItems.map((item, index) => {
                const isLast = index === menuItems.length - 1

                return (
                  <button
                    key={index}
                    className={cn(
                      "flex items-center justify-between px-5 py-2.5 border-b transition-colors duration-300",
                      "hover:bg-gray-50 border-gray-100 text-gray-800",
                      isLast ? "border-b-0 rounded-b-3xl" : "", // Add rounded bottom corners to last item
                    )}
                    onClick={(e) => {
                      e.stopPropagation()
                      item.onClick()
                    }}
                    style={{
                      transitionProperty: "transform, opacity, background-color",
                      transitionDuration: "300ms, 300ms, 300ms",
                      transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1), cubic-bezier(0.16, 1, 0.3, 1), ease",
                      transitionDelay: `${150 + index * 50}ms`,
                      opacity: menuItemsVisible ? 1 : 0,
                      transform: menuItemsVisible ? "translateY(0)" : "translateY(10px)",
                    }}
                  >
                    <span className="text-base font-normal">{item.label}</span>
                    {item.icon}
                  </button>
                )
              })}
            </div>
          </div>

          {/* View Full Page Button - Separate stack at bottom */}
          <div
            className={cn(
              "overflow-hidden will-change-transform transition-colors duration-300",
              "bg-white",
              "rounded-3xl", // Full rounded corners on all sides
            )}
            style={{
              ...getMenuContainerStyles(200), // Show after other elements
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)", // RainbowKit dialog shadow
            }}
          >
            <button
              className={cn(
                "w-full flex items-center justify-between px-5 py-3 transition-colors duration-300",
                "hover:bg-gray-50 text-gray-800 rounded-3xl",
              )}
              onClick={(e) => {
                e.stopPropagation()
                if (slug) {
                  const targetUrl = `/${slug}`
                  onClose()
                  window.location.href = targetUrl
                } else {
                  console.error('No slug available for navigation')
                }
              }}
              style={{
                transitionProperty: "transform, opacity, background-color",
                transitionDuration: "300ms, 300ms, 300ms",
                transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1), cubic-bezier(0.16, 1, 0.3, 1), ease",
                transitionDelay: "350ms", // Show last
                opacity: menuItemsVisible ? 1 : 0,
                transform: menuItemsVisible ? "translateY(0)" : "translateY(10px)",
              }}
            >
              <span className="text-base font-normal">View Full Page</span>
              <div className="relative h-5 w-5 flex items-center justify-center">
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-gray-800"
                >
                  <path 
                    d="M13 3L13.7071 2.29289C14.0976 1.90237 14.7308 1.90237 15.1213 2.29289L21.7071 8.87868C22.0976 9.26921 22.0976 9.90237 21.7071 10.2929L15.1213 16.8787C14.7308 17.2692 14.0976 17.2692 13.7071 16.8787L13 16.1716M13 3V16.1716M13 3H8C5.79086 3 4 4.79086 4 7V17C4 19.2091 5.79086 21 8 21H16C18.2091 21 20 19.2091 20 17V14" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </button>
          </div>

          {/* Close Button - Standalone menu box at bottom */}
          <div
            className={cn(
              "overflow-hidden will-change-transform transition-colors duration-300",
              "bg-white",
              "rounded-3xl", // Full rounded corners on all sides
            )}
            style={{
              ...getMenuContainerStyles(250), // Show after all other elements
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)", // RainbowKit dialog shadow
            }}
          >
            <button
              className={cn(
                "w-full flex items-center justify-between px-5 py-3 transition-colors duration-300",
                "hover:bg-gray-50 text-gray-800 rounded-3xl",
              )}
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
              style={{
                transitionProperty: "transform, opacity, background-color",
                transitionDuration: "300ms, 300ms, 300ms",
                transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1), cubic-bezier(0.16, 1, 0.3, 1), ease",
                transitionDelay: "400ms", // Show last
                opacity: menuItemsVisible ? 1 : 0,
                transform: menuItemsVisible ? "translateY(0)" : "translateY(10px)",
              }}
            >
              <span className="text-base font-normal">Close</span>
              <X className="h-5 w-5 text-gray-800" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
