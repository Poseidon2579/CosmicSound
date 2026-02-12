"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import FavoriteButton from "./FavoriteButton";

interface Song {
    id: string;
    track: string;
    artist: string;
    genre: string;
    youtubeId: string;
    rating?: number;
}

export default function SongCard({ song }: { song: Song }) {
    // YouTube high-quality thumbnails are consistent for most popular videos in this dataset
    const [imgSrc, setImgSrc] = useState(`https://img.youtube.com/vi/${song.youtubeId}/hqdefault.jpg`);
    const [hasError, setHasError] = useState(false);

    // Like System
    const [isLiked, setIsLiked] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    // Check like status on component mount
    useEffect(() => {
        const checkLikeStatus = async () => {
            try {
                const response = await fetch(`/api/likes?songId=${song.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setIsLiked(data.isLiked);
                } else {
                    // console.error("Failed to fetch like status");
                    setIsLiked(false);
                }
            } catch (error) {
                console.error("Error checking like status:", error);
                setIsLiked(false);
            }
        };

        checkLikeStatus();
    }, [song.id]);

    const toggleLike = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setIsAnimating(true); // Start animation

        try {
            const response = await fetch('/api/likes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ songId: song.id }),
            });

            if (response.ok) {
                const data = await response.json();
                setIsLiked(data.isLiked); // Toggle the like status based on server response
            } else {
                console.error("Failed to toggle like status");
            }
        } catch (error) {
            console.error("Error toggling like status:", error);
        } finally {
            // End animation after a short delay to allow visual feedback
            setTimeout(() => setIsAnimating(false), 300);
        }
    };

    const handleError = () => {
        if (!hasError) {
            setImgSrc(`https://img.youtube.com/vi/${song.youtubeId}/0.jpg`);
            setHasError(true);
        }
    };

    return (
        <Link href={`/track/${song.id}`}>
            <div className="group flex flex-col gap-3 cursor-pointer relative">
                <div className="w-full aspect-square rounded-2xl overflow-hidden relative shadow-lg bg-surface-dark border border-white/5">
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all z-10 flex items-center justify-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileHover={{ scale: 1.1 }}
                            className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white"
                        >
                            <Play size={24} fill="white" />
                        </motion.div>
                    </div>
                    <img
                        src={imgSrc}
                        alt={song.track}
                        onError={handleError}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Favorite Button */}
                    <FavoriteButton
                        songId={song.id}
                        initialLiked={isLiked}
                        className="absolute top-2 right-2 z-20 size-9 bg-black/40 backdrop-blur-md opacity-0 group-hover:opacity-100"
                    />
                </div>
                <div className="flex flex-col gap-0.5">
                    <p className="text-white text-sm font-semibold leading-tight line-clamp-1 group-hover:text-primary transition-colors">{song.track}</p>
                    <div className="flex items-center justify-between mt-1">
                        <p className="text-gray-500 text-[11px] truncate max-w-[70%]">{song.artist}</p>
                        {song.rating !== undefined && (
                            <div className="flex text-yellow-500 gap-0.5 items-center">
                                <span className="material-symbols-outlined text-[12px] fill-1">star</span>
                                <span className="text-[10px] font-bold text-gray-400">{song.rating.toFixed(1)}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
