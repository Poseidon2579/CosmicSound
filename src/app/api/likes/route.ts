import { NextRequest, NextResponse } from 'next/server';
import { toggleLike, isSongLiked, getLikedSongs } from '@/lib/data-service';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
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
                        cookieStore.set({ name, value, ...options });
                    },
                    remove(name, options) {
                        cookieStore.set({ name, value: '', ...options });
                    },
                },
            }
        );

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        // Fallback to legacy cookie if needed (for older sessions)
        const legacyUserId = cookieStore.get('userId')?.value;
        const userId = user?.id || legacyUserId;

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { songId } = body;

        if (!songId) {
            return NextResponse.json({ error: 'Missing songId' }, { status: 400 });
        }

        // Check if already liked
        const { data: existing } = await supabase
            .from('favoritos')
            .select('id')
            .eq('usuario_id', userId)
            .eq('cancion_id', songId)
            .single();

        let isLiked = false;

        if (existing) {
            // Unlike
            await supabase
                .from('favoritos')
                .delete()
                .eq('usuario_id', userId)
                .eq('cancion_id', songId);
            isLiked = false;
        } else {
            // Like
            await supabase
                .from('favoritos')
                .insert({
                    usuario_id: userId,
                    cancion_id: songId,
                    fecha: new Date().toISOString(),
                });
            isLiked = true;
        }

        return NextResponse.json({ isLiked });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    const cookieStore = cookies();

    // Use Supabase Auth for GET as well
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name) {
                    return cookieStore.get(name)?.value;
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    const legacyUserId = cookieStore.get('userId')?.value;
    const userId = user?.id || legacyUserId;

    if (!userId) {
        // Return neutral response for guests instead of 401 to avoid console errors
        const searchParams = request.nextUrl.searchParams;
        if (searchParams.get('songId')) {
            return NextResponse.json({ isLiked: false });
        }
        return NextResponse.json({ songs: [] });
    }

    const searchParams = request.nextUrl.searchParams;
    const songId = searchParams.get('songId');

    if (songId) {
        const liked = await isSongLiked(userId, songId);
        return NextResponse.json({ isLiked: liked });
    } else {
        const songs = await getLikedSongs(userId);
        return NextResponse.json({ songs });
    }
}
