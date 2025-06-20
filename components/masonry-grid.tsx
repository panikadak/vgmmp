"use client"

import React, { type ReactNode, useEffect, useRef, useCallback } from "react"

interface MasonryGridProps {
  children: ReactNode
  columns?: number
  loadMore?: () => void
  hasMore?: boolean
  loading?: boolean
}

export default function MasonryGrid({
  children,
  columns = 4,
  loadMore,
  hasMore = false,
  loading = false,
}: MasonryGridProps) {
  const childrenArray = React.Children.toArray(children)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadingRef = useRef<HTMLDivElement | null>(null)
  const columnContent = useRef<ReactNode[][]>([])

  // Create columns and distribute children
  columnContent.current = []
  for (let i = 0; i < columns; i++) {
    columnContent.current.push([])
  }

  // Distribute children to columns
  childrenArray.forEach((child, index) => {
    const columnIndex = index % columns
    columnContent.current[columnIndex].push(child)
  })

  // Set up intersection observer for infinite scrolling
  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return

      if (observerRef.current) observerRef.current.disconnect()

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && loadMore) {
            loadMore()
          }
        },
        {
          rootMargin: "100px", // Load more when user is 100px from the bottom
        },
      )

      if (node) observerRef.current.observe(node)
    },
    [loading, hasMore, loadMore],
  )

  // Clean up observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {columnContent.current.map((column, columnIndex) => (
        <div key={columnIndex} className="flex flex-col gap-4">
          {column}
        </div>
      ))}

      {/* Loading indicator and intersection observer target */}
      {(hasMore || loading) && (
        <div ref={lastElementRef} className="col-span-full flex justify-center items-center py-8">
          {loading && (
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-gray-600">Loading more games...</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
