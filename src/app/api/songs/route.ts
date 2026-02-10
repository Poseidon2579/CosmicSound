import { NextResponse } from 'next/server';
import { getAllSongs } from '@/lib/data-service';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const q = searchParams.get('q')?.toLowerCase() || "";
    const page = parseInt(searchParams.get('page') || "1");
    const limit = 20;

    let songs = await getAllSongs();

    if (id) {
        const song = songs.find(s => s.id === id);
        return NextResponse.json({ songs: song ? [song] : [], total: song ? 1 : 0 });
    }

    if (q) {
        const terms = q.split(/\s+/);
        songs = songs.filter(s => {
            const searchStr = `${s.artist} ${s.track} ${s.album}`.toLowerCase();
            return terms.every(term => searchStr.includes(term));
        });
    }

    const total = songs.length;
    const paginated = songs.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
        songs: paginated,
        total,
        page,
        limit
    });
}
