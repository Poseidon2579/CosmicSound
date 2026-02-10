import { NextResponse } from 'next/server';
import { registerUser } from '@/lib/user-service';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const userData = await request.json();

        if (!userData.email || !userData.password || !userData.username) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const user = await registerUser(userData);

        if (!user) {
            return NextResponse.json({ error: 'Registration failed or email already exists' }, { status: 400 });
        }

        const cookieStore = cookies();
        cookieStore.set('userId', user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7 // 1 week
        });

        return NextResponse.json({ success: true, user });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
