"use client";

import { motion } from "framer-motion";
import { LogIn, UserPlus, ArrowRight, Github } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <main className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cosmic-accent/10 via-transparent to-transparent -z-10" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md glass p-10 rounded-[3rem] shadow-cosmic"
            >
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-black mb-2">{isLogin ? "Bienvenido de vuelta" : "Únete al Cosmos"}</h1>
                    <p className="text-text-muted">Accede a tu universo musical personal</p>
                </div>

                <div className="space-y-4 mb-8">
                    <button className="w-full h-14 rounded-2xl bg-white text-black font-bold flex items-center justify-center gap-3 hover:bg-white/90 transition-all">
                        <Github size={20} /> Continuar con Github
                    </button>
                    <div className="flex items-center gap-4 py-2">
                        <div className="h-px flex-1 bg-white/10" />
                        <span className="text-xs text-text-muted font-bold uppercase">o con email</span>
                        <div className="h-px flex-1 bg-white/10" />
                    </div>
                    <input
                        type="email"
                        placeholder="Email estelar"
                        className="w-full h-14 px-6 rounded-2xl glass border-white/10 focus:border-cosmic-accent/50 outline-none transition-all"
                    />
                    <input
                        type="password"
                        placeholder="Clave de acceso"
                        className="w-full h-14 px-6 rounded-2xl glass border-white/10 focus:border-cosmic-accent/50 outline-none transition-all"
                    />
                </div>

                <button className="w-full h-14 rounded-2xl bg-cosmic-accent text-white font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-cosmic mb-6">
                    {isLogin ? "Entrar" : "Crear Cuenta"} <ArrowRight size={18} />
                </button>

                <div className="text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-sm font-bold text-cosmic-accent hover:underline"
                    >
                        {isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya eres viajero? Inicia sesión"}
                    </button>
                </div>
            </motion.div>
        </main>
    );
}
