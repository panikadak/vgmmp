"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface SupplyProgressProps {
  id: string
  className?: string
  animate?: boolean
}

export function SupplyProgress({ id, className, animate = true }: SupplyProgressProps) {
  const [progress, setProgress] = useState(0)
  const [sold, setSold] = useState(0)
  const [total, setTotal] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  // Generate consistent but random-looking supply data based on the id
  useEffect(() => {
    // Use the id to generate a seed for consistent values
    const numericSeed = id
      .split("")
      .map((char) => char.charCodeAt(0))
      .reduce((a, b) => a + b, 0)

    // Generate total supply between 500 and 5000
    const totalSupply = 500 + (numericSeed % 4500)

    // Generate sold amount between 5% and 95% of total
    const minSold = Math.floor(totalSupply * 0.05)
    const maxSold = Math.floor(totalSupply * 0.95)
    const range = maxSold - minSold
    const soldAmount = minSold + (numericSeed % range)

    // Calculate progress percentage
    const progressPercent = (soldAmount / totalSupply) * 100

    setTotal(totalSupply)
    setSold(soldAmount)

    // Animate the progress bar if animation is enabled
    if (animate) {
      setProgress(0)
      const timer = setTimeout(() => {
        setIsLoaded(true)
        const animationDuration = 1000
        const startTime = Date.now()

        const animateProgress = () => {
          const elapsed = Date.now() - startTime
          const nextProgress = Math.min((elapsed / animationDuration) * progressPercent, progressPercent)
          setProgress(nextProgress)

          if (nextProgress < progressPercent) {
            requestAnimationFrame(animateProgress)
          }
        }

        requestAnimationFrame(animateProgress)
      }, 300) // Delay to match the menu animation

      return () => clearTimeout(timer)
    } else {
      setProgress(progressPercent)
      setIsLoaded(true)
    }
  }, [id, animate])

  return (
    <div
      className={cn(
        "w-full overflow-hidden transition-all duration-300",
        isLoaded ? "opacity-100" : "opacity-0",
        className,
      )}
    >
      {/* First line: Game Supply */}
      <div className="text-base font-normal mb-2">Game Supply</div>

      {/* Second line: Progress bar */}
      <div className="h-2 w-full rounded-full overflow-hidden mb-2 bg-gray-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Third line: Numbers */}
      <div className="text-base font-normal">
        <span className="font-normal">{sold.toLocaleString()}</span>
        <span className="text-gray-500"> of </span>
        <span className="font-normal">{total.toLocaleString()}</span>
      </div>
    </div>
  )
}
