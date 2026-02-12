export interface User {
    id: string;
    username: string;
    handle: string;
    email?: string;
    password?: string;
    bio: string;
    avatar: string;
    joined: string;
    visibility: boolean;
    history: boolean;
    sync: boolean;
    isPartial?: boolean;
}

export interface Song {
    id: string;
    artist: string;
    track: string;
    album: string;
    youtubeId: string;
    views: number;
    likes: number;
    genre: string;
}

export interface Review {
    user: string;
    avatar: string;
    time: string;
    songId: string;
    comment: string;
    rating: number;
    verified: boolean;
}

export interface Like {
    userId: string;
    songId: string;
    timestamp: string;
}

