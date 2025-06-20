"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/card"
import ScrollToTop from "@/components/scroll-to-top"
import MasonryGrid from "@/components/masonry-grid"
import { getAllGames } from "@/lib/supabase/games"
import { Suspense } from "react"
import { Gamepad, Search, Sparkles, Trophy, Zap } from "lucide-react"
import { GameCard } from "@/components/game-card"
import { SearchModal } from "@/components/search-modal"
import { ImageModal } from "@/components/image-modal"
import { GameModal } from "@/components/game-modal"
import { ConnectButton } from "@/components/connect-button"
import { useGameData } from "@/hooks/use-game-data"
import { useModalState } from "@/hooks/use-modal-state"
import { cn } from "@/lib/utils"

// Number of items to load per batch
const ITEMS_PER_PAGE = 12

export default function Home() {
  const [allItems, setAllItems] = useState<any[]>([])
  const [visibleItems, setVisibleItems] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)

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
  const loadMoreItems = useCallback(() => {
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
    }, 800) // Simulate network delay of 800ms
  }, [page, loading, hasMore, allItems, dataLoading])

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-[rgb(237,238,240)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading games...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[rgb(237,238,240)]">
      {/* Main Content */}
      <main className="mx-auto px-4 py-4 max-w-[1600px]">
        <MasonryGrid loadMore={loadMoreItems} hasMore={hasMore} loading={loading}>
          {visibleItems.map((item) => (
            <Card key={item.id} {...item} slug={item.slug} />
          ))}
        </MasonryGrid>
      </main>

      <ScrollToTop />
    </div>
  )
}
