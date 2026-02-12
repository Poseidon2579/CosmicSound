import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const next = requestUrl.searchParams.get('next') || '/';

    if (code) {
        const cookieStore = cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name) {
                        return cookieStore.get(name)?.value;
                    },
                    set(name, value, options) {
                        console.log(`[Auth Callback] Setting cookie: ${name}`);
                        cookieStore.set({ name, value, ...options });
                    },
                    remove(name, options) {
                        console.log(`[Auth Callback] Removing cookie: ${name}`);
                        cookieStore.set({ name, value: '', ...options });
                    },
                },
            }
        );
        console.log(`[Auth Callback] Exchanging code: ${code.substring(0, 5)}...`);
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) console.error("[Auth Callback] Exchange error:", error);
    }

    console.log(`[Auth Callback] Redirecting to: ${requestUrl.origin}${next}`);
    return NextResponse.redirect(`${requestUrl.origin}${next}`);
}
