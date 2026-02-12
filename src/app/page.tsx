"use client";

import Hero from "@/components/Hero";
import SongCard from "@/components/SongCard";
import RecommendationCard from "@/components/RecommendationCard";
import ActivityFeed from "@/components/ActivityFeed";
import MusicCarousel from "@/components/MusicCarousel";
import HomeSkeleton from "@/components/HomeSkeleton";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, updatePreferencesFromSearch } from "@/lib/user-service";
import { getAllSongs, getRecommendedSongs, getTrendingSongs, getTopSongs, getSongRatings } from "@/lib/data-service";
import { Song, User } from "@/types";

export default function Home() {
  const router = useRouter();
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

        const recsWithRatings = attachRating(recs);
        const trendsWithRatings = attachRating(trendingList);
        const topWithRatings = attachRating(topSongs);
        const allSongsWithRatings = attachRating(allSongs);

        setRecommended(recsWithRatings);
        setTrends(trendsWithRatings);
        setTop10(topWithRatings);

        // Discovery (Random) - Ensure it has rating!
        if (allSongsWithRatings.length > 0) {
          setDiscovery(allSongsWithRatings[Math.floor(Math.random() * allSongsWithRatings.length)]);
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
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  if (loading) return <HomeSkeleton />;

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white min-h-screen flex flex-col pt-10">
      <main className="flex-grow w-full px-4 md:px-6 py-8">
        <div className="max-w-[1400px] mx-auto flex flex-col gap-16">
          <Hero onSearch={handleSearch} />

          {/* Main Content Grid: Discovery + Activity Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {discovery && (
              <RecommendationCard
                key={discovery.id}
                song={discovery}
                onNext={() => {
                  // Play a random recommended song next, ensuring it's different
                  const remaining = recommended.filter(s => s.id !== discovery.id);
                  const next = remaining.length > 0
                    ? remaining[Math.floor(Math.random() * remaining.length)]
                    : recommended[0]; // Fallback if only 1 song
                  setDiscovery(next);
                }}
              />
            )}
            <ActivityFeed />
          </div>

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

          {/* Top 10 Ranking */}
          <section className="relative">
            <div className="flex items-center gap-2 mb-10">
              <span className="material-symbols-outlined text-primary text-3xl">workspace_premium</span>
              <h2 className="text-white text-3xl font-black italic uppercase tracking-tighter">Top 10 Global</h2>
            </div>

            <MusicCarousel title="" icon={null}>
              {top10.map((song, index) => (
                <div key={song.id} className="relative group/top min-w-[280px] md:min-w-[320px] snap-start flex items-center gap-6 py-4 pl-6">
                  <div className="absolute left-[-5px] top-[-15px] text-[120px] font-black text-white/10 italic select-none z-0 group-hover/top:text-primary/20 transition-colors pointer-events-none">
                    {index + 1}
                  </div>
                  <div className="relative z-10 w-full pl-12">
                    <SongCard song={song} />
                  </div>
                </div>
              ))}
            </MusicCarousel>
          </section>

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

        </div>
      </main>

      {/* Nebula Visual Accent */}
      <div className="fixed bottom-0 left-0 w-full h-[30vh] bg-gradient-to-t from-primary/10 to-transparent pointer-events-none -z-10" />
    </div >
  );
}
