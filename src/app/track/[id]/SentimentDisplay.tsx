"use client";

import { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { analyzeSentiment } from "@/actions/gemini";
import { motion, AnimatePresence } from "framer-motion";

export default function SentimentDisplay() {
    const [comment, setComment] = useState("");
    const [sentiment, setSentiment] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) return;

        setLoading(true);
        const res = await analyzeSentiment(comment);
        setSentiment(res);
        setLoading(false);
    };

    return (
        <div className="space-y-4">
            <form onSubmit={handleSubmit} className="relative">
                <input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Deja tu transmisión..."
                    className="w-full h-12 pl-6 pr-14 rounded-xl glass outline-none focus:border-cosmic-accent/50 transition-all text-sm"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="absolute right-1 top-1 bottom-1 w-10 flex items-center justify-center rounded-lg bg-cosmic-accent text-white hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                    {loading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Send size={16} />
                    )}
                </button>
            </form>

            <AnimatePresence>
                {sentiment && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border ${sentiment === "Positivo"
                                ? "bg-green-500/10 border-green-500/20 text-green-400"
                                : sentiment === "Negativo"
                                    ? "bg-red-500/10 border-red-500/20 text-red-400"
                                    : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                            }`}
                    >
                        <Sparkles size={14} /> Sentimiento detectado: {sentiment}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
