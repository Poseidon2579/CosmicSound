import { NextResponse } from 'next/server';
import { addReview, getReviewsForSong, getRecentReviews } from '@/lib/data-service';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const songId = searchParams.get('songId');
    const mode = searchParams.get('mode');

    if (mode === 'recent') {
        const reviews = await getRecentReviews(20);
        return NextResponse.json(reviews);
    }

    if (!songId) return NextResponse.json([], { status: 400 });

    const reviews = await getReviewsForSong(songId);
    return NextResponse.json(reviews);
}

export async function POST(request: Request) {
    const body = await request.json();
    await addReview(body);
    return NextResponse.json({ success: true });
}
