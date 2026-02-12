"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Sparkles, Rocket } from "lucide-react";
import { updateUserPassword } from "@/lib/auth-service";

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        setIsLoading(true);
        setError("");
        setSuccess("");

        try {
            await updateUserPassword(password);
            setSuccess("¡Contraseña actualizada con éxito! Redirigiendo...");
            setTimeout(() => {
                router.push("/signin");
            }, 2000);
        } catch (err: any) {
            setError(err.message || "No se pudo actualizar la contraseña.");
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-background-dark font-display text-white overflow-x-hidden min-h-screen relative">
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="star-field"></div>
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 blur-[150px] rounded-full"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-500/10 blur-[150px] rounded-full"></div>
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <header className="flex items-center justify-between px-8 py-8 max-w-7xl mx-auto w-full">
                    <div className="flex items-center gap-3">
                        <div className="size-8 text-primary">
                            <Rocket className="w-full h-full" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight uppercase">CosmicSound</h1>
                    </div>
                </header>

                <main className="flex-1 flex flex-col items-center justify-center p-6">
                    <section className="w-full max-w-md mx-auto space-y-10 py-12">
                        <div className="text-center space-y-3">
                            <h2 className="text-4xl font-bold tracking-tight">Set New Resonance</h2>
                            <p className="text-white/40 text-sm font-medium">Re-define your access key to the universe.</p>
                        </div>

                        <div className="glass-card rounded-2xl p-10 shadow-2xl space-y-8">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs py-3 px-4 rounded-xl text-center">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="bg-green-500/10 border border-green-500/20 text-green-500 text-xs py-3 px-4 rounded-xl text-center">
                                    {success}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <label htmlFor="password" className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 ml-4">New Password</label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-full px-6 py-4 pl-12 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-white/10 text-sm"
                                            placeholder="••••••••"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-white/20" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="confirmPassword" className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 ml-4">Confirm New Password</label>
                                    <div className="relative">
                                        <input
                                            id="confirmPassword"
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-full px-6 py-4 pl-12 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-white/10 text-sm"
                                            placeholder="••••••••"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-white/20" />
                                    </div>
                                </div>

                                <button
                                    className={`w-full bg-primary hover:bg-primary/90 text-white font-bold py-5 rounded-full transition-all glow-primary transform active:scale-[0.98] mt-4 flex items-center justify-center gap-3 ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
                                    type="submit"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <span className="animate-pulse">Updating...</span>
                                    ) : (
                                        <>
                                            <span>Update Password</span>
                                            <Sparkles className="size-4" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}
