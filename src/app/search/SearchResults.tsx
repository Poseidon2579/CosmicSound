"use client";

import { useEffect, useState } from "react";
import SongCard from "@/components/SongCard";
import { discoverMusic } from "@/actions/gemini";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

interface SearchResultsProps {
    initialResults: any[];
    query: string;
}

export default function SearchResults({ initialResults, query }: SearchResultsProps) {
    const [aiResults, setAiResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // If no local results, ask Gemini for recommendations based on the query
        if (query && initialResults.length === 0) {
            const fetchAiResults = async () => {
                setLoading(true);
                try {
                    const results = await discoverMusic(query);
                    setAiResults(results);
                } catch (err) {
                    console.error("Gemini search failed", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchAiResults();
        } else {
            setAiResults([]);
        }
    }, [query, initialResults]);

    return (
        <div>
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary blur-3xl opacity-20 animate-pulse"></div>
                        <Sparkles className="text-primary mb-4 relative z-10 animate-bounce" size={48} />
                    </div>
                    <p className="text-xl font-bold text-white tracking-widest animate-pulse">GEMINI EXPLORANDO EL VACÍO...</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    <AnimatePresence mode="popLayout">
                        {initialResults.length > 0 ? (
                            initialResults.map((song) => (
                                <motion.div
                                    key={song.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <SongCard song={song} />
                                </motion.div>
                            ))
                        ) : aiResults.length > 0 ? (
                            aiResults.map((song, idx) => (
                                <motion.div
                                    key={`ai-${idx}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-surface-dark/50 p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-4 border border-primary/20 hover:border-primary/40 transition-colors"
                                >
                                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Sparkles className="text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">{song.title || song.track}</h3>
                                        <p className="text-sm text-gray-400">{song.artist}</p>
                                    </div>
                                    <div className="text-[10px] px-2 py-1 rounded bg-primary/20 text-primary font-bold uppercase tracking-tighter">Sugerencia IA</div>
                                </motion.div>
                            ))
                        ) : query ? (
                            <div className="col-span-full py-20 text-center flex flex-col items-center gap-4">
                                <span className="material-symbols-outlined !text-6xl text-gray-700">satellite_alt</span>
                                <p className="text-gray-500 text-lg">No se han detectado transmisiones para "{query}" en este cuadrante.</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="text-primary text-sm font-bold hover:underline"
                                >
                                    Reintentar escaneo
                                </button>
                            </div>
                        ) : null}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
