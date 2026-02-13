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
    // ... (keep existing code)
    {/* Genre Filters */ }
    <div className="flex flex-wrap gap-2">
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

    {/* Decade Filters */ }
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
                    </div >
                </header >

    {
        loading?(
                    <div className = "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 animate-pulse" >
                { [...Array(10)].map((_, i) => (
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
