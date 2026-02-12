import { NextResponse } from 'next/server';
import { searchSongs } from '@/lib/data-service';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const q = searchParams.get('q') || "";
    const page = parseInt(searchParams.get('page') || "1");
    const limit = parseInt(searchParams.get('limit') || "20");

    if (id) {
        const { songs, total } = await searchSongs(id, 1, 1); // Not the most efficient for ID but works for now
        // Actually, let's just use the searchSongs for everything
    }

    const { songs, total } = await searchSongs(q, page, limit);

    return NextResponse.json({
        songs,
        total,
        page,
        limit
    });
}
