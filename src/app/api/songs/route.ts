import { NextResponse } from 'next/server';
import { searchSongs } from '@/lib/data-service';
import { supabase } from '@/lib/supabase';
import { Song } from '@/types';

function mapCancionToSong(row: any): Song {
    return {
        id: row.id,
        artist: row.artista,
        track: row.titulo,
        album: row.album,
        youtubeId: row.youtube_id,
        views: row.vistas || 0,
        likes: row.me_gusta || 0,
        genre: row.genero || 'Musical',
    };
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const q = searchParams.get('q') || "";
    const page = parseInt(searchParams.get('page') || "1");
    const limit = parseInt(searchParams.get('limit') || "20");

    if (id) {
        // Fetch specific song by ID
        const { data } = await supabase
            .from('canciones')
            .select('*')
            .eq('id', id)
            .single();

        if (data) {
            return NextResponse.json({
                songs: [mapCancionToSong(data)],
                total: 1,
                page: 1,
                limit: 1
            });
        }
        return NextResponse.json({ songs: [], total: 0 });
    }

    const { songs, total } = await searchSongs(q, page, limit);

    return NextResponse.json({
        songs,
        total,
        page,
        limit
    });
}
