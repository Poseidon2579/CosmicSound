"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Rocket, Mail, Lock, User as UserIcon, LogIn, Sparkles, ArrowLeft } from "lucide-react";
import { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPasswordForEmail } from "@/lib/auth-service";

export default function LoginPage() {
    const [view, setView] = useState<'login' | 'signup' | 'forgot'>('login');
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const router = useRouter();

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setError("");
        try {
            await signInWithGoogle();
        } catch (err: any) {
            setError(err.message || "Google login failed");
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setError("Por favor ingresa tu correo electrónico.");
            return;
        }
        setIsLoading(true);
        setError("");
        setSuccess("");
        try {
            await resetPasswordForEmail(email);
            setSuccess("¡Enlace de recuperación enviado! Revisa tu bandeja de entrada.");
            setIsLoading(false);
        } catch (err: any) {
            setError(err.message || "No se pudo enviar el correo de recuperación.");
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccess("");

        try {
            if (view === 'login') {
                await signInWithEmail(email, password);
            } else if (view === 'signup') {
                await signUpWithEmail(email, password, username);
                setSuccess("¡Bienvenido! Revisa tu correo para confirmar tu cuenta.");
                setIsLoading(false);
                return;
            }
            router.refresh();
            router.push('/');
        } catch (err: any) {
            setError(err.message || "Authentication failed");
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
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                                {view === 'login' ? 'Welcome back to the Void' :
                                    view === 'signup' ? 'Join the Cosmic Choir' :
                                        'Recover access'}
                            </h2>
                            <p className="text-white/40 text-sm font-medium">
                                {view === 'login' ? 'Re-calibrate your auditory sensors.' :
                                    view === 'signup' ? 'Establish your presence in the universe.' :
                                        'Enter your email to reset your resonance.'}
                            </p>
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

                            <form onSubmit={view === 'forgot' ? handleForgotPassword : handleSubmit} className="space-y-5">
                                {view === 'signup' && (
                                    <div className="space-y-2">
                                        <label htmlFor="username" className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 ml-4">Codename</label>
                                        <div className="relative">
                                            <input
                                                id="username"
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-full px-6 py-4 pl-12 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-white/10 text-sm"
                                                placeholder="Alex Stardust"
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                required={view === 'signup'}
                                            />
                                            <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-white/20" />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 ml-4">Email Address</label>
                                    <div className="relative">
                                        <input
                                            id="email"
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-full px-6 py-4 pl-12 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-white/10 text-sm"
                                            placeholder="stardust@void.com"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-white/20" />
                                    </div>
                                </div>

                                {view !== 'forgot' && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center pr-4">
                                            <label htmlFor="password" className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 ml-4">Password</label>
                                            {view === 'login' && (
                                                <button
                                                    type="button"
                                                    onClick={() => { setView('forgot'); setError(""); setSuccess(""); }}
                                                    className="text-[10px] font-bold uppercase tracking-widest text-primary hover:text-blue-400 transition-colors"
                                                >
                                                    Forgot?
                                                </button>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <input
                                                id="password"
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-full px-6 py-4 pl-12 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-white/10 text-sm"
                                                placeholder="••••••••"
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required={view !== 'forgot'}
                                            />
                                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-white/20" />
                                        </div>
                                    </div>
                                )}

                                <button
                                    className={`w-full bg-primary hover:bg-primary/90 text-white font-bold py-5 rounded-full transition-all glow-primary transform active:scale-[0.98] mt-4 flex items-center justify-center gap-3 ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
                                    type="submit"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <span className="animate-pulse">Calibrating...</span>
                                    ) : (
                                        <>
                                            <span>
                                                {view === 'login' ? 'Enter the Void' :
                                                    view === 'signup' ? 'Begin Journey' :
                                                        'Send recovery link'}
                                            </span>
                                            {view === 'login' ? <LogIn className="size-4" /> : <Sparkles className="size-4" />}
                                        </>
                                    )}
                                </button>

                                {view === 'forgot' && (
                                    <button
                                        type="button"
                                        onClick={() => { setView('login'); setError(""); setSuccess(""); }}
                                        className="w-full text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:text-white transition-colors"
                                    >
                                        <ArrowLeft className="size-3" /> Back to login
                                    </button>
                                )}
                            </form>

                            {view !== 'forgot' && (
                                <>
                                    <div className="relative flex items-center py-2">
                                        <div className="flex-grow border-t border-white/5"></div>
                                        <span className="flex-shrink mx-4 text-white/20 text-[10px] font-bold uppercase tracking-widest">Or connect via</span>
                                        <div className="flex-grow border-t border-white/5"></div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={handleGoogleLogin}
                                            className="flex items-center justify-center gap-3 bg-white/[0.03] border border-white/10 rounded-full py-4 hover:bg-white/[0.08] transition-all group"
                                        >
                                            <svg className="w-5 h-5 opacity-60 group-hover:opacity-100" fill="currentColor" viewBox="0 0 24 24"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.908 3.152-1.928 4.176-1.02 1.024-2.6 2.144-5.912 2.144-5.384 0-9.656-4.352-9.656-9.736s4.272-9.736 9.656-9.736c2.92 0 5.12 1.144 6.64 2.584l2.304-2.304C19.144 1.256 16.36 0 12.48 0 5.712 0 .192 5.52.192 12.288S5.712 24.576 12.48 24.576c3.672 0 6.44-1.208 8.64-3.52 2.256-2.256 2.968-5.416 2.968-7.904 0-.768-.056-1.504-.184-2.232H12.48z"></path></svg>
                                            <span className="text-xs font-bold tracking-widest uppercase">Google</span>
                                        </button>
                                        <button className="flex items-center justify-center gap-3 bg-white/[0.03] border border-white/10 rounded-full py-4 hover:bg-white/[0.08] transition-all group">
                                            <svg className="w-5 h-5 opacity-60 group-hover:opacity-100" fill="currentColor" viewBox="0 0 24 24"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.67-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2.044-.147-3.238 1.09-4.21 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.702z"></path></svg>
                                            <span className="text-xs font-bold tracking-widest uppercase">Apple</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        {view !== 'forgot' && (
                            <div className="text-center pt-4">
                                <p className="text-sm text-white/40">
                                    {view === 'login' ? 'First journey?' : 'Already recorded?'}
                                    <button
                                        onClick={() => { setView(view === 'login' ? 'signup' : 'login'); setError(""); setSuccess(""); }}
                                        className="text-primary font-bold hover:text-blue-400 transition-colors underline underline-offset-8 decoration-primary/30 ml-2"
                                    >
                                        {view === 'login' ? 'Signal presence' : 'Enter Void'}
                                    </button>
                                </p>
                            </div>
                        )}
                    </section>
                </main>

                <footer className="p-12 text-center border-t border-white/[0.03] glass-card">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-white/10 text-[10px] font-bold uppercase tracking-[0.3em]">© 2026 CosmicSound Systems • Harmonic AI Calibration Active</p>
                        <div className="flex gap-8">
                            <a className="text-white/10 hover:text-white/40 text-[10px] font-bold uppercase tracking-widest transition-colors" href="#">Privacy Flux</a>
                            <a className="text-white/10 hover:text-white/40 text-[10px] font-bold uppercase tracking-widest transition-colors" href="#">Terms of Void</a>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
