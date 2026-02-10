"use client";

import Hero from "@/components/Hero";
import SongCard from "@/components/SongCard";
import RecommendationCard from "@/components/RecommendationCard";
import ActivityFeed from "@/components/ActivityFeed";
import { useState, useEffect } from "react";

interface Song {
  id: string;
  track: string;
  artist: string;
  genre: string;
  youtubeId: string;
}

export default function Home() {
  const [trends, setTrends] = useState<Song[]>([]);
  const [recommendation, setRecommendation] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/songs?limit=10');
        const data = await res.json();
        setTrends(data.songs);

        // Pick a random song for discovery from the first 100 songs
        const discoRes = await fetch('/api/songs?page=2&limit=50');
        const discoData = await discoRes.json();
        if (discoData.songs.length > 0) {
          setRecommendation(discoData.songs[Math.floor(Math.random() * discoData.songs.length)]);
        } else {
          setRecommendation(data.songs[0]);
        }
      } catch (err) {
        console.error("Failed to fetch songs", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-hidden bg-background-dark text-slate-900 dark:text-white font-display transition-colors duration-300">
      {/* Background Ambient Gradients */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-[#2513ec]/20 via-[#121022]/50 to-transparent pointer-events-none z-0"></div>
      <div className="absolute top-[-200px] right-[-100px] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <div className="layout-container flex h-full grow flex-col z-10 px-4 md:px-10 lg:px-40 py-5">
        <main className="layout-content-container flex flex-col max-w-[1200px] flex-1">
          <Hero />

          {/* Trends Carousel */}
          <section className="mb-16">
            <div className="flex items-center justify-between px-2 pb-5">
              <h2 className="text-white text-2xl font-bold leading-tight tracking-[-0.015em]">Tendencias Ahora</h2>
              <div className="flex gap-2">
                <button className="size-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 text-white transition">
                  <span className="material-symbols-outlined !text-sm">arrow_back</span>
                </button>
                <button className="size-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 text-white transition">
                  <span className="material-symbols-outlined !text-sm">arrow_forward</span>
                </button>
              </div>
            </div>

            <div className="flex w-full overflow-x-auto pb-4 gap-6 no-scrollbar">
              {loading ? (
                // Loading skeleton placeholders
                Array(6).fill(0).map((_, i) => (
                  <div key={i} className="min-w-[160px] animate-pulse">
                    <div className="w-full aspect-square bg-white/5 rounded-2xl mb-3"></div>
                    <div className="h-4 bg-white/5 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-white/5 rounded w-1/2"></div>
                  </div>
                ))
              ) : (
                trends.map((song) => (
                  <div key={song.id} className="min-w-[160px]">
                    <SongCard song={song} />
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Main Content Grid: Recommendation + Activity Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
            {recommendation && <RecommendationCard song={recommendation} />}
            <ActivityFeed />
          </div>
        </main>
      </div>

      {/* Nebula Visual Accent */}
      <div className="fixed bottom-0 left-0 w-full h-[30vh] bg-gradient-to-t from-primary/10 to-transparent pointer-events-none -z-10" />
    </div>
  );
}
