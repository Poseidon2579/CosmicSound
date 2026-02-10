import { NextRequest, NextResponse } from 'next/server';
import { toggleLike, isSongLiked, getLikedSongs } from '@/lib/data-service';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        const cookieStore = cookies();
        const allCookies = cookieStore.getAll();
        console.log("API/Likes Debug - Cookies:", allCookies.map(c => `${c.name}=${c.value}`));
        const userId = cookieStore.get('userId')?.value;

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { songId } = body;

        if (!songId) {
            return NextResponse.json({ error: 'Missing songId' }, { status: 400 });
        }

        const isLiked = await toggleLike(userId, songId);
        return NextResponse.json({ isLiked });
    } catch (error) {
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
