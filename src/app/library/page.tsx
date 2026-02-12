import Sidebar from "@/components/Sidebar";
import SongCard from "@/components/SongCard";
import { getLikedSongs } from "@/lib/data-service";
import { getCurrentUserServer as getCurrentUser } from "@/lib/user-service-server";

export default async function LibraryPage() {
    const user = await getCurrentUser();
    const likedSongs = user ? await getLikedSongs(user.id) : [];

    return (
        <div className="flex min-h-screen bg-background-dark text-white">
            <Sidebar user={user} />

            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="pt-10 px-10 pb-6 flex flex-col gap-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-black tracking-tight text-white">Mi Universo</h1>
                            <p className="text-gray-400 mt-1">Tu colección personal de sonidos cósmicos.</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex justify-start border-b border-white/5 pb-4">
                        <button className="px-6 py-2 rounded-full bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20">
                            Canciones Guardadas
                        </button>
                        <button className="px-6 py-2 rounded-full text-gray-400 text-sm font-bold hover:text-white transition-colors">
                            Álbumes Favoritos
                        </button>
                    </div>
                </header>

                <section className="flex-1 overflow-y-auto px-10 pb-32">
                    {likedSongs.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {likedSongs.map(song => (
                                <SongCard key={song.id} song={song} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500 border border-dashed border-white/10 rounded-2xl bg-white/5">
                            <span className="material-symbols-outlined text-4xl mb-4 opacity-50">favorite_border</span>
                            <p className="text-lg font-medium">Aún no has guardado ninguna canción.</p>
                            <p className="text-sm">Explora el universo y dale "Me Gusta" a lo que encuentres.</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
