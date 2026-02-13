"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { searchSongs, getFilterStats } from "@/lib/data-service";
import { Song, User } from "@/types";
import SongCard from "@/components/SongCard";
import Sidebar from "@/components/Sidebar";
import { getCurrentUser } from "@/lib/user-service";
import SmartSearchInput from "@/components/SmartSearchInput";

import { getDisplayGenre } from "@/utils/genre-mappings";

export default function SearchPage() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";
    const router = useRouter();

    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [user, setUser] = useState<User | null>(null);
    const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
    const [selectedDecade, setSelectedDecade] = useState<string | null>(null);
    const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'relevance' | 'newest' | 'album'>('relevance');
    const [filterStats, setFilterStats] = useState<{ genres: Record<string, number>, decades: Record<string, number>, albums: Record<string, number> } | null>(null);
    const [page, setPage] = useState(1);
    const pageSize = 20;

    useEffect(() => {
        async function fetchStats() {
            try {
                const stats = await getFilterStats();
                setFilterStats(stats);
            } catch (error) {
                console.error("Error fetching filter stats:", error);
            }
        }
        fetchStats();
    }, []);

    useEffect(() => {
        async function fetchResults() {
            setLoading(true);
            try {
                const currentUser = await getCurrentUser();
                setUser(currentUser);

                const { songs: searchResults, total: totalResults } = await searchSongs(
                    query,
                    page,
                    pageSize,
                    selectedGenre || undefined,
                    selectedDecade || undefined,
                    selectedAlbum || undefined,
                    sortBy
                );
                setSongs(searchResults);
                setTotal(totalResults);
            } catch (error) {
                console.error("Error searching:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchResults();
    }, [query, selectedGenre, selectedDecade, selectedAlbum, sortBy, page]);

    const totalPages = Math.ceil(total / pageSize);

    return (
        <div className="flex min-h-screen bg-transparent text-white font-display">
            <Sidebar user={user} />

            <main className="flex-1 overflow-y-auto p-8">
                <header className="mb-8 flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 rounded-full hover:bg-white/10 transition-colors"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <div className="flex-1">
                            <SmartSearchInput initialQuery={query} />
                        </div>
                    </div>

                    <div className="pl-14">
                        <p className="text-gray-400 text-sm">
                            {loading ? "Buscando..." : query ? `Encontramos ${total} resultados para "${query}"` : `Explorando ${total} señales sonoras`}
                        </p>
                    </div>


                    {/* Sort Options */}
                    <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSortBy('relevance')}
                                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${sortBy === 'relevance' ? 'text-primary' : 'text-gray-400 hover:text-white'}`}
                            >
                                Relevancia
                            </button>
                            <button
                                onClick={() => setSortBy('newest')}
                                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${sortBy === 'newest' ? 'text-primary' : 'text-gray-400 hover:text-white'}`}
                            >
                                Recientes
                            </button>
                            <button
                                onClick={() => setSortBy('album')}
                                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${sortBy === 'album' ? 'text-primary' : 'text-gray-400 hover:text-white'}`}
                            >
                                Álbum
                            </button>
                        </div>
                        <div className="text-xs text-gray-500">
                            Ordenado por: <span className="text-white capitalize">{sortBy === 'relevance' ? 'Relevancia' : sortBy === 'newest' ? 'Fecha' : 'Álbum'}</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => { setSelectedGenre(null); setPage(1); }}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${!selectedGenre
                                ? "bg-primary border-primary text-white shadow-lg shadow-primary/25"
                                : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                                }`}
                        >
                            Todos
                        </button>
                        {filterStats && Object.entries(filterStats.genres)
                            .sort((a, b) => b[1] - a[1])
                            .map(([genre, count]) => {
                                const isSelected = selectedGenre === genre;
                                if (count === 0 && !isSelected) return null;

                                return (
                                    <button
                                        key={genre}
                                        onClick={() => { setSelectedGenre(isSelected ? null : genre); setPage(1); }}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1 ${isSelected
                                            ? "bg-primary border-primary text-white shadow-lg shadow-primary/25"
                                            : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                                            }`}
                                    >
                                        {getDisplayGenre(genre)}
                                        <span className="text-[10px] opacity-70">({count})</span>
                                    </button>
                                );
                            })}
                    </div>

                    {/* Decade Filters */}
                    <div className="flex flex-wrap gap-2">
                        {filterStats && Object.entries(filterStats.decades)
                            .sort((a, b) => a[0].localeCompare(b[0]))
                            .map(([decade, count]) => {
                                const isSelected = selectedDecade === decade;
                                if (count === 0 && !isSelected) return null;

                                return (
                                    <button
                                        key={decade}
                                        onClick={() => { setSelectedDecade(isSelected ? null : decade); setPage(1); }}
                                        className={`px-3 py-1 rounded-md text-[10px] font-bold border transition-all flex items-center gap-1 ${isSelected
                                            ? "bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/25"
                                            : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                                            }`}
                                    >
                                        {decade}
                                        <span className="text-[9px] opacity-70">({count})</span>
                                    </button>
                                );
                            })}
                    </div>

                    {/* Album Filters (Horizontal Scroll) */}
                    {filterStats && Object.keys(filterStats.albums).length > 0 && (
                        <div className="space-y-2">
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Álbumes</p>
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                {Object.entries(filterStats.albums)
                                    .sort((a, b) => b[1] - a[1]) // Most popular albums first
                                    .slice(0, 15) // Show top 15 albums only to keep UI clean
                                    .map(([album, count]) => {
                                        const isSelected = selectedAlbum === album;
                                        return (
                                            <button
                                                key={album}
                                                onClick={() => { setSelectedAlbum(isSelected ? null : album); setPage(1); }}
                                                className={`whitespace-nowrap px-3 py-1 rounded-md text-[10px] font-bold border transition-all flex items-center gap-1 ${isSelected
                                                    ? "bg-purple-500 border-purple-500 text-white shadow-lg shadow-purple-500/25"
                                                    : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                                                    }`}
                                            >
                                                {album}
                                                <span className="text-[9px] opacity-70">({count})</span>
                                            </button>
                                        );
                                    })}
                            </div>
                        </div>
                    )}
                </header >

                {
                    loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 animate-pulse" >
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className="aspect-[3/4] bg-white/5 rounded-xl" />
                            ))
                            }
                        </div >
                    ) : songs.length > 0 ? (
                        <div className="space-y-12">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                {songs.map(song => (
                                    <SongCard key={song.id} song={song} />
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-2 py-10 border-t border-white/5">
                                    <button
                                        disabled={page === 1}
                                        onClick={() => setPage(p => p - 1)}
                                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-20 transition-all"
                                    >
                                        <span className="material-symbols-outlined">chevron_left</span>
                                    </button>

                                    <div className="flex items-center gap-1">
                                        {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                            let pageNum;
                                            if (totalPages <= 5) pageNum = i + 1;
                                            else if (page <= 3) pageNum = i + 1;
                                            else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                                            else pageNum = page - 2 + i;

                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setPage(pageNum)}
                                                    className={`size-10 rounded-lg flex items-center justify-center font-bold transition-all ${page === pageNum ? 'bg-primary text-white shadow-lg' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        disabled={page === totalPages}
                                        onClick={() => setPage(p => p + 1)}
                                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-20 transition-all"
                                    >
                                        <span className="material-symbols-outlined">chevron_right</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                            <span className="material-symbols-outlined text-6xl mb-4 opacity-50">search_off</span>
                            <p className="text-xl">No encontramos canciones para tu búsqueda.</p>
                            <p className="text-sm mt-2">Intenta con otros términos o explora las tendencias.</p>
                        </div>
                    )
                }
            </main >
        </div >
    );
}
