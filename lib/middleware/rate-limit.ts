/**
 * Rate Limiting Middleware
 * Protects against brute force attacks and API abuse
 */

import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/lib/config'

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Different rate limits for different endpoints
const RATE_LIMITS = {
  auth: { maxRequests: 1000, windowMs: 60 * 1000 }, // Auth rate limit disabled - 1000 requests per minute
  comments: { maxRequests: 30, windowMs: 15 * 60 * 1000 }, // 30 comments per 15 minutes
  upload: { maxRequests: 10, windowMs: 60 * 60 * 1000 }, // 10 uploads per hour
  default: { 
    maxRequests: config.security.rateLimit.maxRequests, 
    windowMs: config.security.rateLimit.windowMs 
  },
} as const

type RateLimitType = keyof typeof RATE_LIMITS

/**
 * Get client identifier (IP address with fallbacks)
 */
function getClientId(request: NextRequest): string {
  // Check for real IP in various headers (for proxies/CDNs)
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  
  // Use the first available IP
  const ip = forwardedFor?.split(',')[0] || realIp || cfConnectingIp || 'unknown'
  
  return ip.trim()
}

/**
 * Get rate limit configuration based on request path
 */
function getRateLimitType(pathname: string): RateLimitType {
  if (pathname.includes('/api/auth')) return 'auth'
  if (pathname.includes('/comments')) return 'comments'
  if (pathname.includes('/upload')) return 'upload'
  return 'default'
}

/**
 * Clean up expired entries from rate limit store
 */
function cleanupExpiredEntries() {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

/**
 * Rate limiting middleware function
 */
export function rateLimit(request: NextRequest): NextResponse | null {
  // Skip rate limiting in development (optional)
  if (config.isDevelopment && process.env.DISABLE_RATE_LIMIT === 'true') {
    return null
  }

  const clientId = getClientId(request)
  const pathname = request.nextUrl.pathname
  const rateLimitType = getRateLimitType(pathname)
  const limits = RATE_LIMITS[rateLimitType]
  
  // Create unique key for this client and endpoint type
  const key = `${clientId}:${rateLimitType}`
  
  // Clean up expired entries periodically
  if (Math.random() < 0.01) { // 1% chance to cleanup
    cleanupExpiredEntries()
  }
  
  const now = Date.now()
  const windowStart = now - limits.windowMs
  
  // Get or create rate limit entry
  let entry = rateLimitStore.get(key)
  
  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired one
    entry = {
      count: 1,
      resetTime: now + limits.windowMs
    }
    rateLimitStore.set(key, entry)
  } else {
    // Increment counter
    entry.count++
  }
  
  // Check if limit exceeded
  if (entry.count > limits.maxRequests) {
    const resetIn = Math.ceil((entry.resetTime - now) / 1000)
    
    return new NextResponse(
      JSON.stringify({
        error: 'Rate limit exceeded',
        message: `Too many requests. Try again in ${resetIn} seconds.`,
        type: rateLimitType,
        limit: limits.maxRequests,
        resetIn,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': limits.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': entry.resetTime.toString(),
          'Retry-After': resetIn.toString(),
        },
      }
    )
  }
  
  // Add rate limit headers to successful responses
  const response = NextResponse.next()
  response.headers.set('X-RateLimit-Limit', limits.maxRequests.toString())
  response.headers.set('X-RateLimit-Remaining', (limits.maxRequests - entry.count).toString())
  response.headers.set('X-RateLimit-Reset', entry.resetTime.toString())
  
  return response
}

/**
 * Check rate limit without incrementing (for previewing)
 */
export function checkRateLimit(request: NextRequest): {
  limited: boolean
  remaining: number
  resetIn: number
} {
  const clientId = getClientId(request)
  const pathname = request.nextUrl.pathname
  const rateLimitType = getRateLimitType(pathname)
  const limits = RATE_LIMITS[rateLimitType]
  
  const key = `${clientId}:${rateLimitType}`
  const entry = rateLimitStore.get(key)
  const now = Date.now()
  
  if (!entry || now > entry.resetTime) {
    return {
      limited: false,
      remaining: limits.maxRequests,
      resetIn: 0,
    }
  }
  
  return {
    limited: entry.count >= limits.maxRequests,
    remaining: Math.max(0, limits.maxRequests - entry.count),
    resetIn: Math.ceil((entry.resetTime - now) / 1000),
  }
}

/**
 * Rate limit specifically for API routes
 */
export function apiRateLimit(
  request: NextRequest,
  customLimits?: { maxRequests: number; windowMs: number }
): NextResponse | null {
  const limits = customLimits || RATE_LIMITS.default
  const clientId = getClientId(request)
  const pathname = request.nextUrl.pathname
  
  const key = `${clientId}:api:${pathname}`
  const now = Date.now()
  
  let entry = rateLimitStore.get(key)
  
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 1,
      resetTime: now + limits.windowMs
    }
    rateLimitStore.set(key, entry)
    return null
  }
  
  entry.count++
  
  if (entry.count > limits.maxRequests) {
    const resetIn = Math.ceil((entry.resetTime - now) / 1000)
    
    return new NextResponse(
      JSON.stringify({
        error: 'Rate limit exceeded',
        message: `API rate limit exceeded. Try again in ${resetIn} seconds.`,
        resetIn,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': limits.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': entry.resetTime.toString(),
          'Retry-After': resetIn.toString(),
        },
      }
    )
  }
  
  return null
}

/**
 * Clear rate limit for a specific client (useful for testing)
 */
export function clearRateLimit(clientId: string, type?: RateLimitType) {
  if (type) {
    rateLimitStore.delete(`${clientId}:${type}`)
  } else {
    // Clear all entries for this client
    for (const key of rateLimitStore.keys()) {
      if (key.startsWith(`${clientId}:`)) {
        rateLimitStore.delete(key)
      }
    }
  }
}

/**
 * Get current rate limit stats for monitoring
 */
export function getRateLimitStats() {
  const stats = {
    totalEntries: rateLimitStore.size,
    activeClients: new Set(Array.from(rateLimitStore.keys()).map(key => key.split(':')[0])).size,
    byType: {} as Record<string, number>,
  }
  
  for (const key of rateLimitStore.keys()) {
    const type = key.split(':')[1] || 'unknown'
    stats.byType[type] = (stats.byType[type] || 0) + 1
  }
  
  return stats
} 