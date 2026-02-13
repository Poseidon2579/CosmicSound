"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface YouTubePlayerProps {
    youtubeId: string;
    nextSongId?: string;
    onEnd?: () => void;
}

declare global {
    interface Window {
        onYouTubeIframeAPIReady: () => void;
        YT: any;
    }
}

export default function YouTubePlayer({ youtubeId, nextSongId, onEnd }: YouTubePlayerProps) {
    const playerRef = useRef<any>(null);
    const router = useRouter();
    const iframeId = `yt-player-${youtubeId}`;
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (!isLoaded) return;

        // Load YouTube API script if not already loaded
        if (!window.YT) {
            const tag = document.createElement("script");
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName("script")[0];
            if (firstScriptTag.parentNode) {
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            }
        }

        const onPlayerReady = (event: any) => {
            event.target.playVideo();
        };

        const onPlayerStateChange = (event: any) => {
            if (event.data === 0) { // ENDED
                console.log("Song finished, triggering next...");
                if (onEnd) {
                    onEnd();
                } else if (nextSongId) {
                    router.push(`/track/${nextSongId}`);
                }
            }
        };

        const initPlayer = () => {
            if (!window.YT || !window.YT.Player) return;
            // Destroy existing instance if any (safety check)
            if (playerRef.current) {
                try { playerRef.current.destroy(); } catch (e) { }
            }

            playerRef.current = new window.YT.Player(iframeId, {
                height: '100%',
                width: '100%',
                videoId: youtubeId,
                playerVars: {
                    autoplay: 1,
                    modestbranding: 1,
                    rel: 0,
                },
                events: {
                    onReady: onPlayerReady,
                    onStateChange: onPlayerStateChange,
                },
            });
        };

        if (window.YT && window.YT.Player) {
            initPlayer();
        } else {
            window.onYouTubeIframeAPIReady = initPlayer;
        }

        return () => {
            if (playerRef.current) {
                try { playerRef.current.destroy(); } catch (e) { }
            }
        };
    }, [youtubeId, nextSongId, router, iframeId, isLoaded, onEnd]);

    if (!isLoaded) {
        return (
            <div
                className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl bg-surface-dark group border border-white/5 cursor-pointer"
                onClick={() => setIsLoaded(true)}
                role="button"
                aria-label="Play video"
            >
                {/* Thumbnail */}
                <img
                    src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
                    alt="Video thumbnail"
                    className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                />

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="size-16 bg-primary/90 text-white rounded-full flex items-center justify-center p-4 shadow-[0_0_30px_rgba(59,130,246,0.5)] group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm">
                        <span className="material-symbols-outlined !text-[32px] ml-1">play_arrow</span>
                    </div>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
            </div>
        );
    }

    return (
        <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black border border-white/5">
            <div id={iframeId} className="w-full h-full" />
        </div>
    );
}
