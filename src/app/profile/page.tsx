export const dynamic = 'force-dynamic';
import { getCurrentUserServer as getCurrentUser } from "@/lib/user-service-server";
import { getReviewsByUser } from "@/lib/data-service";
import Link from "next/link";
import ReviewList from "@/components/ReviewList";
import { User } from "@/types";

export default async function ProfilePage() {
    const user = await getCurrentUser();
    const reviews = user ? await getReviewsByUser(user.username) : [];

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-dark text-white">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">Usuario no encontrado</h1>
                    <Link href="/" className="text-primary hover:underline">Volver al inicio</Link>
                </div>
            </div>
        );
    }

    // Calculate stats
    const totalReviews = reviews.length;
    // Simple logic to find favorite genre from preferences
    const favGenre = user.preferences?.genres?.length ? user.preferences.genres[0] : "Explorador";
    const joinedYear = new Date(user.joined).getFullYear();

    return (
        <main className="min-h-screen pt-24 pb-20 px-6 max-w-5xl mx-auto bg-background-dark">
            {/* Profile Header */}
            <section className="flex flex-col items-center justify-center pt-8 pb-10">
                <div className="relative group">
                    <div className="h-32 w-32 rounded-full overflow-hidden ring-4 ring-white/5 shadow-2xl relative">
                        <img
                            src={user.avatar}
                            alt={user.username}
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <Link href="/settings" className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-110">
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                    </Link>
                </div>
                <h1 className="mt-6 text-3xl font-bold tracking-tight text-white">{user.username}</h1>
                <p className="mt-2 text-sm text-primary font-medium">@{user.handle}</p>
                <p className="mt-4 max-w-lg text-center text-base text-gray-400 leading-relaxed">
                    {user.bio}
                </p>
            </section>

            {/* Statistics */}
            <section className="border-y border-white/5 py-6 mb-12">
                <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-center">
                    <div className="group cursor-default">
                        <span className="block text-2xl font-bold text-white group-hover:text-primary transition-colors">{totalReviews}</span>
                        <span className="text-xs uppercase tracking-widest text-gray-500 font-bold">Reseñas</span>
                    </div>
                    <div className="h-8 w-px bg-white/10 hidden sm:block"></div>
                    <div className="group cursor-default">
                        <span className="block text-2xl font-bold text-white group-hover:text-primary transition-colors">{favGenre}</span>
                        <span className="text-xs uppercase tracking-widest text-gray-500 font-bold">Género Fav</span>
                    </div>
                    <div className="h-8 w-px bg-white/10 hidden sm:block"></div>
                    <div className="group cursor-default">
                        <span className="block text-2xl font-bold text-white">{joinedYear}</span>
                        <span className="text-xs uppercase tracking-widest text-gray-500 font-bold">Miembro desde</span>
                    </div>
                </div>
            </section>

            {/* Recent Activity */}
            <section>
                <div className="flex items-center justify-between mb-6 px-2">
                    <h2 className="text-xl font-bold text-white tracking-tight">Actividad Reciente</h2>
                </div>

                {reviews.length > 0 ? (
                    <ReviewList reviews={reviews} />
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        <p>Aún no has escrito ninguna reseña.</p>
                        <Link href="/" className="text-primary hover:underline mt-2 inline-block">Explorar música</Link>
                    </div>
                )}
            </section>
        </main>
    );
}
