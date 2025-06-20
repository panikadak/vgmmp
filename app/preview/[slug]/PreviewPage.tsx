"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import MasonryGrid from "@/components/masonry-grid"
import { Card } from "@/components/card"
import { getAllGames, incrementGamePlays } from "@/lib/supabase/games"
import { Button } from "@/components/ui/button-custom"
import { CustomConnectButton } from "@/components/connect-button"
import Image from "next/image"
import ExploreButton from "@/components/explore-button"
import ScrollToTop from "@/components/scroll-to-top"
import { ImageModal } from "@/components/image-modal"

// Number of items to load per batch
const ITEMS_PER_PAGE = 12

interface PreviewPageProps {
  game: {
    id: string
    images: string[]
    title: string
    description: string
    source: string
    slug: string
    subtitle?: string
    contract_address?: string
    opensea_url?: string
  }
}

export default function PreviewPage({ game }: PreviewPageProps) {
  const router = useRouter()
  const [allItems, setAllItems] = useState<any[]>([])
  const [visibleItems, setVisibleItems] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(true) // Start with modal open

  // Increment plays when preview opens
  useEffect(() => {
    const incrementPlays = async () => {
      try {
        await incrementGamePlays(game.id)
      } catch (error) {
        console.error('Error incrementing plays:', error)
      }
    }
    
    incrementPlays()
  }, [game.id])

  // Load all items from Supabase
  useEffect(() => {
    async function loadData() {
      try {
        setDataLoading(true)
        const items = await getAllGames()
        setAllItems(items)
        
        // Initialize with first batch of items
        const initialItems = items.slice(0, ITEMS_PER_PAGE).map((item, index) => ({
          ...item,
          id: item.id || `item-${index}`,
          slug: item.slug,
        }))

        setVisibleItems(initialItems)
        setHasMore(items.length > ITEMS_PER_PAGE)
        setInitialized(true)
      } catch (error) {
        console.error('Failed to load games:', error)
      } finally {
        setDataLoading(false)
      }
    }

    if (!initialized) {
      loadData()
    }
  }, [initialized])

  // Load more items function
  const loadMoreItems = () => {
    if (loading || !hasMore || dataLoading) return

    setLoading(true)

    // Simulate network delay
    setTimeout(() => {
      const nextItems = allItems.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE).map((item, index) => ({
        ...item,
        id: item.id || `item-${page * ITEMS_PER_PAGE + index}`,
        slug: item.slug,
      }))

      setVisibleItems((prev) => [...prev, ...nextItems])
      setPage((prev) => prev + 1)
      setHasMore((page + 1) * ITEMS_PER_PAGE < allItems.length)
      setLoading(false)
    }, 800)
  }

  // Handle closing modal - go back to homepage
  const handleCloseModal = () => {
    setIsModalOpen(false)
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-[rgb(237,238,240)]">
      {/* Elegant Top Navigation */}
      <header className="bg-white border-b border-gray-100 py-4">
        <div className="mx-auto px-4 max-w-[1600px]">
          {/* Desktop layout - row, Mobile layout - column with inline buttons */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            {/* Mobile wrapper to ensure equal width */}
            <div className="w-full flex flex-col items-center md:hidden">
              {/* Logo container - fixed width on mobile */}
              <div className="w-full max-w-[300px] flex items-center justify-center gap-3 mb-5">
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
              </div>

              {/* Buttons container - wider to fit all buttons on one line */}
              <div className="w-full max-w-[360px] flex flex-row items-center justify-center gap-2">
                <div className="w-[120px] flex-shrink-0">
                  <ExploreButton fullWidth compact />
                </div>
                <div className="w-[140px] flex-shrink-0">
                  <CustomConnectButton variant="primary" fullWidth compact />
                </div>
              </div>
            </div>

            {/* Desktop-only layout (hidden on mobile) */}
            <div className="hidden md:flex md:items-center md:justify-start gap-3">
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
            </div>

            {/* Desktop-only search and buttons (hidden on mobile) */}
            <div className="hidden md:flex md:items-center gap-4">
              <ExploreButton />
              <CustomConnectButton variant="primary" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto px-4 py-4 max-w-[1600px]">
        <MasonryGrid loadMore={loadMoreItems} hasMore={hasMore} loading={loading}>
          {visibleItems.map((item) => (
            <Card key={item.id} {...item} slug={item.slug} />
          ))}
        </MasonryGrid>
      </main>

      {/* Preview Modal */}
      <ImageModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        images={game.images}
        title={game.title}
        source={game.source}
        subtitle={game.subtitle}
        description={game.description}
        sourceRect={null} // No source rect for preview pages
        id={game.id}
        slug={game.slug}
        contract_address={game.contract_address}
        opensea_url={game.opensea_url}
      />

      <ScrollToTop />
    </div>
  )
} 