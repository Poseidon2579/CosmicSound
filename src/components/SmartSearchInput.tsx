"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getSearchSuggestions } from "@/lib/data-service";
import Link from "next/link";

interface Suggestion {
    text: string;
    type: 'song' | 'artist';
    id?: string;
}

export default function SmartSearchInput({ initialQuery = "" }: { initialQuery?: string }) {
    const [query, setQuery] = useState(initialQuery);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Debounce logic
    useEffect(() => {
        if (query.length < 3) {
            setSuggestions([]);
            setIsOpen(false);
            return;
        }

        const timeoutId = setTimeout(async () => {
            setLoading(true);
            try {
                const results = await getSearchSuggestions(query);
                setSuggestions(results);
                setIsOpen(results.length > 0);
            } catch (error) {
                console.error("Error fetching suggestions:", error);
            } finally {
                setLoading(false);
            }
        }, 400); // 400ms delay

        return () => clearTimeout(timeoutId);
    }, [query]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
                inputRef.current && !inputRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearch = () => {
        setIsOpen(false);
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const selectSuggestion = (suggestion: Suggestion) => {
        setQuery(suggestion.text);
        setIsOpen(false);
        // The user requirement: "no busca hasta que no seleccione... y le doy clic" (Wait, maybe they mean clicking the suggestion triggers search?)
        // "no debe buscar hasta que no seleccione lo que busque o termine y le doy clic"
        // This suggests selecting populates it, but maybe doesn't auto-search? 
        // Or maybe selecting implies "terminating" the search. 
        // Usually clicking a suggestion navigates immediately. I'll navigate immediately for suggestions.
        // But for typing, I wait for explicit action.

        if (suggestion.type === 'song' && suggestion.id) {
            // If it's a specific song, maybe go to track? Or just search context?
            // "Smart search bar... suggested info... but don't search unti I select OR finish and click".
            // I will treat suggestion click as "Select and Search".
            router.push(`/search?q=${encodeURIComponent(suggestion.text)}`);
        } else {
            router.push(`/search?q=${encodeURIComponent(suggestion.text)}`);
        }
    };

    return (
        <div className="relative w-full max-w-2xl z-50">
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-gray-400 group-focus-within:text-primary transition-colors">
                        search
                    </span>
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Buscar canciones, artistas..."
                    className="w-full pl-12 pr-14 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/10 transition-all shadow-lg backdrop-blur-sm"
                />

                {query && (
                    <button
                        onClick={() => { setQuery(''); setSuggestions([]); setIsOpen(false); inputRef.current?.focus(); }}
                        className="absolute inset-y-0 right-14 flex items-center px-2 text-gray-500 hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                )}

                <button
                    onClick={handleSearch}
                    className="absolute inset-y-1 right-1 px-4 bg-primary/80 hover:bg-primary text-white rounded-xl transition-colors flex items-center justify-center"
                >
                    <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
                </button>
            </div>

            {/* Suggestions Dropdown */}
            {isOpen && (
                <div
                    ref={dropdownRef}
                    className="absolute mt-2 w-full bg-[#0f0f16]/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden animate-in fade-in slide-in-from-top-2"
                >
                    <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                        {loading ? (
                            <div className="p-4 text-center text-gray-400 text-sm">Buscando en el cosmos...</div>
                        ) : (
                            suggestions.map((item, index) => (
                                <button
                                    key={`${item.type}-${index}`}
                                    onClick={() => selectSuggestion(item)}
                                    className="w-full text-left px-5 py-3 hover:bg-white/10 transition-colors flex items-center gap-3 border-b border-white/5 last:border-0"
                                >
                                    <div className={`size-8 rounded-full flex items-center justify-center ${item.type === 'artist' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                        <span className="material-symbols-outlined text-sm">
                                            {item.type === 'artist' ? 'artist' : 'music_note'}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-white">{item.text}</p>
                                        <p className="text-[10px] uppercase tracking-wider text-gray-500">{item.type === 'artist' ? 'Artista' : 'Canción'}</p>
                                    </div>
                                    <span className="material-symbols-outlined text-gray-600 -rotate-45 text-sm">
                                        arrow_outward
                                    </span>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
