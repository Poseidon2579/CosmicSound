"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User } from "@/types";
import { signOut } from "@/lib/auth-service";

export default function Navbar({ user }: { user: User | null }) {
    const pathname = usePathname();
    const router = useRouter();

    if (pathname === '/signin') return null;

    const handleLogout = async () => {
        try {
            await signOut();
            // Optional: also call the API if you want to clear other custom cookies
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/signin';
        } catch (error) {
            console.error("Error signing out:", error);
            window.location.href = '/signin';
        }
    };

    return (
        <header className="flex items-center justify-between border-b border-white/5 bg-background-dark/80 backdrop-blur-md sticky top-0 z-50">
            <div className="flex h-full w-full items-center justify-between px-10 py-3">
                <div className="flex items-center gap-4 text-white hover:opacity-80 transition cursor-pointer">
                    <Link href="/" className="flex items-center gap-4">
                        <div className="size-4">
                            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M44 24L24 4L4 24L24 44L44 24Z" fill="currentColor" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">CosmicSound</h2>
                    </Link>
                </div>
                <div className="flex flex-1 justify-end gap-8">
                    <div className="flex items-center gap-9">
                        <Link className="text-sm font-medium leading-normal text-white hover:text-primary transition" href="/search">Descubrir</Link>
                        <Link className="text-sm font-medium leading-normal text-white hover:text-primary transition" href="/library">Biblioteca</Link>
                    </div>

                    {user ? (
                        <div className="flex items-center gap-6">
                            <Link href="/profile" className="flex items-center gap-3 hover:opacity-80 transition">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-bold text-white leading-none">{user.username}</p>
                                    <p className="text-xs text-gray-400">@{user.handle}</p>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-slate-700 overflow-hidden border border-white/10">
                                    <img src={user.avatar} alt={user.username} className="h-full w-full object-cover" />
                                </div>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="text-xs font-bold uppercase tracking-widest text-white/50 hover:text-red-400 transition-colors"
                            >
                                Salir
                            </button>
                        </div>
                    ) : (
                        <Link href="/signin" className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-opacity-90 transition">
                            <span className="truncate">Iniciar Sesión</span>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
