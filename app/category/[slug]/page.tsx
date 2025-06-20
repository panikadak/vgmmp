"use client"

import { useState, useEffect, useCallback, use } from "react"
import { Card } from "@/components/card"
import ScrollToTop from "@/components/scroll-to-top"
import MasonryGrid from "@/components/masonry-grid"
import { getGamesByCategory } from "@/lib/supabase/games"
import { getCategoryBySlug } from "@/lib/constants"
import { notFound } from "next/navigation"

// Number of items to load per batch
const ITEMS_PER_PAGE = 12

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params)
  const categorySlug = resolvedParams.slug
  
  // Find the category
  const category = getCategoryBySlug(categorySlug)
  
  // If category doesn't exist, show 404
  if (!category) {
    notFound()
  }
  
  const [allCategoryGames, setAllCategoryGames] = useState<any[]>([])
  const [visibleItems, setVisibleItems] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)

  // Load category games from Supabase
  useEffect(() => {
    async function loadCategoryData() {
      try {
        setDataLoading(true)
        const categoryGames = await getGamesByCategory(categorySlug)
        setAllCategoryGames(categoryGames)
        
        // Initialize with first batch of items
        const initialItems = categoryGames.slice(0, ITEMS_PER_PAGE).map((item, index) => ({
          ...item,
          id: item.id || `category-item-${index}`,
          slug: item.slug,
        }))

        setVisibleItems(initialItems)
        setHasMore(categoryGames.length > ITEMS_PER_PAGE)
        setInitialized(true)
      } catch (error) {
        console.error('Failed to load category games:', error)
      } finally {
        setDataLoading(false)
      }
    }

    if (!initialized) {
      loadCategoryData()
    }
  }, [initialized, categorySlug])

  // Load more items function
  const loadMoreItems = useCallback(() => {
    if (loading || !hasMore || dataLoading) return

    setLoading(true)

    // Simulate network delay
    setTimeout(() => {
      const nextItems = allCategoryGames.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE).map((item, index) => ({
        ...item,
        id: item.id || `category-item-${page * ITEMS_PER_PAGE + index}`,
        slug: item.slug,
      }))

      setVisibleItems((prev) => [...prev, ...nextItems])
      setPage((prev) => prev + 1)
      setHasMore((page + 1) * ITEMS_PER_PAGE < allCategoryGames.length)
      setLoading(false)
    }, 800) // Simulate network delay of 800ms
  }, [page, loading, hasMore, allCategoryGames, dataLoading])

  // Category header card component
  const CategoryHeaderCard = () => (
    <div className="group relative overflow-hidden rounded-2xl bg-card-custom p-6px">
      <div className="relative aspect-auto overflow-hidden rounded-2xl">
        <div className="relative aspect-[16/9] bg-black rounded-2xl shadow-card">
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
            <div className="text-center">
              <h1 className="heading-1 text-white mb-2">
                {category.name}
              </h1>
              <p className="text-white/90 text-lg font-medium">
                {allCategoryGames.length} {allCategoryGames.length === 1 ? "game" : "games"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-[rgb(237,238,240)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading {category.name} games...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[rgb(237,238,240)]">
      {/* Main Content */}
      <main className="mx-auto px-4 py-4 max-w-[1600px]">
        <MasonryGrid loadMore={loadMoreItems} hasMore={hasMore} loading={loading}>
          {/* First card - Category Header */}
          <CategoryHeaderCard />
          
          {/* Rest of the cards are games */}
          {visibleItems.map((item) => (
            <Card key={item.id} {...item} slug={item.slug} />
          ))}
        </MasonryGrid>
      </main>

      <ScrollToTop />
    </div>
  )
} 