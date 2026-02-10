"use client";

interface Song {
    id: string;
    track: string;
    artist: string;
    genre: string;
    youtubeId: string;
}

export default function RecommendationCard({ song }: { song: Song }) {
    if (!song) return null;

    return (
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-5">
            <h2 className="text-white text-2xl font-bold leading-tight tracking-[-0.015em] flex items-center gap-3">
                <span className="material-symbols-outlined text-primary !text-[24px]">auto_awesome</span>
                Recomendación del Día
            </h2>
            <div className="relative overflow-hidden rounded-xl border border-white/5 bg-surface-dark p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start md:items-center">
                {/* Background Glow for Card */}
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/10 blur-[80px] rounded-full pointer-events-none"></div>
                <div className="relative group shrink-0 w-full md:w-[240px]">
                    <img
                        className="w-full aspect-square object-cover rounded-xl shadow-2xl group-hover:scale-[1.02] transition-transform duration-500"
                        alt={song.track}
                        src={`https://img.youtube.com/vi/${song.youtubeId}/hqdefault.jpg`}
                    />
                    <button className="absolute inset-0 m-auto size-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-110">
                        <span className="material-symbols-outlined !text-3xl fill-1">play_arrow</span>
                    </button>
                </div>
                <div className="flex flex-col gap-4 relative z-10">
                    <div className="flex items-center gap-3">
                        <span className="bg-primary/20 text-primary border border-primary/20 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Elección IA</span>
                        <span className="text-gray-400 text-xs">Basado en lo que has escuchado recientemente</span>
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-white leading-tight">{song.track}</h3>
                        <p className="text-lg text-gray-300 font-medium">por {song.artist}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 border border-white/5 mt-2">
                        <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-1">
                            <span className="material-symbols-outlined !text-sm text-yellow-400">lightbulb</span>
                            Por qué te gustará
                        </h4>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Esta pista de {song.genre} encaja con tu interés en paisajes sonoros cósmicos y melodías atmosféricas. Creemos que apreciarás la calidad de la producción.
                        </p>
                    </div>
                    <div className="flex gap-4 mt-2">
                        <button className="flex-1 bg-white text-black font-bold text-sm py-2.5 px-4 rounded hover:bg-gray-200 transition-colors">Reproducir Ahora</button>
                        <button className="size-10 flex items-center justify-center rounded border border-white/10 text-white hover:bg-white/10 transition-colors">
                            <span className="material-symbols-outlined !text-[20px]">favorite</span>
                        </button>
                        <button className="size-10 flex items-center justify-center rounded border border-white/10 text-white hover:bg-white/10 transition-colors">
                            <span className="material-symbols-outlined !text-[20px]">playlist_add</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
