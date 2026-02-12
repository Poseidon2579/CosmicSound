import { supabase } from './supabase';
import { Song, Review, Like } from '@/types';

// ==================== CANCIONES (Songs) ====================

export async function getAllSongs(): Promise<Song[]> {
    const { data, error } = await supabase
        .from('canciones')
        .select('*')
        .order('vistas', { ascending: false });

    if (error || !data) {
        console.error('Error fetching songs:', error);
        return [];
    }

    return data.map(mapCancionToSong);
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
