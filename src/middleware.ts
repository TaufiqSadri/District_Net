import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

type CookieToSet = {
  name: string
  value: string
  options?: Record<string, unknown>
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as never),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname
  const isEmailConfirmed = Boolean(user?.email_confirmed_at ?? user?.confirmed_at)

  if (user && !isEmailConfirmed && (path.startsWith('/dashboard') || path.startsWith('/admin'))) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('error', 'email_not_confirmed')
    return NextResponse.redirect(url)
  }

  // 1. Protect /dashboard dan /admin - redirect ke login kalau belum auth
  if (!user && (path.startsWith('/dashboard') || path.startsWith('/admin'))) {
    const url = request.nextUrl.clone()
    const redirectPath = `${path}${request.nextUrl.search}`
    url.pathname = '/login'
    url.search = ''
    url.searchParams.set('redirect', redirectPath)
    return NextResponse.redirect(url)
  }

  // 2. Kalau sudah login dan akses /admin, pastikan dia admin
  if (user && isEmailConfirmed && path.startsWith('/admin')) {
    const isAdmin = user.user_metadata?.role === 'admin'
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    // Hanya jalankan middleware di route yang butuh proteksi.
    // Halaman publik seperti /login dan /register tidak perlu menunggu auth round-trip.
    '/dashboard/:path*',
    '/admin/:path*',
  ],
}
