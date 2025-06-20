"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ChevronLeft, ChevronRight, Gamepad, Copy, Heart, Star, ExternalLink, MemoryStick, Play, Users, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"
import { SupplyProgress } from "@/components/supply-progress"
import { Button } from "@/components/ui/button-custom"
import ScrollToTop from "@/components/scroll-to-top"
import { incrementGamePlays, getGamesByCategoryExcluding } from "@/lib/supabase/games"
import { GameModal } from "@/components/game-modal"
import { RatingComponent } from "@/components/rating-component"
import { RelatedGameCard } from "@/components/related-game-card"
import { getCategoryByName } from "@/lib/constants"
import MasonryGrid from "@/components/masonry-grid"
import Comments from "@/components/Comments"

interface GameDetailPageProps {
  game: {
    id: string
    images: string[]
    title: string
    description: string
    source: string
    slug: string
    category: string
    plays?: number
    storage_path?: string
    average_rating?: number
    total_ratings?: number
    opensea_url?: string
    contract_address?: string
    cartridge?: string
  }
}

export default function GameDetailPage({ game }: GameDetailPageProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isGameModalOpen, setIsGameModalOpen] = useState(false)
  const [relatedGames, setRelatedGames] = useState<any[]>([])
  const [loadingRelatedGames, setLoadingRelatedGames] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [thumbnailScrollPosition, setThumbnailScrollPosition] = useState(0)
  const [showThumbnailArrows, setShowThumbnailArrows] = useState(false)
  const [cartridgeRotation, setCartridgeRotation] = useState({ x: 0, y: 0 })
  const thumbnailContainerRef = useRef<HTMLDivElement>(null)
  const cartridgeRef = useRef<HTMLDivElement>(null)
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Load related games when component mounts
  useEffect(() => {
    async function loadRelatedGames() {
      if (game.category && game.id) {
        try {
          setLoadingRelatedGames(true)
          const games = await getGamesByCategoryExcluding(game.category, game.id)
          setRelatedGames(games)
        } catch (error) {
          console.error('Error loading related games:', error)
        } finally {
          setLoadingRelatedGames(false)
        }
      }
    }

    loadRelatedGames()
  }, [game.category, game.id])

  // Check if thumbnail arrows are needed
  useEffect(() => {
    const checkThumbnailOverflow = () => {
      if (thumbnailContainerRef.current && game.images && game.images.length > 1) {
        const container = thumbnailContainerRef.current
        const scrollWidth = container.scrollWidth
        const clientWidth = container.clientWidth
        setShowThumbnailArrows(scrollWidth > clientWidth)
      }
    }

    checkThumbnailOverflow()
    window.addEventListener('resize', checkThumbnailOverflow)
    
    return () => {
      window.removeEventListener('resize', checkThumbnailOverflow)
    }
  }, [game.images])

  // Handle image load
  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  // Handle play game - increment plays and open game modal
  const handlePlayGame = async () => {
    try {
      await incrementGamePlays(game.id)
      setIsGameModalOpen(true)
    } catch (error) {
      console.error('Error incrementing plays:', error)
      setIsGameModalOpen(true)
    }
  }

  // Handle close game modal
  const handleCloseGameModal = () => {
    setIsGameModalOpen(false)
  }

  // Navigation functions
  const goToNextImage = () => {
    if (!game.images || game.images.length <= 1) return
    setCurrentImageIndex((prev) => (prev === game.images.length - 1 ? 0 : prev + 1))
    setImageLoaded(false)
  }

  const goToPreviousImage = () => {
    if (!game.images || game.images.length <= 1) return
    setCurrentImageIndex((prev) => (prev === 0 ? game.images.length - 1 : prev - 1))
    setImageLoaded(false)
  }

  const goToImage = (index: number) => {
    if (!game.images || index < 0 || index >= game.images.length) return
    setCurrentImageIndex(index)
    setImageLoaded(false)
  }

  // Get current image
  const currentImage = game.images && game.images.length > 0 ? game.images[currentImageIndex] : "/placeholder.svg"
  const hasMultipleImages = game.images && game.images.length > 1

  // Copy URL to clipboard
  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
    } catch (error) {
      console.error('Failed to copy URL:', error)
    }
  }

  // Thumbnail navigation functions
  const scrollThumbnails = (direction: 'left' | 'right') => {
    if (!thumbnailContainerRef.current) return
    
    const container = thumbnailContainerRef.current
    const scrollAmount = 200 // Scroll by 200px
    const newPosition = direction === 'left' 
      ? Math.max(0, thumbnailScrollPosition - scrollAmount)
      : Math.min(container.scrollWidth - container.clientWidth, thumbnailScrollPosition + scrollAmount)
    
    container.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    })
    setThumbnailScrollPosition(newPosition)
  }

  // Update scroll position when user scrolls manually
  const handleThumbnailScroll = () => {
    if (thumbnailContainerRef.current) {
      setThumbnailScrollPosition(thumbnailContainerRef.current.scrollLeft)
    }
  }

  // Handle mouse movement for cartridge follow effect
  const handleCartridgeMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cartridgeRef.current) return
    
    const rect = cartridgeRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const mouseX = e.clientX - centerX
    const mouseY = e.clientY - centerY
    
    // Calculate translation based on mouse position (max 8px movement)
    const translateX = (mouseX / (rect.width / 2)) * 8
    const translateY = (mouseY / (rect.height / 2)) * 8
    
    setCartridgeRotation({ x: translateY, y: translateX })
  }

  // Reset cartridge position when mouse leaves
  const handleCartridgeMouseLeave = () => {
    setCartridgeRotation({ x: 0, y: 0 })
  }

  return (
    <div className={`min-h-screen bg-[rgb(237,238,240)]`}>
      {/* Breadcrumb Navigation */}
      <div className="mx-auto px-4 max-w-[1600px] py-6">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Games</span>
        </Link>
      </div>

      {/* Main Content */}
      <main className="mx-auto px-4 max-w-[1600px] pb-24 md:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Images */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Image */}
            <div className="relative group">
              <div className="relative aspect-[16/10] overflow-hidden rounded-[24px] bg-white">
                <Image
                  src={currentImage || "/placeholder.svg"}
                  alt={game.title || "Game image"}
                  fill
                  className="object-contain transition-all duration-500"
                  style={{ opacity: imageLoaded ? 1 : 0 }}
                  onLoad={handleImageLoad}
                  priority
                />
                
                {/* Loading skeleton */}
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                )}

                {/* Navigation arrows for multiple images */}
                {hasMultipleImages && (
                  <>
                    <button
                      onClick={goToPreviousImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white text-gray-800 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 opacity-0 group-hover:opacity-100"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={goToNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white text-gray-800 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 opacity-0 group-hover:opacity-100"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}

                {/* Image counter */}
                {hasMultipleImages && (
                  <div className="absolute bottom-4 right-4 bg-black/60 text-white text-sm px-3 py-1 rounded-full backdrop-blur-sm">
                    {currentImageIndex + 1} / {game.images.length}
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {hasMultipleImages && (
              <div className="relative">
                {/* Navigation Arrows */}
                {showThumbnailArrows && (
                  <>
                    <button
                      onClick={() => scrollThumbnails('left')}
                      className={cn(
                        "absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 hover:bg-white text-gray-800 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105",
                        thumbnailScrollPosition <= 0 ? "opacity-50 cursor-not-allowed" : "opacity-100"
                      )}
                      disabled={thumbnailScrollPosition <= 0}
                      aria-label="Previous thumbnails"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => scrollThumbnails('right')}
                      className={cn(
                        "absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 hover:bg-white text-gray-800 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105",
                        !thumbnailContainerRef.current || 
                        thumbnailScrollPosition >= (thumbnailContainerRef.current.scrollWidth - thumbnailContainerRef.current.clientWidth)
                          ? "opacity-50 cursor-not-allowed" 
                          : "opacity-100"
                      )}
                      disabled={
                        !thumbnailContainerRef.current || 
                        thumbnailScrollPosition >= (thumbnailContainerRef.current.scrollWidth - thumbnailContainerRef.current.clientWidth)
                      }
                      aria-label="Next thumbnails"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                )}

                {/* Thumbnail Container */}
                <div 
                  ref={thumbnailContainerRef}
                  className={cn(
                    "flex gap-3 overflow-x-auto py-2 [&::-webkit-scrollbar]:hidden",
                    showThumbnailArrows ? "px-10" : "justify-center"
                  )}
                  onScroll={handleThumbnailScroll}
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                  }}
                >
                  {game.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => goToImage(index)}
                      className={cn(
                        "relative flex-shrink-0 w-20 h-20 rounded-[16px] overflow-hidden border-2 transition-all",
                        currentImageIndex === index 
                          ? "border-blue-500 ring-2 ring-blue-500/20 scale-105" 
                          : "border-gray-200 hover:border-gray-300 hover:scale-102"
                      )}
                    >
                      <Image
                        src={img || "/placeholder.svg"}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Game Description */}
            <div className="bg-card-custom rounded-[24px] p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">About This Game</h2>
              <div 
                className="prose prose-gray max-w-none text-gray-700 leading-relaxed [&>p]:mb-4 [&>p:last-child]:mb-0"
                dangerouslySetInnerHTML={{ __html: game.description }}
              />
            </div>

            {/* Comments Section */}
            <Comments gameId={game.id} />

            {/* Related Games */}
            {relatedGames.length > 0 && (
              <div className="bg-card-custom rounded-[24px] p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    More {game.category} Games
                  </h2>
                  {relatedGames.length > 4 && (
                    <Link 
                      href={`/category/${getCategoryByName(game.category)?.slug || game.category.toLowerCase().replace(/\s+/g, '-')}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                    >
                      View All
                    </Link>
                  )}
                </div>
                
                {loadingRelatedGames ? (
                  <MasonryGrid columns={4}>
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="bg-gray-100 rounded-2xl p-4">
                        <div className="aspect-[5/3] bg-gray-200 rounded-xl animate-pulse mb-3" />
                        <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                      </div>
                    ))}
                  </MasonryGrid>
                ) : (
                  <MasonryGrid columns={4}>
                    {relatedGames.slice(0, 8).map((relatedGame) => (
                      <RelatedGameCard
                        key={relatedGame.id}
                        id={relatedGame.id}
                        images={relatedGame.images || []}
                        title={relatedGame.title}
                        source={relatedGame.source}
                        slug={relatedGame.slug}
                        useGrayBackground={true}
                      />
                    ))}
                  </MasonryGrid>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Game Info */}
          <div className="space-y-6">
            
            {/* Game Title & Info */}
            <div className="bg-card-custom rounded-[24px] p-8 relative overflow-visible">
              <div className="space-y-4">
                {/* Title and Cartridge Section */}
                <div className="flex flex-col items-center text-center space-y-6 pt-20">
                  {/* Cartridge Image */}
                  {game.cartridge && (
                    <div 
                      ref={cartridgeRef}
                      className="relative group -mt-40 perspective-1000"
                      onMouseMove={handleCartridgeMouseMove}
                      onMouseLeave={handleCartridgeMouseLeave}
                    >
                      <Image
                        src={game.cartridge}
                        alt={`${game.title} cartridge`}
                        width={260}
                        height={364}
                        className="object-contain transition-transform duration-300 ease-in-out group-hover:scale-105 [filter:drop-shadow(8px_3px_20px_rgba(50,50,70,0.4))_drop-shadow(-8px_-3px_20px_rgba(255,255,255,0.9))]"
                        style={{
                          transform: `translateX(${cartridgeRotation.y}px) translateY(${cartridgeRotation.x}px)`,
                          transition: 'transform 0.1s ease-out'
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Title and Source */}
                  <div className="space-y-3">
                    <h1 className="text-2xl font-bold text-gray-900 leading-tight tracking-tight">
                      {game.title}
                    </h1>
                    {game.source && (
                      <p className="text-lg text-gray-600 font-medium">{game.source}</p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button 
                    variant="primary"
                    className="flex-1 h-12 rounded-[16px] font-semibold"
                    onClick={handlePlayGame}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Play Now
                  </Button>
                  <Button 
                    variant="secondary"
                    className="h-12 px-4 rounded-[16px]"
                    onClick={() => setIsLiked(!isLiked)}
                  >
                    <Heart className={cn("h-4 w-4", isLiked && "fill-red-500 text-red-500")} />
                  </Button>
                  <Button 
                    variant="secondary"
                    className="h-12 px-4 rounded-[16px]"
                    onClick={copyUrl}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card-custom rounded-[20px] p-6 text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-[12px] flex items-center justify-center">
                    <Eye className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{game.plays || 0}</div>
                <div className="text-sm text-gray-600">Plays</div>
              </div>
              
              <div className="bg-card-custom rounded-[20px] p-6 text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-10 h-10 bg-yellow-50 rounded-[12px] flex items-center justify-center">
                    <Star className="h-5 w-5 text-yellow-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {game.average_rating ? game.average_rating.toFixed(1) : '0.0'}
                </div>
                <div className="text-sm text-gray-600">Rating</div>
              </div>
            </div>

            {/* Rating Component */}
            <div className="bg-card-custom rounded-[20px] p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Rate This Game</h3>
              <RatingComponent 
                gameId={game.id} 
                initialAverageRating={game.average_rating}
                initialTotalRatings={game.total_ratings}
                showStats={true}
                size="md"
              />
            </div>

            {/* Mint Cartridge */}
            <div className="bg-card-custom rounded-[20px] p-6">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-purple-50 rounded-[16px] flex items-center justify-center mx-auto">
                  <MemoryStick className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Mint Game Cartridge</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Own this game forever as an NFT cartridge
                  </p>
                </div>
                <SupplyProgress id={game.id} animate={true} />
                <Button variant="secondary" className="w-full h-12 rounded-[16px] font-semibold">
                  <MemoryStick className="h-4 w-4 mr-2" />
                  Mint Cartridge
                </Button>
              </div>
            </div>

            {/* Game Details */}
            <div className="bg-card-custom rounded-[20px] p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Game Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Category</span>
                  <span className="font-medium text-gray-900 capitalize">{game.category}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Platform</span>
                  <span className="font-medium text-gray-900">Web Browser</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Blockchain</span>
                  <span className="font-medium text-gray-900">Base</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Status</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Available
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-card-custom rounded-[20px] p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
              <div className="space-y-2">
                {game.opensea_url && (
                  <button 
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-white rounded-[16px] transition-colors group"
                    onClick={() => window.open(game.opensea_url, "_blank")}
                  >
                    <span className="font-medium text-gray-900">View on OpenSea</span>
                    <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                  </button>
                )}
                {game.contract_address && (
                  <button 
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-white rounded-[16px] transition-colors group"
                    onClick={() => window.open(`https://basescan.org/address/${game.contract_address}`, "_blank")}
                  >
                    <span className="font-medium text-gray-900">View on BaseScan</span>
                    <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                  </button>
                )}
                {!game.opensea_url && !game.contract_address && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No external links available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Game Modal */}
      <GameModal
        isOpen={isGameModalOpen}
        onClose={handleCloseGameModal}
        gameUrl={game.storage_path || ""}
        gameTitle={game.title}
      />

      {/* Mobile Action Buttons - Fixed Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 p-4 md:hidden z-50">
        <div className="flex gap-3 max-w-[1600px] mx-auto">
          <Button 
            variant="primary"
            className="flex-1 h-12 rounded-[16px] font-semibold"
            onClick={handlePlayGame}
          >
            <Play className="h-4 w-4 mr-2" />
            Play Now
          </Button>
          <Button 
            variant="secondary"
            className="h-12 px-4 rounded-[16px]"
            onClick={() => setIsLiked(!isLiked)}
          >
            <Heart className={cn("h-4 w-4", isLiked && "fill-red-500 text-red-500")} />
          </Button>
        </div>
      </div>

      <ScrollToTop />
    </div>
  )
} 