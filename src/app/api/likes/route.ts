import { NextRequest, NextResponse } from 'next/server';
import { toggleLike, isSongLiked, getLikedSongs } from '@/lib/data-service';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        const cookieStore = cookies();
        const userId = cookieStore.get('userId')?.value;

        // If no custom cookie, try standard Supabase auth
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { songId } = body;

        if (!songId) {
            return NextResponse.json({ error: 'Missing songId' }, { status: 400 });
        }

        // Direct DB operation with the server client (or just the shared one since we validate ID manually)
        // But since we are validating "userId" from cookie, we can trust it for now.
        // ideally we use supabase.auth.getUser() but we are using custom auth implementation from previous turns?
        // Let's stick to the same logic as data-service but inline to avoid issues

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
    const userId = cookieStore.get('userId')?.value;

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
