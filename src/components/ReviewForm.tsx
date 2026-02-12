"use client";

import { useState } from "react";
import { Send } from "lucide-react";

import { User } from "@/types";

import { useRouter } from "next/navigation";

export default function ReviewForm({ songId, user }: { songId: string, user: User | null }) {
    const router = useRouter();
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [review, setReview] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!review.trim() || rating === 0) return;
        if (!user) {
            alert("Debes iniciar sesión para publicar una reseña.");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user: user.username,
                    avatar: user.avatar,
                    time: "Ahora mismo",
                    songId,
                    comment: review,
                    rating,
                    verified: true
                })
            });

            if (response.ok) {
                setReview("");
                setRating(0);
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 4000);

                // Refresh data without full reload to show the new review in the list
                router.refresh();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 md:p-8 shadow-2xl shadow-black/5 border border-gray-200 dark:border-border-dark relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500"></div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Añade tu voz</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Califica esta canción y comparte tu experiencia con la comunidad.</p>

            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                {!user && (
                    <div className="absolute inset-0 bg-white/40 dark:bg-black/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center p-8 text-center">
                        <div className="size-16 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4">
                            <span className="material-symbols-outlined text-4xl">lock</span>
                        </div>
                        <h4 className="text-xl font-bold text-white mb-2">Solo usuarios registrados</h4>
                        <p className="text-sm text-gray-400 mb-6 max-w-xs">Sé parte del cosmos. Regístrate para guardar favoritos, calificar canciones y comentar.</p>
                        <button
                            onClick={(e) => { e.preventDefault(); router.push('/signin'); }}
                            className="bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-8 rounded-full shadow-lg shadow-primary/20 transition-all active:scale-95"
                        >
                            Iniciar Sesión
                        </button>
                    </div>
                )}
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Tu Calificación</label>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className={`transition-all focus:outline-none ${(hover || rating) >= star ? 'text-yellow-400 scale-110' : 'text-slate-300 dark:text-slate-600'
                                    }`}
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(0)}
                                onClick={() => setRating(star)}
                                disabled={isSubmitting}
                            >
                                <span className={`material-symbols-outlined text-[36px] ${(hover || rating) >= star ? 'fill-1' : 'unfilled'}`}>
                                    star
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Tu Reseña</label>
                    <textarea
                        className="w-full bg-slate-50 dark:bg-background-dark border border-gray-200 dark:border-border-dark rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary min-h-[140px] text-slate-900 dark:text-white placeholder:text-slate-400 resize-none transition-shadow"
                        placeholder="¿Qué te gustó o que no te gustó de la producción, letra o vibra?"
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        disabled={isSubmitting}
                    ></textarea>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting || showSuccess}
                    className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 group/btn disabled:opacity-50 ${showSuccess ? 'bg-green-500 shadow-green-500/25' : 'bg-primary hover:bg-primary/90 shadow-primary/25 text-white'
                        }`}
                >
                    {showSuccess ? (
                        <>
                            <span className="material-symbols-outlined text-[18px]">check_circle</span>
                            <span>¡Publicado!</span>
                        </>
                    ) : (
                        <>
                            <span>{isSubmitting ? "Publicando..." : "Publicar Reseña"}</span>
                            <span className="material-symbols-outlined text-[18px] group-hover/btn:translate-x-1 transition-transform">send</span>
                        </>
                    )}
                </button>
            </form>
            <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4">
                Las reseñas son públicas y editables. <a className="hover:text-primary underline" href="#">Guía de comunidad</a>
            </p>
        </div>
    );
}
