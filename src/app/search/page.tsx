"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { searchSongs, getSongRatings } from "@/lib/data-service";
import { Song, User } from "@/types";
import SongCard from "@/components/SongCard";
import Sidebar from "@/components/Sidebar";
import { getCurrentUser } from "@/lib/user-service";

export default function SearchPage() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";
    const router = useRouter();

    const [songs, setSongs] = useState<(Song & { rating?: number })[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        async function fetchResults() {
            setLoading(true);
            try {
                const currentUser = await getCurrentUser();
                setUser(currentUser);

                if (query) {
                    const { songs: searchResults, total: totalResults } = await searchSongs(query);

                    // Fetch ratings
                    const ratingsMap = await getSongRatings(searchResults.map(s => s.id));
                    const songsWithRatings = searchResults.map(s => ({
                        ...s,
                        rating: ratingsMap[s.id]?.avg || 0
                    }));

                    setSongs(songsWithRatings);
                    setTotal(totalResults);
                }
            } catch (error) {
                console.error("Error searching:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchResults();
    }, [query]);

    return (
        <div className="flex min-h-screen bg-background-dark text-white font-display">
            <Sidebar user={user} />

            <main className="flex-1 overflow-y-auto p-8">
                <header className="mb-8 flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold">Resultados de búsqueda</h1>
                        <p className="text-gray-400">
                            {loading ? "Buscando..." : `Encontramos ${total} resultados para "${query}"`}
                        </p>
                    </div>
                </header>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 animate-pulse">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                            <div key={i} className="aspect-[3/4] bg-white/5 rounded-xl" />
                        ))}
                    </div>
                ) : songs.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {songs.map(song => (
                            <SongCard key={song.id} song={song} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                        <span className="material-symbols-outlined text-6xl mb-4 opacity-50">search_off</span>
                        <p className="text-xl">No encontramos canciones para tu búsqueda.</p>
                        <p className="text-sm mt-2">Intenta con otros términos o explora las tendencias.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
