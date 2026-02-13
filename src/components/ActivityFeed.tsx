import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useAnimationControls } from "framer-motion";

interface Review {
    user: string;
    avatar: string;
    time: string;
    songId: string;
    comment: string;
    rating: number;
}

interface Song {
    id: string;
    track: string;
    artist: string;
    youtubeId: string;
}

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex text-yellow-500">
            {[...Array(5)].map((_, i) => {
                const starValue = i + 1;
                let iconName = "star";
                let isFilled = false;

                if (rating >= starValue) {
                    iconName = "star";
                    isFilled = true;
                } else if (rating >= starValue - 0.5) {
                    iconName = "star_half";
                    isFilled = true;
                } else {
                    iconName = "star";
                    isFilled = false;
                }

                return (
                    <span key={i} className={`material-symbols-outlined text-[16px] ${isFilled ? 'fill-1' : ''}`}>
                        {iconName}
                    </span>
                );
            })}
        </div>
    );
}

export default function ActivityFeed() {
    const [feedItems, setFeedItems] = useState<Review[]>([]);
    const [songs, setSongs] = useState<Record<string, Song>>({});
    const containerRef = useRef<HTMLDivElement>(null);
    const controls = useAnimationControls();

    useEffect(() => {
        async function fetchActivity() {
            try {
                const res = await fetch('/api/reviews?mode=recent');
                const data = await res.json();
                setFeedItems(data);

                // Fetch song details for these items
                const songData: Record<string, Song> = {};
                for (const item of data) {
                    if (!songs[item.songId]) {
                        const songRes = await fetch(`/api/songs?id=${item.songId}`);
                        const sData = await songRes.json();
                        if (sData.songs && sData.songs.length > 0) {
                            songData[item.songId] = sData.songs[0];
                        }
                    }
                }
                setSongs(prev => ({ ...prev, ...songData }));
            } catch (err) {
                console.error("Failed to fetch activity", err);
            }
        }
        fetchActivity();
    }, []);

    // Double the items for seamless animation loop
    const doubledItems = [...feedItems, ...feedItems];

    return (
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-5">
            <div className="flex items-center justify-between">
                <h2 className="text-white text-xl font-bold leading-tight tracking-[-0.015em]">Actividad Reciente</h2>
                <a className="text-primary text-xs font-bold hover:underline" href="#">Ver Todo</a>
            </div>

            <div
                className="relative h-[480px] overflow-hidden"
                style={{ maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)' }}
            >
                <motion.div
                    className="flex flex-col gap-4"
                    animate={{
                        y: feedItems.length > 0 ? ["0%", "-50%"] : 0
                    }}
                    transition={{
                        duration: feedItems.length * 5, // Slow speed relative to count
                        ease: "linear",
                        repeat: Infinity
                    }}
                >
                    {doubledItems.length > 0 ? doubledItems.map((item, i) => (
                        <div key={i} className="p-4 rounded-xl bg-gradient-to-br from-surface-dark to-transparent border border-white/5 hover:border-white/10 transition-colors group shrink-0">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <img className="size-8 rounded-full object-cover ring-2 ring-primary/20" alt={item.user} src={item.avatar} />
                                    <div>
                                        <p className="text-sm text-white font-semibold">{item.user}</p>
                                        <p className="text-[10px] text-gray-500">{item.time}</p>
                                    </div>
                                </div>
                                <StarRating rating={item.rating} />
                            </div>
                            <p className="text-xs text-primary font-medium mb-1 truncate">
                                {songs[item.songId] ? (
                                    <>
                                        En <Link href={`/track/${item.songId}`} className="hover:underline">"{songs[item.songId].track}"</Link>
                                    </>
                                ) : (
                                    `Cargando canción...`
                                )}
                            </p>
                            <p className="text-sm text-gray-300 leading-snug">
                                {item.comment}
                            </p>
                        </div>
                    )) : (
                        <p className="text-gray-500 text-sm italic py-4">Cargando actividad...</p>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
