"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface FavoriteButtonProps {
    songId: string;
    initialLiked?: boolean;
    className?: string;
    iconSize?: number;
}

export default function FavoriteButton({
    songId,
    initialLiked = false,
    className = "",
    iconSize = 20
}: FavoriteButtonProps) {
    const [isLiked, setIsLiked] = useState(initialLiked);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Only fetch if initialLiked isn't provided (e.g. for dynamic lists)
        if (initialLiked === undefined) {
            const checkStatus = async () => {
                const res = await fetch(`/api/likes?songId=${songId}`);
                if (res.ok) {
                    const data = await res.json();
                    setIsLiked(data.isLiked);
                }
            };
            checkStatus();
        } else {
            setIsLiked(initialLiked);
        }
    }, [songId, initialLiked]);

    const toggleLike = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isLoading) return;

        setIsLoading(true);
        // Optimistic update
        const prevStatus = isLiked;
        setIsLiked(!prevStatus);

        try {
            const response = await fetch('/api/likes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ songId }),
            });

            if (response.status === 401) {
                // Not logged in
                setIsLiked(prevStatus);
                if (confirm("Inicia sesión para guardar tus canciones favoritas. ¿Ir al inicio de sesión?")) {
                    router.push('/signin');
                }
            } else if (!response.ok) {
                throw new Error("Failed to toggle like");
            } else {
                const data = await response.json();
                setIsLiked(data.isLiked);
                router.refresh(); // Refresh to update counts if visible
            }
        } catch (error) {
            console.error("Error toggling like:", error);
            setIsLiked(prevStatus);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={toggleLike}
            disabled={isLoading}
            className={`relative flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110 active:scale-95 ${className}`}
            title={isLiked ? "Quitar de favoritos" : "Añadir a favoritos"}
        >
            <AnimatePresence mode="wait">
                <motion.span
                    key={isLiked ? "liked" : "unliked"}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className={`material-symbols-outlined transition-colors ${isLiked ? "text-primary fill-1" : "text-white/40 hover:text-white"
                        }`}
                    style={{ fontSize: `${iconSize}px` }}
                >
                    favorite
                </motion.span>
            </AnimatePresence>
            {isLiked && (
                <motion.span
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 bg-primary/30 rounded-full scale-110"
                />
            )}
        </button>
    );
}
