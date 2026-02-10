import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    console.log("Middleware hitting:", request.nextUrl.pathname);
    const userId = request.cookies.get('userId')?.value
    const path = request.nextUrl.pathname

    const isProtectedRoute =
        path.startsWith('/profile') ||
        path.startsWith('/library') ||
        path.startsWith('/settings')

    if (isProtectedRoute && !userId) {
        return NextResponse.redirect(new URL('/signin', request.url))
    }

    if (path === '/signin' && userId) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/profile/:path*', '/library/:path*', '/settings/:path*', '/signin'],
}
