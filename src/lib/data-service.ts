import { supabase } from './supabase';
import { Song, Review, Like } from '@/types';

// ==================== CANCIONES (Songs) ====================

export async function getAllSongs(limit: number = 50): Promise<Song[]> {
    const { data, error } = await supabase
        .from('canciones_con_rating')
        .select('*')
        .order('vistas', { ascending: false })
        .limit(limit);

    if (error || !data) {
        console.error('Error fetching songs:', error);
        return [];
    }

    return data.map(mapCancionToSong);
}

export async function getRandomSong(): Promise<Song | null> {
    // First, get total count
    const { count } = await supabase
        .from('canciones')
        .select('*', { count: 'exact', head: true });

    if (!count) return null;

    // Pick a random offset
    const randomOffset = Math.floor(Math.random() * count);

    const { data, error } = await supabase
        .from('canciones_con_rating')
        .select('*')
        .range(randomOffset, randomOffset)
        .single();

    if (error || !data) return null;
    return mapCancionToSong(data);
}

export async function getTopSongs(limit: number = 10): Promise<Song[]> {
    // Fetch more than limit to allow for deduplication
    const { data, error } = await supabase
        .from('canciones')
        .select('*')
        .order('vistas', { ascending: false })
        .limit(limit * 5); // Fetch 5x to be safe

    if (error || !data) {
        console.error('Error fetching top songs:', error);
        return [];
    }

    const songs = data.map(mapCancionToSong);

    // Deduplicate logic
    const uniqueMap = new Map();
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

    songs.forEach(song => {
        // Create a normalized key that ignores "ft", "feat", special chars
        const normTitle = normalize(song.track);
        // We use just the first 10 chars of title + first 5 of artist for fuzzy matching if needed, 
        // but strict normalized title + youtubeID is usually safer.
        // Let's rely on strict YouTube ID first, then Normalized Title + Normalized Artist

        const ytKey = song.youtubeId;
        const contentKey = `${normTitle}-${normalize(song.artist)}`;

        if (uniqueMap.has(ytKey)) return;
        if (uniqueMap.has(contentKey)) return;

        uniqueMap.set(ytKey, song);
        uniqueMap.set(contentKey, song); // Reserve this spot
    });

    // Extract unique songs (values will be duplicated in map, so use Set)
    const uniqueSongs = Array.from(new Set(uniqueMap.values()));

    return uniqueSongs.slice(0, limit);
}

export async function searchSongs(query: string, page: number = 1, limit: number = 20, genre?: string): Promise<{ songs: Song[], total: number }> {
    const from = (page - 1) * limit;
    // Fetch 3x more to allow for deduplication while maintaining page size
    const to = from + (limit * 3) - 1;

    let searchBuilder = supabase
        .from('canciones_con_rating')
        .select('*', { count: 'exact' });

    if (query) {
        searchBuilder = searchBuilder.or(`artista.ilike.%${query}%,titulo.ilike.%${query}%`);
    }

    if (genre) {
        // Use ilike to handle case sensitivity issues in the DB
        searchBuilder = searchBuilder.ilike('genero', genre);
    }

    const { data, error, count } = await searchBuilder
        .order('vistas', { ascending: false })
        .range(from, to);

    if (error || !data) {
        console.error('Error searching songs:', error);
        return { songs: [], total: 0 };
    }

    const allSongs = data.map(mapCancionToSong);

    // Deduplication logic
    const uniqueMap = new Map();
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

    allSongs.forEach(song => {
        const ytKey = song.youtubeId;
        const contentKey = `${normalize(song.track)}-${normalize(song.artist)}`;

        if (uniqueMap.has(ytKey)) return;
        if (uniqueMap.has(contentKey)) return;

        uniqueMap.set(ytKey, song);
        uniqueMap.set(contentKey, song);
    });

    const uniqueSongs = Array.from(new Set(uniqueMap.values()));

    return {
        songs: uniqueSongs.slice(0, limit),
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
        .from('canciones_con_rating')
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
        rating: row.avg_rating || 0,
        reviewCount: row.review_count || 0
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
        // Limit songs sent to Gemini for performance
        const allSongs = await getAllSongs(40);

        // If no preferences, return mixed selection
        if (!userPreferences || (!userPreferences.genres?.length && !userPreferences.decades?.length)) {
            return allSongs.sort(() => 0.5 - Math.random()).slice(0, 10);
        }

        const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Basado en estas preferencias de usuario: ${JSON.stringify(userPreferences)}
        Selecciona las 10 mejores canciones de esta lista que más encajen.
        Lista de canciones: ${JSON.stringify(allSongs.map(s => ({ id: s.id, title: s.track, artist: s.artist, genre: s.genre })))}
        Responde SOLO con un array de IDs de las canciones en JSON: ["id1", "id2", ...]`;

        const result = await model.generateContent(prompt);
        const text = (await result.response).text();
        const jsonMatch = text.match(/\[[\s\S]*\]/);

        let recommendedSongs: Song[] = [];

        if (jsonMatch) {
            const recommendedIds = JSON.parse(jsonMatch[0]);
            recommendedSongs = allSongs.filter(s => recommendedIds.includes(s.id));
        } else {
            recommendedSongs = allSongs.sort(() => 0.5 - Math.random()).slice(0, 10);
        }

        // Ensure uniqueness by content
        const uniqueMap = new Map();
        recommendedSongs.forEach(song => {
            const key = `${song.track.trim().toLowerCase()}-${song.artist.trim().toLowerCase()}`;
            const ytKey = song.youtubeId || "no-yt";

            if (!uniqueMap.has(key) && !uniqueMap.has(ytKey)) {
                uniqueMap.set(key, song);
                if (song.youtubeId) uniqueMap.set(ytKey, song);
            }
        });

        // Clean up map values
        const finalUnique = Array.from(new Set(uniqueMap.values()));
        const reallyUnique = new Map();
        finalUnique.forEach(s => reallyUnique.set(s.id, s));

        return Array.from(reallyUnique.values());

    } catch (error) {
        console.error("Error getting AI recommendations:", error);
        return getAllSongs().then(songs => songs.slice(0, 10));
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

        // Remove duplicates just in case (checking Title + Artist to be sure)
        // Remove duplicates just in case (checking Title + Artist + YoutubeID to be sure)
        const uniqueMap = new Map();
        matchedSongs.forEach(song => {
            const key = `${song.track.trim().toLowerCase()}-${song.artist.trim().toLowerCase()}`;
            // Also check youtubeId if available to be extra safe
            const ytKey = song.youtubeId || "no-yt";

            if (!uniqueMap.has(key) && !uniqueMap.has(ytKey)) {
                uniqueMap.set(key, song);
                if (song.youtubeId) uniqueMap.set(ytKey, song);
            }
        });

        let finalUnique = Array.from(new Set(uniqueMap.values()));
        // Filter out any potential leftovers from the double-key map approach
        const reallyUnique = new Map();
        finalUnique.forEach(s => reallyUnique.set(s.id, s));

        return Array.from(reallyUnique.values()).slice(0, 10);
    } catch (error) {
        console.error("Error fetching trending songs:", error);
        return getAllSongs().then(songs => songs.slice(0, 10));
    }
}
