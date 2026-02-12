import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })

    const {
        data: { session },
    } = await supabase.auth.getSession()

    const path = req.nextUrl.pathname

    const isProtectedRoute =
        path.startsWith('/profile') ||
        path.startsWith('/library') ||
        path.startsWith('/settings')

    // If there's no session and the user is trying to access a protected route
    if (isProtectedRoute && !session) {
        const redirectUrl = req.nextUrl.clone()
        redirectUrl.pathname = '/signin'
        // Ensure we keep the host to avoid redirecting to localhost in production
        return NextResponse.redirect(redirectUrl)
    }

    // If there's a session and the user is on the signin page
    if (path === '/signin' && session) {
        const redirectUrl = req.nextUrl.clone()
        redirectUrl.pathname = '/'
        return NextResponse.redirect(redirectUrl)
    }

    return res
}

export const config = {
    matcher: ['/profile/:path*', '/library/:path*', '/settings/:path*', '/signin'],
}
