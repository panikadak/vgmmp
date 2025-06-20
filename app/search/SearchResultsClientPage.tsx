"use client"

import { useState, useEffect, useCallback } from "react"
import MasonryGrid from "@/components/masonry-grid"
import { Card } from "@/components/card"
import { searchGames } from "@/lib/supabase/games"
import { Button } from "@/components/ui/button-custom"
import { useRouter } from "next/navigation"
import ScrollToTop from "@/components/scroll-to-top"

// Number of items to load per batch
const ITEMS_PER_PAGE = 12

export default function SearchResultsClientPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams.q || ""
  const router = useRouter()

  // Redirect to home if no query
  useEffect(() => {
    if (!query) {
      router.push("/")
    }
  }, [query, router])

  const [filteredItems, setFilteredItems] = useState<any[]>([])
  const [visibleItems, setVisibleItems] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)

  // Load search results from Supabase
  useEffect(() => {
    async function loadSearchResults() {
      if (!query) return
      
      try {
        setDataLoading(true)
        const searchResults = await searchGames(query)
        setFilteredItems(searchResults)
        
        // Initialize with first batch of items
        const initialItems = searchResults.slice(0, ITEMS_PER_PAGE).map((item, index) => ({
          ...item,
          id: item.id || `search-${index}`,
          slug: item.slug,
        }))

        setVisibleItems(initialItems)
        setHasMore(searchResults.length > ITEMS_PER_PAGE)
        setInitialized(true)
      } catch (error) {
        console.error('Failed to search games:', error)
        setFilteredItems([])
      } finally {
        setDataLoading(false)
      }
    }

    // Reset state when query changes
    setVisibleItems([])
    setPage(1)
    setLoading(false)
    setHasMore(true)
    setInitialized(false)
    setFilteredItems([])

    loadSearchResults()
  }, [query])

  // Load more items function
  const loadMoreItems = useCallback(() => {
    if (loading || !hasMore || dataLoading) return

    setLoading(true)

    // Simulate network delay
    setTimeout(() => {
      const nextItems = filteredItems.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE).map((item, index) => ({
        ...item,
        id: item.id || `search-${page * ITEMS_PER_PAGE + index}`,
        slug: item.slug,
      }))

      setVisibleItems((prev) => [...prev, ...nextItems])
      setPage((prev) => prev + 1)
      setHasMore((page + 1) * ITEMS_PER_PAGE < filteredItems.length)
      setLoading(false)
    }, 800) // Simulate network delay of 800ms
  }, [page, loading, hasMore, filteredItems, dataLoading])

  // Search header card component
  const SearchHeaderCard = () => (
    <div className="group relative overflow-hidden rounded-2xl bg-card-custom p-6px">
      <div className="relative aspect-auto overflow-hidden rounded-2xl">
        <div className="relative aspect-[16/9] bg-black rounded-2xl shadow-card">
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
            <div className="text-center">
              <h1 className="heading-1 text-white mb-2">
                Search: "{query}"
              </h1>
              <p className="text-white/90 text-lg font-medium">
                {filteredItems.length} {filteredItems.length === 1 ? "game" : "games"} found
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // If no query, show 404
  if (!query) {
    return null
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-[rgb(237,238,240)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Searching for "{query}"...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[rgb(237,238,240)]">
      {/* Main Content */}
      <main className="mx-auto px-4 py-4 max-w-[1600px]">
        {filteredItems.length === 0 ? (
          <>
            {/* Search Header Card in masonry for consistent sizing */}
            <MasonryGrid loadMore={loadMoreItems} hasMore={hasMore} loading={loading}>
              <SearchHeaderCard />
            </MasonryGrid>
            
            {/* No results message outside masonry for proper centering */}
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center py-16">
              <h2 className="heading-2 mb-2">No games found</h2>
              <p className="text-gray-500 mb-8">Try a different search term or browse categories</p>
              <Button variant="primary" onClick={() => router.push("/")}>
                Back to Home
              </Button>
            </div>
          </>
        ) : (
          <MasonryGrid loadMore={loadMoreItems} hasMore={hasMore} loading={loading}>
            {/* First card - Search Header */}
            <SearchHeaderCard />
            
            {/* Rest of the cards are games */}
            {visibleItems.map((item) => (
              <Card key={item.id} {...item} slug={item.slug} />
            ))}
          </MasonryGrid>
        )}
      </main>

      <ScrollToTop />
    </div>
  )
}
