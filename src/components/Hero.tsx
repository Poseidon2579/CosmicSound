"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Hero({ onSearch }: { onSearch?: (query: string) => void }) {
    const [query, setQuery] = useState("");
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            if (onSearch) onSearch(query);
            router.push(`/search?q=${encodeURIComponent(query)}`);
        }
    };

    return (
        <div className="@container mb-12 mt-8">
            <div className="flex flex-col gap-6 items-center justify-center py-12 relative">
                {/* Decorative elements around search */}
                <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                    <div className="w-[80%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                </div>
                <div className="flex flex-col gap-4 text-center z-10 max-w-2xl">
                    <h1 className="text-white text-5xl font-black leading-tight tracking-[-0.033em] drop-shadow-lg">
                        Explora el Universo del Sonido
                    </h1>
                    <p className="text-gray-400 text-lg font-normal leading-normal">
                        Descubre nuevas dimensiones musicales, recomendadas por IA y la comunidad.
                    </p>
                </div>
                <form
                    onSubmit={handleSearch}
                    className="group relative flex flex-col min-w-40 h-16 w-full max-w-[600px] mt-4 z-20"
                >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-primary rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                    <div className="relative flex w-full flex-1 items-stretch rounded-xl h-full bg-background-dark/80 backdrop-blur-xl border border-white/10 shadow-2xl">
                        <div className="text-gray-400 flex items-center justify-center pl-5">
                            <span className="material-symbols-outlined !text-[24px]">search</span>
                        </div>
                        <input
                            className="flex w-full min-w-0 flex-1 resize-none overflow-hidden bg-transparent text-white focus:outline-none placeholder:text-gray-500 px-4 text-base font-medium"
                            placeholder="Busca una canción, artista o video musical..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <div className="flex items-center justify-center pr-2">
                            <button
                                type="submit"
                                className="flex items-center justify-center rounded-lg h-10 px-5 bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition-all"
                            >
                                Buscar
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
