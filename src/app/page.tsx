"use client";

import Hero from "@/components/Hero";
import SongCard from "@/components/SongCard";
import RecommendationCard from "@/components/RecommendationCard";
import HomeSkeleton from "@/components/HomeSkeleton";
import dynamic from 'next/dynamic';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, updatePreferencesFromSearch } from "@/lib/user-service";
import { getRecommendedSongs, getTrendingSongs, getTopSongs, getSongRatings, getRandomSong } from "@/lib/data-service";
import { Song, User } from "@/types";
import { getDisplayGenre } from "@/utils/genre-mappings";

const MusicCarousel = dynamic(() => import("@/components/MusicCarousel"), {
  loading: () => <div className="h-64 w-full animate-pulse bg-white/5 rounded-xl mb-8" />,
  ssr: false
});

const ActivityFeed = dynamic(() => import("@/components/ActivityFeed"), {
  loading: () => <div className="h-64 w-full animate-pulse bg-white/5 rounded-xl" />,
  ssr: false
});

export default function Home() {
  const router = useRouter();
  const [trends, setTrends] = useState<(Song & { rating?: number })[]>([]);
  const [recommended, setRecommended] = useState<(Song & { rating?: number })[]>([]);
  const [top10, setTop10] = useState<(Song & { rating?: number })[]>([]);
  const [discovery, setDiscovery] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedDecade, setSelectedDecade] = useState<string | null>(null);

  const [filterStats, setFilterStats] = useState<{ genres: Record<string, number>, decades: Record<string, number> } | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        // Fetch stats separately or in parallel
        const [recs, trendingList, topSongs, disc, stats] = await Promise.all([
          getRecommendedSongs({ ...currentUser?.preferences, genres: selectedGenre ? [selectedGenre] : currentUser?.preferences?.genres, decades: selectedDecade ? [selectedDecade] : currentUser?.preferences?.decades }),
          getTrendingSongs(),
          getTopSongs(10),
          getRandomSong(),
          import("@/lib/data-service").then(mod => mod.getFilterStats())
        ]);

        setFilterStats(stats);

        // Batch fetch ratings
        const allFetchedIds = Array.from(new Set([
          ...recs.map((s: Song) => s.id),
          ...trendingList.map((s: Song) => s.id),
          ...topSongs.map((s: Song) => s.id),
          ...(disc ? [disc.id] : [])
        ]));

        const ratingsMap = await getSongRatings(allFetchedIds);

        const attachRating = (list: Song[]) => list.map((s: Song) => ({
          ...s,
          rating: ratingsMap[s.id]?.avg || 0
        }));

        setRecommended(attachRating(recs));
        setTrends(attachRating(trendingList));
        setTop10(attachRating(topSongs));

        if (disc) {
          setDiscovery({
            ...disc,
            rating: ratingsMap[disc.id]?.avg || 0
          });
        }
      } catch (err) {
        console.error("Failed to fetch page data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedGenre, selectedDecade]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    await updatePreferencesFromSearch(query);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  if (loading && !filterStats) return <HomeSkeleton />;

  return (
    <div className="font-display text-slate-900 dark:text-white min-h-screen flex flex-col pt-10">
      <main className="flex-grow w-full px-4 md:px-6 py-8">
        <div className="max-w-[1400px] mx-auto flex flex-col gap-16">
          <Hero onSearch={handleSearch} />

          {/* Filters Bar */}
          <div className="flex flex-col gap-6 -mt-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mr-2">Géneros:</span>
              {filterStats && Object.entries(filterStats.genres)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 8) // Limit to top 8 on home
                .map(([genre, count]) => (
                  <button
                    key={genre}
                    onClick={() => setSelectedGenre(selectedGenre === genre ? null : genre)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${selectedGenre === genre
                      ? "bg-primary border-primary text-white shadow-lg shadow-primary/25"
                      : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
                      }`}
                  >
                    {getDisplayGenre(genre)}
                    <span className="text-[10px] opacity-50 ml-1">({count})</span>
                  </button>
                ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mr-2">Décadas:</span>
              {filterStats && Object.entries(filterStats.decades)
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([decade, count]) => (
                  <button
                    key={decade}
                    onClick={() => setSelectedDecade(selectedDecade === decade ? null : decade)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${selectedDecade === decade
                      ? "bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/25"
                      : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
                      }`}
                  >
                    {decade}
                    <span className="text-[10px] opacity-50 ml-1">({count})</span>
                  </button>
                ))}
            </div>
          </div>

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
            subtitle="KALA AI MUSIC"
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
