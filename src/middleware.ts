import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const userRole = req.auth?.user?.role

  const isAuthPage = nextUrl.pathname.startsWith('/auth')
  const isPublicPage = ['/', '/partners'].some(path =>
    nextUrl.pathname === path || nextUrl.pathname.startsWith('/partners/')
  )

  // Admin-only routes
  const isAdminRoute = nextUrl.pathname.startsWith('/admin')
  if (isAdminRoute && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/auth/error?error=unauthorized', req.url))
  }

  // Redirect authenticated users away from auth pages
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Protected routes require authentication
  const isProtectedRoute = ['/certification', '/calculator', '/analyze', '/admin'].some(path =>
    nextUrl.pathname.startsWith(path)
  )

  if (isProtectedRoute && !isLoggedIn) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search)
    return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=${callbackUrl}`, req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Protected routes
    '/certification/:path*',
    '/calculator/:path*',
    '/analyze/:path*',
    '/admin/:path*',
    // Auth routes
    '/auth/:path*',
  ]
}
