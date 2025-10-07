// middleware.ts
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Create a Supabase client instance for this request
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              request.cookies.set({ name, value, ...options })
            } catch {
              // Ignore during edge execution
            }
          })
        },
      },
    }
  )

  // Get user session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname } = request.nextUrl

  // --- Define route categories ---
  const protectedPaths = ['/dashboard']
  const authPaths = ['/login', '/signup']

  const isProtected = protectedPaths.some((path) => pathname.startsWith(path))
  const isAuthPage = authPaths.some((path) => pathname.startsWith(path))

  // --- Auth redirect logic ---

  // 1️⃣ If trying to access a protected route without a session → redirect to /login
  if (isProtected && !session) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirectedFrom', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // 2️⃣ If already logged in and trying to access /login or /signup → redirect to /dashboard
  if (isAuthPage && session) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    return NextResponse.redirect(redirectUrl)
  }

  // Default: continue
  return NextResponse.next()
}

// Apply middleware only to routes that may require it
export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup'],
}