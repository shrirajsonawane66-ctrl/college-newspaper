import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always allow public routes
  if (
    pathname === '/admin/login' ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/images/')
  ) {
    console.log('[Middleware] Public route — allowing:', pathname)
    return NextResponse.next({ request })
  }

  // Only check auth for /admin/* routes (except login which is handled above)
  if (!pathname.startsWith('/admin/')) {
    return NextResponse.next({ request })
  }

  console.log('[Middleware] Checking auth for:', pathname)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          const response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
          return response
        },
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.getUser()

  console.log('[Middleware] Auth check:', { pathname, hasUser: !!user, error: error?.message })

  if (!user) {
    console.log('[Middleware] No user, redirecting to /admin/login')
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }

  console.log('[Middleware] Authenticated, allowing:', pathname)
  return NextResponse.next({ request })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images/).*)'],
}
