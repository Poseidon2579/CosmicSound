import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

const CSV_PATH = path.join(process.cwd(), 'dataset', 'Spotify_Youtube.csv', 'Spotify_Youtube.csv');
const REVIEWS_PATH = path.join(process.cwd(), 'src', 'data', 'reviews.csv');
const LIKES_PATH = path.join(process.cwd(), 'src', 'data', 'likes.csv');

import { Song, Review, Like } from '@/types';


let cachedSongs: Song[] = [];

function extractYoutubeId(url: string): string {
    if (!url) return "";
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([^?&"'>]+)/);
    return match ? match[1] : "";
}

export async function getAllSongs(): Promise<Song[]> {
    if (cachedSongs.length > 0) return cachedSongs;

    return new Promise((resolve, reject) => {
        const songs: Song[] = [];
        const stream = fs.createReadStream(CSV_PATH);

        let globalIndex = 0;
        Papa.parse(stream, {
            header: true,
            skipEmptyLines: true,
            chunk: (results) => {
                const chunkSongs = (results.data as any[]).map((row) => {
                    const ytId = extractYoutubeId(row.Url_youtube);
                    if (!ytId || !row.Artist || !row.Track) return null;

                    const id = globalIndex.toString();
                    globalIndex++;

                    return {
                        id,
                        artist: row.Artist,
                        track: row.Track,
                        album: row.Album || "Unknown",
                        youtubeId: ytId,
                        views: parseInt(row.Views) || 0,
                        likes: parseInt(row.Likes) || 0,
                        genre: "Musical",
                    };
                }).filter((s): s is Song => s !== null);

                songs.push(...chunkSongs);
            },
            complete: () => {
                cachedSongs = songs;
                console.log(`Loaded ${songs.length} songs from CSV`);
                resolve(songs);
            },
            error: (err: any) => reject(err),
        });
    });
}

export async function getReviewsForSong(songId: string): Promise<Review[]> {
    if (!fs.existsSync(REVIEWS_PATH)) return [];

    const fileContent = fs.readFileSync(REVIEWS_PATH, 'utf8');
    return new Promise((resolve) => {
        Papa.parse(fileContent, {
            header: true,
            skipEmptyLines: 'greedy',
            complete: (results) => {
                const allReviews = results.data as any[];
                const filtered = allReviews
                    .filter(r => r.songId && String(r.songId).trim() === String(songId).trim())
                    .map(r => ({
                        ...r,
                        rating: parseFloat(r.rating) || 0,
                        verified: String(r.verified) === 'true'
                    }));
                resolve(filtered);
            }
        });
    });
}

export async function getRecentReviews(limit: number = 10): Promise<Review[]> {
    if (!fs.existsSync(REVIEWS_PATH)) return [];

    const fileContent = fs.readFileSync(REVIEWS_PATH, 'utf8');
    return new Promise((resolve) => {
        Papa.parse(fileContent, {
            header: true,
            skipEmptyLines: 'greedy',
            complete: (results) => {
                const allReviews = (results.data as any[])
                    .filter(r => r.user && r.comment) // Basic validation
                    .map(r => ({
                        ...r,
                        rating: parseFloat(r.rating) || 0,
                        verified: String(r.verified) === 'true'
                    }));
                // Return latest reviews
                resolve(allReviews.reverse().slice(0, limit));
            }
        });
    });
}

export async function addReview(review: Review) {
    const dir = path.dirname(REVIEWS_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    // Clean up current file to avoid trailing newlines issues
    let currentContent = "";
    if (fs.existsSync(REVIEWS_PATH)) {
        currentContent = fs.readFileSync(REVIEWS_PATH, 'utf8').trim();
    }

    const reviewLine = {
        user: review.user,
        avatar: review.avatar,
        time: review.time,
        songId: review.songId,
        comment: review.comment,
        rating: review.rating,
        verified: review.verified
    };

    const csvData = Papa.unparse([reviewLine], { header: !currentContent });

    if (currentContent) {
        fs.writeFileSync(REVIEWS_PATH, `${currentContent}\n${csvData}`);
    } else {
        fs.writeFileSync(REVIEWS_PATH, csvData);
    }
}

export async function getReviewsByUser(username: string): Promise<Review[]> {
    if (!fs.existsSync(REVIEWS_PATH)) return [];

    const fileContent = fs.readFileSync(REVIEWS_PATH, 'utf8');
    return new Promise((resolve) => {
        Papa.parse(fileContent, {
            header: true,
            skipEmptyLines: 'greedy',
            complete: (results) => {
                const allReviews = results.data as any[];
                const filtered = allReviews
                    .filter(r => r.user && String(r.user).trim() === String(username).trim())
                    .map(r => ({
                        ...r,
                        rating: parseFloat(r.rating) || 0,
                        verified: String(r.verified) === 'true'
                    }));
                resolve(filtered);
            }
        });
    });
}

// --- Likes System ---

// Like interface imported from @/types

export async function getLikedSongs(userId: string): Promise<Song[]> {
    if (!fs.existsSync(LIKES_PATH)) return [];

    const fileContent = fs.readFileSync(LIKES_PATH, 'utf8');
    const likes: Like[] = await new Promise((resolve) => {
        Papa.parse(fileContent, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => resolve(results.data as Like[])
        });
    });

    const userLikes = likes.filter(l => l.userId === userId).map(l => l.songId);
    if (userLikes.length === 0) return [];

    // Optimize: Fetch all songs once (cached) and filter
    const allSongs = await getAllSongs();
    return allSongs.filter(s => userLikes.includes(s.id));
}

export async function toggleLike(userId: string, songId: string): Promise<boolean> {
    if (!fs.existsSync(LIKES_PATH)) return false;

    const fileContent = fs.readFileSync(LIKES_PATH, 'utf8');
    let likes: Like[] = await new Promise((resolve) => {
        Papa.parse(fileContent, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => resolve(results.data as Like[])
        });
    });

    const existingIndex = likes.findIndex(l => l.userId === userId && l.songId === songId);
    let isLiked = false;

    if (existingIndex > -1) {
        // Unlike
        likes.splice(existingIndex, 1);
        isLiked = false;
    } else {
        // Like
        likes.push({
            userId,
            songId,
            timestamp: new Date().toISOString()
        });
        isLiked = true;
    }

    const csv = Papa.unparse(likes);
    fs.writeFileSync(LIKES_PATH, csv);

    return isLiked;
}

export async function isSongLiked(userId: string, songId: string): Promise<boolean> {
    if (!fs.existsSync(LIKES_PATH)) return false;

    const fileContent = fs.readFileSync(LIKES_PATH, 'utf8');
    let likes: Like[] = await new Promise((resolve) => {
        Papa.parse(fileContent, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => resolve(results.data as Like[])
        });
    });

    return likes.some(l => l.userId === userId && l.songId === songId);
}
