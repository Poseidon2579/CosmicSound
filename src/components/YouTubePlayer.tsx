"use client";

import { useEffect, useRef } from "react";
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

export default function YouTubePlayer({ youtubeId, nextSongId }: YouTubePlayerProps) {
    const playerRef = useRef<any>(null);
    const router = useRouter();
    const iframeId = `yt-player-${youtubeId}`;

    useEffect(() => {
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
            // Auto play is already handled by URL param, but we can double check
            event.target.playVideo();
        };

        const onPlayerStateChange = (event: any) => {
            // YT.PlayerState.ENDED is 0
            if (event.data === 0) {
                if (onEnd) {
                    onEnd();
                } else if (nextSongId) {
                    console.log("Song ended, moving to next:", nextSongId);
                    router.push(`/track/${nextSongId}`);
                }
            }
        };

        const initPlayer = () => {
            playerRef.current = new window.YT.Player(iframeId, {
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
                playerRef.current.destroy();
            }
        };
    }, [youtubeId, nextSongId, router, iframeId]);

    return (
        <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl bg-surface-dark group border border-white/5">
            <iframe
                id={iframeId}
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${youtubeId}?enablejsapi=1&autoplay=1&rel=0&modestbranding=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="relative z-10"
            ></iframe>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none z-20"></div>
        </div>
    );
}
