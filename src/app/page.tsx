"use client";

import Hero from "@/components/Hero";
import SongCard from "@/components/SongCard";
import RecommendationCard from "@/components/RecommendationCard";
import ActivityFeed from "@/components/ActivityFeed";
import { useState, useEffect } from "react";
import { getCurrentUser, updatePreferencesFromSearch } from "@/lib/user-service";
import { getAllSongs, getRecommendedSongs } from "@/lib/data-service";
import { Song, User } from "@/types";

export default function Home() {
  const [trends, setTrends] = useState<Song[]>([]);
  const [recommended, setRecommended] = useState<Song[]>([]);
  const [discovery, setDiscovery] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        const allSongs = await getAllSongs();
        setTrends(allSongs.slice(0, 10));

        // Get AI Recommendations
        const recs = await getRecommendedSongs(currentUser?.preferences);
        setRecommended(recs);

        // Discovery (Random)
        if (allSongs.length > 0) {
          setDiscovery(allSongs[Math.floor(Math.random() * allSongs.length)]);
        }
      } catch (err) {
        console.error("Failed to fetch page data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    // Track search to update vector preferences
    await updatePreferencesFromSearch(query);
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-hidden bg-background-dark text-slate-900 dark:text-white font-display transition-colors duration-300">
      {/* Background Ambient Gradients */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-[#2513ec]/20 via-[#121022]/50 to-transparent pointer-events-none z-0"></div>
      <div className="absolute top-[-200px] right-[-100px] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <div className="layout-container flex h-full grow flex-col z-10 px-4 md:px-10 lg:px-40 py-5">
        <main className="layout-content-container flex flex-col max-w-[1200px] flex-1">
          <Hero onSearch={handleSearch} />

          {/* AI Recommended Section */}
          {recommended.length > 0 && (
            <section className="mb-16">
              <div className="flex items-center justify-between px-2 pb-5">
                <div className="flex items-center gap-2">
                  <h2 className="text-white text-2xl font-bold leading-tight tracking-[-0.015em]">Recomendado para ti</h2>
                  <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary/30 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">sparkles</span>
                    AI
                  </span>
                </div>
              </div>

              <div className="flex w-full overflow-x-auto pb-4 gap-6 no-scrollbar">
                {recommended.map((song) => (
                  <div key={song.id} className="min-w-[160px]">
                    <SongCard song={song} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Trends Carousel */}
          <section className="mb-16">
            <div className="flex items-center justify-between px-2 pb-5">
              <h2 className="text-white text-2xl font-bold leading-tight tracking-[-0.015em]">Tendencias Ahora</h2>
            </div>

            <div className="flex w-full overflow-x-auto pb-4 gap-6 no-scrollbar">
              {loading ? (
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

          {/* Main Content Grid: Discovery + Activity Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
            {discovery && <RecommendationCard song={discovery} />}
            <ActivityFeed />
          </div>
        </main>
      </div>

      {/* Nebula Visual Accent */}
      <div className="fixed bottom-0 left-0 w-full h-[30vh] bg-gradient-to-t from-primary/10 to-transparent pointer-events-none -z-10" />
    </div>
  );
}
