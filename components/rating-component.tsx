"use client"

import { useState, useEffect } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { submitRating, getUserRating, getGameRatingStats } from "@/lib/supabase/ratings"

interface RatingComponentProps {
  gameId: string
  initialAverageRating?: number
  initialTotalRatings?: number
  showStats?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

export function RatingComponent({ 
  gameId, 
  initialAverageRating = 0,
  initialTotalRatings = 0,
  showStats = true, 
  size = "md",
  className 
}: RatingComponentProps) {
  const [userRating, setUserRating] = useState<number | null>(null)
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [averageRating, setAverageRating] = useState<number>(initialAverageRating)
  const [totalRatings, setTotalRatings] = useState<number>(initialTotalRatings)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<string>("")

  // Size configurations
  const sizeConfig = {
    sm: { star: "h-4 w-4", text: "text-sm", gap: "gap-1" },
    md: { star: "h-5 w-5", text: "text-base", gap: "gap-1" },
    lg: { star: "h-6 w-6", text: "text-lg", gap: "gap-2" }
  }

  const config = sizeConfig[size]

  // Load initial data
  useEffect(() => {
    loadRatingData()
  }, [gameId])

  const loadRatingData = async () => {
    try {
      // Load user's rating
      const userRat = await getUserRating(gameId)
      setUserRating(userRat)

      // Load game stats if not provided initially or if we need fresh data
      const stats = await getGameRatingStats(gameId)
      setAverageRating(stats.averageRating)
      setTotalRatings(stats.totalRatings)
    } catch (error) {
      console.error('Error loading rating data:', error)
    }
  }

  const handleRatingClick = async (rating: number) => {
    if (isSubmitting) return

    setIsSubmitting(true)
    setMessage("")

    try {
      const result = await submitRating(gameId, rating)
      
      if (result.success) {
        setUserRating(rating)
        
        // Reload stats after a short delay
        setTimeout(() => {
          loadRatingData()
        }, 500)
      } else {
        setMessage(result.error || "Failed to submit rating")
        setTimeout(() => setMessage(""), 3000)
      }
    } catch (error) {
      console.error('Error submitting rating:', error)
      setMessage("An error occurred")
      setTimeout(() => setMessage(""), 3000)
    } finally {
      setIsSubmitting(false)
    }
  }

  const displayRating = hoverRating || userRating || 0

  return (
    <div className={cn("space-y-2", className)}>
      {/* Current Average Rating Display */}
      {showStats && (
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Star className={cn(config.star, "fill-yellow-400 text-yellow-400")} />
            <span className={cn("font-semibold text-gray-900", config.text)}>
              {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
            </span>
          </div>
          {totalRatings > 0 && (
            <div className={cn("text-gray-500", config.text === "text-sm" ? "text-xs" : "text-sm")}>
              {totalRatings} ratings
            </div>
          )}
        </div>
      )}

      {/* Interactive Rating Section */}
      <div className="text-center border-t border-gray-100 pt-2">
        {/* Star Rating Input */}
        <div className="flex items-center justify-center gap-1 mb-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRatingClick(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(null)}
              disabled={isSubmitting}
              className={cn(
                "transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed",
                isSubmitting && "pointer-events-none"
              )}
              aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            >
              <Star
                className={cn(
                  config.star,
                  "transition-colors duration-200",
                  star <= displayRating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300 hover:text-yellow-300"
                )}
              />
            </button>
          ))}
        </div>
        
        {userRating && (
          <div className={cn("text-gray-600", config.text === "text-sm" ? "text-xs" : "text-sm")}>
            You rated: {userRating}/5
          </div>
        )}
      </div>

      {/* Message */}
      {message && (
        <div className={cn(
          "text-center text-sm transition-opacity duration-300",
          message.includes("Error") || message.includes("Failed") 
            ? "text-red-600" 
            : "text-green-600"
        )}>
          {message}
        </div>
      )}
    </div>
  )
} 