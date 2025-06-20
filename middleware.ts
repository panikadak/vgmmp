import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { rateLimit } from "@/lib/middleware/rate-limit"

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const path = url.pathname

  // Skip for static files, images, and Next.js internals
  if (
    path.startsWith("/_next") ||
    path.startsWith("/static") ||
    path.startsWith("/favicon.ico") ||
    path.includes(".") // Skip files with extensions
  ) {
    return NextResponse.next()
  }

  // Skip rate limiting for NextAuth routes
  if (path.startsWith("/api/auth")) {
    return NextResponse.next()
  }

  // Apply rate limiting for other non-static routes
  const rateLimitResponse = rateLimit(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  // Let all other routes pass through normally - no redirects needed
  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
