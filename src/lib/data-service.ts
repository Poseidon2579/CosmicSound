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

import { getDbGenre } from "@/utils/genre-mappings";

export async function searchSongs(
    query: string,
    page: number = 1,
    limit: number = 20,
    genre?: string,
    decade?: string,
    album?: string,
    sortBy: 'relevance' | 'newest' | 'album' = 'relevance'
): Promise<{ songs: Song[], total: number }> {
    const from = (page - 1) * limit;

    let filterIds: string[] | null = null;

    // Normalize Genre Input (Handle "Electrónica" -> "Electronic")
    const dbGenre = genre && genre !== 'Todos' ? getDbGenre(genre) : null;

    // 1. Resolve Genre IDs if filter exists
    if (dbGenre) {
        try {
            const { data: gData } = await supabase.from('genres').select('id').ilike('name', dbGenre).single();
            if (gData) {
                const { data: sIds } = await supabase.from('song_genres').select('song_id').eq('genre_id', gData.id);
                if (sIds) {
                    const ids = sIds.map(o => o.song_id);
                    filterIds = ids;
                }
            }
        } catch (e) {
            console.error("Error resolving genre relation:", e);
        }
    }

    // 2. Resolve Decade IDs if filter exists
    if (decade) {
        try {
            const { data: dData } = await supabase.from('decades').select('id').ilike('name', decade).single();
            if (dData) {
                const { data: sIds } = await supabase.from('song_decades').select('song_id').eq('decade_id', dData.id);
                if (sIds) {
                    const ids = sIds.map(o => o.song_id);
                    // Intersect if filterIds already exists
                    if (filterIds !== null) {
                        filterIds = filterIds.filter(id => ids.includes(id));
                    } else {
                        filterIds = ids;
                    }
                }
            }
        } catch (e) {
            console.error("Error resolving decade relation:", e);
        }
    }

    let searchBuilder = supabase
        .from('canciones_con_rating')
        .select('*', { count: 'exact' });

    // Text Search
    if (query) {
        searchBuilder = searchBuilder.ilike('busqueda_vector', `%${query}%`);
    }

    // Apply Filter IDs (Intersection of Genre & Decade)
    if (filterIds !== null) {
        if (filterIds.length === 0) {
            // If we have no IDs for the filter, it's a hard empty result
            return { songs: [], total: 0 };
        }
        searchBuilder = searchBuilder.in('id', filterIds);
    } else if ((dbGenre || decade) && !filterIds) {
        // If filters were requested but no IDs found (e.g. valid genre name but no songs), return empty
        return { songs: [], total: 0 };
    }

    // Apply Album Filter
    if (album) {
        searchBuilder = searchBuilder.eq('album', album);
    }

    // Sorting
    if (sortBy === 'newest') {
        searchBuilder = searchBuilder.order('fecha_lanzamiento', { ascending: false });
    } else if (sortBy === 'album') {
        searchBuilder = searchBuilder.order('album', { ascending: true });
    } else {

        // 2. Apply Text Query (if exists) as an additional filter
        if (query) {
            searchBuilder = searchBuilder.or(`artista.ilike.%${query}%,titulo.ilike.%${query}%`);
        }

        let { data, error, count } = await searchBuilder
            .order('vistas', { ascending: false })
            .order('titulo', { ascending: true })
            .range(from, to);

        // AI FALLBACK: If filtering by genre/decade and no results found
        if ((!data || data.length === 0) && (genre || decade || query)) {
            try {
                console.log("No DB results for filter. Attempting AI Smart Search...");
                const allSongs = await getAllSongs(100);
                const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

                const filterContext = `Género: ${genre || 'Cualquiera'}, Década: ${decade || 'Cualquiera'}, Búsqueda: ${query || 'Ninguna'}`;
                const prompt = `De esta lista de canciones, selecciona las 20 que mejor encajen con: ${filterContext}.
            Lista: ${JSON.stringify(allSongs.map(s => ({ id: s.id, track: s.track, artist: s.artist, genre: s.genre, decade: s.decade })))}
            Responde SOLO con el JSON de los IDs: ["id1", "id2", ...]`;

                const result = await model.generateContent(prompt);
                const text = (await result.response).text();
                const jsonMatch = text.match(/\[[\s\S]*\]/);

                if (jsonMatch) {
                    const ids = JSON.parse(jsonMatch[0]);
                    data = allSongs.filter(s => ids.includes(s.id));
                    count = data.length;
                }
            } catch (aiError) {
                console.error("AI Fallback search failed:", aiError);
            }
        }

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
}

export async function getSearchSuggestions(query: string): Promise<{ text: string, type: 'song' | 'artist', id?: string }[]> {
    if (!query || query.length < 3) return [];

    const { data, error } = await supabase
        .from('canciones_con_rating')
        .select('titulo, artista, id, youtube_id')
        .or(`titulo.ilike.%${query}%,artista.ilike.%${query}%`)
        .limit(10);

    if (error || !data) return [];

    const suggestions: { text: string, type: 'song' | 'artist', id?: string }[] = [];
    const seen = new Set();

    data.forEach(item => {
        // Add Artist suggestion if new
        if (!seen.has(`artist:${item.artista}`)) {
            if (item.artista.toLowerCase().includes(query.toLowerCase())) {
                suggestions.push({ text: item.artista, type: 'artist' });
                seen.add(`artist:${item.artista}`);
            }
        }

        // Add Song suggestion
        if (item.titulo.toLowerCase().includes(query.toLowerCase())) {
            suggestions.push({ text: `${item.titulo} - ${item.artista}`, type: 'song', id: item.id });
        }
    });

    return suggestions.slice(0, 8); // Limit to 8 suggestions
}

export async function getAlbums(): Promise<string[]> {
    const { data, error } = await supabase
        .from('canciones')
        .select('album')
        .not('album', 'is', null)
        .order('album');

    if (error || !data) {
        console.error('Error fetching albums:', error);
        return [];
    }

    // Deduplicate albums (case insensitive)
    const uniqueAlbums = Array.from(new Set(data.map(item => item.album).filter(Boolean)));
    return uniqueAlbums.sort();
}

export async function getFilterStats(): Promise<{ genres: Record<string, number>, decades: Record<string, number>, albums: Record<string, number> }> {
    // 1. Genres Stats
    const { data: genreData } = await supabase
        .from('song_genres')
        .select('genre_id, genres(name)');

    const genreCounts: Record<string, number> = {};
    if (genreData) {
        genreData.forEach((item: any) => {
            const name = item.genres?.name;
            if (name) {
                genreCounts[name] = (genreCounts[name] || 0) + 1;
            }
        });
    }

    // 2. Decades Stats
    const { data: decadeData } = await supabase
        .from('song_decades')
        .select('decade_id, decades(name)');

    const decadeCounts: Record<string, number> = {};
    if (decadeData) {
        decadeData.forEach((item: any) => {
            const name = item.decades?.name;
            if (name) {
                decadeCounts[name] = (decadeCounts[name] || 0) + 1;
            }
        });
    }

    // 3. Albums Stats
    const { data: albumData } = await supabase
        .from('canciones')
        .select('album')
        .not('album', 'is', null);

    const albumCounts: Record<string, number> = {};
    if (albumData) {
        albumData.forEach((item: any) => {
            const name = item.album;
            if (name) {
                albumCounts[name] = (albumCounts[name] || 0) + 1;
            }
        });
    }

    return { genres: genreCounts, decades: decadeCounts, albums: albumCounts };
}

// Keep legacy logic as fallback until migration is 100% confirmed
async function getFilterStatsLegacy(genres: string[], decades: string[]) {
    console.warn("Using Legacy Filter Stats Logic");
    const stats = {
        genres: {} as Record<string, number>,
        decades: {} as Record<string, number>
    };
    genres.forEach(g => stats.genres[g] = 0);
    decades.forEach(d => stats.decades[d] = 0);

    const { data, error } = await supabase
        .from('canciones_con_rating')
        .select('genero, decada');

    if (error || !data) return stats;

    data.forEach((row: any) => {
        let genreSearchable = Array.isArray(row.genero) ? row.genero.join(" ") : String(row.genero || "");
        genreSearchable = genreSearchable.toLowerCase();

        genres.forEach(g => {
            if (genreSearchable.includes(g.toLowerCase())) stats.genres[g] = (stats.genres[g] || 0) + 1;
        });

        let decadeSearchable = Array.isArray(row.decada) ? row.decada.join(" ") : String(row.decada || "");
        decadeSearchable = decadeSearchable.toLowerCase();

        decades.forEach(d => {
            if (decadeSearchable.includes(d.toLowerCase())) stats.decades[d] = (stats.decades[d] || 0) + 1;
        });
    });
    return stats;
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


export async function getSongById(id: string): Promise<Song | null> {
    const { data, error } = await supabase
        .from('canciones_con_rating')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) {
        // console.error(`Error fetching song ${id}:`, error);
        return null;
    }

    return mapCancionToSong(data);
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
        reviewCount: row.review_count || 0,
        decade: row.decada
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
