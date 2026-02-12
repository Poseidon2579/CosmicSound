import { supabase } from './supabase';
import { Song, Review, Like } from '@/types';

// ==================== CANCIONES (Songs) ====================

export async function getAllSongs(): Promise<Song[]> {
    const { data, error } = await supabase
        .from('canciones')
        .select('*')
        .order('vistas', { ascending: false })
        .limit(100); // Limit default fetch

    if (error || !data) {
        console.error('Error fetching songs:', error);
        return [];
    }

    return data.map(mapCancionToSong);
}

export async function getTopSongs(limit: number = 10): Promise<Song[]> {
    const { data, error } = await supabase
        .from('canciones')
        .select('*')
        .order('vistas', { ascending: false })
        .limit(limit);

    if (error || !data) {
        console.error('Error fetching top songs:', error);
        return [];
    }

    return data.map(mapCancionToSong);
}

export async function searchSongs(query: string, page: number = 1, limit: number = 20): Promise<{ songs: Song[], total: number }> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let searchBuilder = supabase
        .from('canciones')
        .select('*', { count: 'exact' });

    if (query) {
        // Simple search across artist and title
        searchBuilder = searchBuilder.or(`artista.ilike.%${query}%,titulo.ilike.%${query}%`);
    }

    const { data, error, count } = await searchBuilder
        .order('vistas', { ascending: false })
        .range(from, to);

    if (error || !data) {
        console.error('Error searching songs:', error);
        return { songs: [], total: 0 };
    }

    return {
        songs: data.map(mapCancionToSong),
        total: count || 0
    };
}

// ==================== RESEÑAS (Reviews) ====================

export async function getReviewsForSong(songId: string): Promise<Review[]> {
    const { data, error } = await supabase
        .from('resenas')
        .select('*')
        .eq('cancion_id', songId);

    if (error || !data) return [];

    return data.map(mapResenaToReview);
}

export async function getRecentReviews(limit: number = 10): Promise<Review[]> {
    const { data, error } = await supabase
        .from('resenas')
        .select('*')
        .order('id', { ascending: false })
        .limit(limit);

    if (error || !data) return [];

    return data.map(mapResenaToReview);
}

export async function addReview(review: Review) {
    const { error } = await supabase
        .from('resenas')
        .insert({
            usuario: review.user,
            avatar: review.avatar,
            fecha: review.time,
            cancion_id: review.songId,
            comentario: review.comment,
            calificacion: review.rating,
            verificado: review.verified,
        });

    if (error) {
        console.error('Error adding review:', error);
    }
}

export async function getReviewsByUser(username: string): Promise<Review[]> {
    const { data, error } = await supabase
        .from('resenas')
        .select('*')
        .eq('usuario', username);

    if (error || !data) return [];

    return data.map(mapResenaToReview);
}

export async function getSongRatings(songIds: string[]): Promise<Record<string, { avg: number, count: number }>> {
    const { data, error } = await supabase
        .from('resenas')
        .select('cancion_id, calificacion')
        .in('cancion_id', songIds);

    if (error || !data) return {};

    const ratings: Record<string, { sum: number, count: number }> = {};
    data.forEach(row => {
        if (!ratings[row.cancion_id]) {
            ratings[row.cancion_id] = { sum: 0, count: 0 };
        }
        ratings[row.cancion_id].sum += row.calificacion || 0;
        ratings[row.cancion_id].count += 1;
    });

    const result: Record<string, { avg: number, count: number }> = {};
    Object.keys(ratings).forEach(id => {
        result[id] = {
            avg: ratings[id].sum / ratings[id].count,
            count: ratings[id].count
        };
    });

    return result;
}

// ==================== FAVORITOS (Likes) ====================

export async function getLikedSongs(userId: string): Promise<Song[]> {
    const { data: favData, error: favError } = await supabase
        .from('favoritos')
        .select('cancion_id')
        .eq('usuario_id', userId);

    if (favError || !favData || favData.length === 0) return [];

    const songIds = favData.map(f => f.cancion_id);

    const { data: songsData, error: songsError } = await supabase
        .from('canciones')
        .select('*')
        .in('id', songIds);

    if (songsError || !songsData) return [];

    return songsData.map(mapCancionToSong);
}

export async function toggleLike(userId: string, songId: string): Promise<boolean> {
    // Check if already liked
    const { data: existing } = await supabase
        .from('favoritos')
        .select('id')
        .eq('usuario_id', userId)
        .eq('cancion_id', songId)
        .single();

    if (existing) {
        // Unlike
        await supabase
            .from('favoritos')
            .delete()
            .eq('usuario_id', userId)
            .eq('cancion_id', songId);
        return false;
    } else {
        // Like
        await supabase
            .from('favoritos')
            .insert({
                usuario_id: userId,
                cancion_id: songId,
                fecha: new Date().toISOString(),
            });
        return true;
    }
}

export async function isSongLiked(userId: string, songId: string): Promise<boolean> {
    const { data } = await supabase
        .from('favoritos')
        .select('id')
        .eq('usuario_id', userId)
        .eq('cancion_id', songId)
        .single();

    return !!data;
}

// ==================== MAPPERS ====================

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

function mapResenaToReview(row: any): Review {
    return {
        user: row.usuario,
        avatar: row.avatar,
        time: row.fecha,
        songId: row.cancion_id,
        comment: row.comentario,
        rating: row.calificacion || 0,
        verified: row.verificado || false,
    };
}
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function getRecommendedSongs(userPreferences: any): Promise<Song[]> {
    try {
        const allSongs = await getAllSongs();

        // If no preferences, return mixed selection (not just first 6)
        if (!userPreferences || (!userPreferences.genres?.length && !userPreferences.artists?.length)) {
            return allSongs.sort(() => 0.5 - Math.random()).slice(0, 6);
        }

        const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Basado en estas preferencias de usuario: ${JSON.stringify(userPreferences)}
        Selecciona las 6 mejores canciones de esta lista que más encajen.
        Lista de canciones: ${JSON.stringify(allSongs.map(s => ({ id: s.id, title: s.track, artist: s.artist, genre: s.genre })))}
        Responde SOLO con un array de IDs de las canciones en JSON: ["id1", "id2", ...]`;

        const result = await model.generateContent(prompt);
        const text = (await result.response).text();
        const jsonMatch = text.match(/\[[\s\S]*\]/);

        if (jsonMatch) {
            const recommendedIds = JSON.parse(jsonMatch[0]);
            return allSongs.filter(s => recommendedIds.includes(s.id));
        }

        return allSongs.sort(() => 0.5 - Math.random()).slice(0, 6);
    } catch (error) {
        console.error("Error getting AI recommendations:", error);
        return getAllSongs().then(songs => songs.slice(0, 6));
    }
}

/**
 * Get trending songs based on real February 2026 data.
 * Tries to match global hits with the local database or provides a robust selection.
 */
export async function getTrendingSongs(): Promise<Song[]> {
    try {
        const allSongs = await getAllSongs();

        // Hits from research: Harry Styles, Ella Langley, Taylor Swift, Bad Bunny, Bruno Mars
        const trendingArtists = ["Harry Styles", "Ella Langley", "Taylor Swift", "Bad Bunny", "Bruno Mars", "Olivia Dean"];
        const trendingGenres = ["Pop", "Country", "Latin"];

        // Filter songs that match trending criteria
        let matchedSongs = allSongs.filter(s =>
            trendingArtists.some(artist => s.artist.toLowerCase().includes(artist.toLowerCase())) ||
            trendingGenres.some(genre => s.genre.toLowerCase().includes(genre.toLowerCase()))
        );

        // Sort by views to prioritize actual popularity
        matchedSongs.sort((a, b) => b.views - a.views);

        // Ensure we have at least 10 songs, if not fill with popular ones
        if (matchedSongs.length < 10) {
            const additions = allSongs
                .filter(s => !matchedSongs.find(m => m.id === s.id))
                .slice(0, 10 - matchedSongs.length);
            matchedSongs = [...matchedSongs, ...additions];
        }

        return matchedSongs.slice(0, 10);
    } catch (error) {
        console.error("Error fetching trending songs:", error);
        return getAllSongs().then(songs => songs.slice(0, 10));
    }
}
