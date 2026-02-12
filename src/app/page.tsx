"use client";

import Hero from "@/components/Hero";
import SongCard from "@/components/SongCard";
import RecommendationCard from "@/components/RecommendationCard";
import ActivityFeed from "@/components/ActivityFeed";
import MusicCarousel from "@/components/MusicCarousel";
import { useState, useEffect } from "react";
import { getCurrentUser, updatePreferencesFromSearch } from "@/lib/user-service";
import { getAllSongs, getRecommendedSongs, getTrendingSongs, getTopSongs, getSongRatings } from "@/lib/data-service";
import { Song, User } from "@/types";

export default function Home() {
  const [trends, setTrends] = useState<(Song & { rating?: number })[]>([]);
  const [recommended, setRecommended] = useState<(Song & { rating?: number })[]>([]);
  const [top10, setTop10] = useState<(Song & { rating?: number })[]>([]);
  const [discovery, setDiscovery] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        // Fetch parallel for performance
        const [recs, trendingList, topSongs, allSongs] = await Promise.all([
          getRecommendedSongs(currentUser?.preferences),
          getTrendingSongs(),
          getTopSongs(10),
          getAllSongs()
        ]);

        // Batch fetch ratings
        const allFetchedIds = Array.from(new Set([
          ...recs.map(s => s.id),
          ...trendingList.map(s => s.id),
          ...topSongs.map(s => s.id)
        ]));

        const ratingsMap = await getSongRatings(allFetchedIds);

        const attachRating = (list: Song[]) => list.map(s => ({
          ...s,
          rating: ratingsMap[s.id]?.avg || 0
        }));

        setRecommended(attachRating(recs));
        setTrends(attachRating(trendingList));
        setTop10(attachRating(topSongs));

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

          {/* Top 10 Ranking */}
          <section className="relative overflow-hidden mb-16 px-2">
            <div className="flex items-center gap-2 mb-10">
              <span className="material-symbols-outlined text-primary text-3xl">workspace_premium</span>
              <h2 className="text-white text-3xl font-black italic uppercase tracking-tighter">Top 10 Global</h2>
            </div>

            <MusicCarousel title="" icon={null}>
              {top10.map((song, index) => (
                <div key={song.id} className="relative group/top min-w-[280px] md:min-w-[320px] snap-start flex items-center gap-6 py-4">
                  <div className="absolute left-[-15px] top-[-10px] text-[120px] font-black text-white/5 italic select-none z-0 group-hover/top:text-primary/10 transition-colors">
                    {index + 1}
                  </div>
                  <div className="relative z-10 w-full pl-8">
                    <SongCard song={song} />
                  </div>
                </div>
              ))}
            </MusicCarousel>
          </section>

          {/* AI Recommended Section */}
          <MusicCarousel
            title="Recomendado para ti"
            subtitle="RKLES AI"
            icon={<span className="material-symbols-outlined text-blue-400">psychology</span>}
          >
            {recommended.map((song) => (
              <div key={song.id} className="min-w-[180px] md:min-w-[220px] snap-start">
                <SongCard song={song} />
              </div>
            ))}
          </MusicCarousel>

          {/* Trends Carousel */}
          <MusicCarousel
            title="Tendencias Ahora"
            icon={<span className="material-symbols-outlined text-red-500 animate-pulse">trending_up</span>}
          >
            {trends.map((song) => (
              <div key={song.id} className="min-w-[180px] md:min-w-[220px] snap-start">
                <SongCard song={song} />
              </div>
            ))}
          </MusicCarousel>

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
