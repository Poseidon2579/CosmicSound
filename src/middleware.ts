import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // We need to use createServerClient instead of createMiddlewareClient 
    // because version 0.15.0 of auth-helpers-nextjs uses the SSR pattern.
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
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { session },
    } = await supabase.auth.getSession()

    const path = request.nextUrl.pathname

    const isProtectedRoute =
        path.startsWith('/profile') ||
        path.startsWith('/library') ||
        path.startsWith('/settings')

    // If there's no session and the user is trying to access a protected route
    if (isProtectedRoute && !session) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/signin'
        return NextResponse.redirect(redirectUrl)
    }

    // If there's a session and the user is on the signin page
    if (path === '/signin' && session) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/'
        return NextResponse.redirect(redirectUrl)
    }

    return response
}

export const config = {
    matcher: ['/profile/:path*', '/library/:path*', '/settings/:path*', '/signin'],
}
