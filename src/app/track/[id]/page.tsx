export const dynamic = 'force-dynamic';
import Link from "next/link";
import { notFound } from "next/navigation";
import ReviewForm from "@/components/ReviewForm";
import { getAllSongs, getReviewsForSong, getLikedSongs } from "@/lib/data-service";
import { getCurrentUserServer as getCurrentUser } from "@/lib/user-service-server";
import { Song } from "@/types";
import FavoriteButton from "@/components/FavoriteButton";
import YouTubePlayer from "@/components/YouTubePlayer";

export default async function TrackPage({ params, searchParams }: { params: { id: string }, searchParams: { playlist?: string } }) {
    const user = await getCurrentUser();
    const isFavoritePlaylist = searchParams.playlist === 'favorites' && user;

    let songs: Song[] = [];
    if (isFavoritePlaylist) {
        songs = await getLikedSongs(user.id);
    }

    // If not in favorites or favorites is empty/doesn't contain requested song, fallback to all
    if (songs.length === 0 || !songs.find(s => s.id === params.id)) {
        songs = await getAllSongs();
    }

    const songIndex = songs.findIndex((s) => s.id === params.id);
    const song = songs[songIndex];
    if (!song) return notFound();

    const nextSong = songs[(songIndex + 1) % songs.length];
    const reviews = await getReviewsForSong(params.id);

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white min-h-screen flex flex-col pt-10">
            <main className="flex-grow w-full px-4 md:px-6 py-8">
                <div className="max-w-[1080px] mx-auto flex flex-col gap-10">

                    {/* Reproductor de Video */}
                    <section className="w-full">
                        <YouTubePlayer youtubeId={song.youtubeId} nextSongId={nextSong.id} />
                    </section>

                    {/* Información y Rating */}
                    <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
                        <div className="lg:col-span-7 flex flex-col gap-8">
                            <div className="flex flex-col gap-2 relative">
                                <div className="flex items-center justify-between gap-4">
                                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                                        {song.track}
                                    </h1>
                                    <FavoriteButton
                                        songId={song.id}
                                        iconSize={32}
                                        className="size-14 bg-white/5 backdrop-blur-sm border border-white/10 shrink-0"
                                    />
                                </div>
                                <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
                                    Explorando el universo sonoro de {song.artist}.
                                </p>
                            </div>

                            <div className="flex flex-col border-t border-gray-200 dark:border-border-dark">
                                <DetailItem label="Artista" icon="artist">
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary overflow-hidden">
                                            <span className="material-symbols-outlined">person</span>
                                        </div>
                                        <span className="text-base md:text-lg font-medium text-slate-900 dark:text-white">{song.artist}</span>
                                    </div>
                                </DetailItem>

                                <DetailItem label="Álbum" icon="album">
                                    <span className="text-base md:text-lg font-medium text-slate-900 dark:text-white">{song.album}</span>
                                </DetailItem>

                                <DetailItem label="Estadísticas" icon="trending_up">
                                    <div className="flex gap-4">
                                        <span className="text-sm font-medium text-slate-500"><span className="text-white font-bold">{song.views.toLocaleString()}</span> vistas</span>
                                        <span className="text-sm font-medium text-slate-500"><span className="text-white font-bold">{song.likes.toLocaleString()}</span> likes</span>
                                    </div>
                                </DetailItem>

                                <DetailItem label="Género" icon="genre">
                                    <div className="flex gap-2 flex-wrap">
                                        <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-surface-dark text-xs font-semibold text-slate-600 dark:text-slate-300">
                                            {song.genre}
                                        </span>
                                    </div>
                                </DetailItem>
                            </div>
                        </div>

                        {/* Rating de la Comunidad */}
                        <div className="lg:col-span-5 bg-slate-50 dark:bg-surface-dark/50 rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-border-dark">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Calificación</h3>
                                <button className="text-sm font-medium text-primary hover:underline">Escribir reseña</button>
                            </div>
                            <div className="flex items-end gap-4 mb-8">
                                <span className="text-6xl font-black text-slate-900 dark:text-white leading-none tracking-tight">
                                    {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : "0.0"}
                                </span>
                                <div className="flex flex-col gap-1 pb-1">
                                    <div className="flex text-yellow-400 gap-0.5">
                                        {[1, 2, 3, 4, 5].map(i => <span key={i} className="material-symbols-outlined text-[20px]">star</span>)}
                                    </div>
                                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{reviews.length} reseñas</span>
                                </div>
                            </div>
                            <RatingBars reviews={reviews} />
                        </div>
                    </section>

                    {/* IA Opinion y Reseñas */}
                    <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start pt-8 border-t border-gray-200 dark:border-border-dark">
                        <div className="lg:col-span-7 flex flex-col gap-10">
                            {/* Resumen IA */}
                            <div className="relative overflow-hidden rounded-3xl p-8 bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl group transition-all hover:bg-white/[0.07]">
                                <div className="absolute top-0 right-0 p-6 opacity-[0.05] pointer-events-none group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-9xl text-primary">psychology</span>
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="flex items-center justify-center size-10 rounded-full bg-primary/20 text-primary animate-pulse">
                                            <span className="material-symbols-outlined text-[24px]">auto_awesome</span>
                                        </div>
                                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary">Análisis del Cosmos (IA)</h3>
                                    </div>
                                    <p className="text-slate-300 leading-loose text-lg md:text-xl font-medium">
                                        <span className="text-white">"{song.track}"</span> es una obra estelar de <span className="text-white">{song.artist}</span>.
                                        Con <span className="text-primary font-bold">{song.views.toLocaleString()}</span> señales captadas en el vacío,
                                        su estructura armónica sugiere una resonancia única en este cuadrante musical.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-black text-white tracking-tight">{reviews.length} Reseñas</h3>
                            </div>

                            {/* Lista de Reseñas */}
                            <div className="flex flex-col gap-8">
                                {reviews.length > 0 ? reviews.map((review, i) => (
                                    <ReviewItem
                                        key={i}
                                        user={review.user}
                                        avatar={review.avatar}
                                        time={review.time}
                                        rating={review.rating}
                                        content={review.comment}
                                    />
                                )) : (
                                    <div className="py-12 px-6 rounded-2xl bg-white/5 border border-dashed border-white/10 text-center">
                                        <p className="text-gray-500 italic">No hay reseñas para esta canción aún. ¡Sé el primero!</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="lg:col-span-5 flex flex-col gap-6 sticky top-24">
                            <ReviewForm songId={params.id} user={await getCurrentUser()} />
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}

function DetailItem({ label, icon, children }: { label: string, icon: string, children: React.ReactNode }) {
    return (
        <div className="grid grid-cols-[100px_1fr] md:grid-cols-[140px_1fr] py-5 border-b border-gray-200 dark:border-border-dark items-center">
            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">{label}</span>
            {children}
        </div>
    );
}

function ReviewItem({ user, avatar, time, rating, content }: any) {
    return (
        <div className="flex flex-col gap-5 p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <img
                        src={avatar}
                        alt={user}
                        className="size-12 rounded-full object-cover ring-2 ring-primary/20 shadow-lg"
                    />
                    <div>
                        <h4 className="text-base font-bold text-white leading-none mb-1">{user}</h4>
                        <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Oyente Verificado • {time}</span>
                    </div>
                </div>
                <div className="flex text-yellow-400 gap-0.5">
                    {[...Array(5)].map((_, i) => (
                        <span key={i} className={`material-symbols-outlined text-[18px] ${i < rating ? 'fill-1' : 'text-white/10'}`}>star</span>
                    ))}
                </div>
            </div>
            <p className="text-slate-300 text-base leading-relaxed">{content}</p>
        </div>
    );
}

function RatingBars({ reviews }: { reviews: any[] }) {
    const bars = [5, 4, 3, 2, 1].map(star => {
        const count = reviews.filter(r => Math.round(r.rating) === star).length;
        const perc = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
        return { label: star.toString(), val: Math.round(perc) };
    });

    return (
        <div className="flex flex-col gap-3">
            {bars.map(bar => (
                <div key={bar.label} className="flex items-center gap-4 text-sm">
                    <span className="w-3 text-right font-bold text-slate-700 dark:text-slate-300">{bar.label}</span>
                    <div className="flex-1 h-2 bg-slate-200 dark:bg-border-dark rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary rounded-full transition-all duration-1000"
                            style={{ width: `${bar.val}%` }}
                        ></div>
                    </div>
                    <span className="w-9 text-right text-slate-500 dark:text-slate-400">{bar.val}%</span>
                </div>
            ))}
        </div>
    );
}
