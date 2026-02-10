"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Compass, Radio, Library, PlusCircle, Settings, LogOut } from "lucide-react";
import { User } from "@/types";

export default function Sidebar({ user }: { user: User | null }) {
    const pathname = usePathname();
    const router = useRouter();

    const isActive = (path: string) => pathname === path;

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.refresh();
        router.push('/signin');
    };

    return (
        <aside className="w-72 flex flex-col border-r border-white/5 bg-background-dark h-screen sticky top-0 hidden md:flex">
            <div className="p-6 flex items-center gap-3">
                <div className="size-10 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 overflow-hidden">
                    {user?.avatar ? (
                        <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                        <span className="material-symbols-outlined">rocket_launch</span>
                    )}
                </div>
                <div className="overflow-hidden">
                    <h1 className="text-sm font-bold tracking-tight text-white truncate">{user?.username || "Viajero"}</h1>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-widest truncate">@{user?.handle || "guest"}</p>
                </div>
            </div>

            <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
                <div className="pb-4 border-b border-white/5 mb-4 space-y-1">
                    <Link href="/" className={`flex items-center gap-3 px-4 py-3 rounded-full transition-colors ${isActive('/') ? 'bg-primary text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                        <Home size={20} />
                        <span className="text-sm font-semibold">Home</span>
                    </Link>
                    <Link href="/search" className={`flex items-center gap-3 px-4 py-3 rounded-full transition-colors ${isActive('/search') ? 'bg-primary text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                        <Compass size={20} />
                        <span className="text-sm font-semibold">Explorar</span>
                    </Link>
                    <Link href="/library" className={`flex items-center gap-3 px-4 py-3 rounded-full transition-colors ${isActive('/library') ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                        <Library size={20} />
                        <span className="text-sm font-semibold">Biblioteca</span>
                    </Link>
                </div>

                <div className="mt-6">
                    <div className="flex items-center justify-between px-4 mb-4">
                        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Mis Playlists</h2>
                        <button
                            className="p-1 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white"
                            aria-label="Crear nueva lista"
                        >
                            <PlusCircle size={16} />
                        </button>
                    </div>

                    <div className="space-y-2">
                        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all border border-primary/20 mb-4 group">
                            <PlusCircle size={20} />
                            <span className="text-sm font-bold">Crear Playlist</span>
                        </button>

                        {/* Placeholder Playlists */}
                        <div className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                            <div className="size-10 rounded-lg bg-indigo-500/20 flex items-center justify-center overflow-hidden border border-white/5">
                                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 opacity-60"></div>
                            </div>
                            <span className="text-sm font-medium text-gray-400 group-hover:text-white truncate">Atmospheric Beats</span>
                        </div>
                        <div className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                            <div className="size-10 rounded-lg bg-orange-500/20 flex items-center justify-center overflow-hidden border border-white/5">
                                <div className="w-full h-full bg-gradient-to-tr from-orange-400 to-red-500 opacity-60"></div>
                            </div>
                            <span className="text-sm font-medium text-gray-400 group-hover:text-white truncate">Supernova Hits</span>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="p-6 border-t border-white/5 space-y-2">
                <Link href="/settings" className="flex items-center gap-3 w-full px-4 py-3 rounded-full text-gray-400 hover:bg-white/5 hover:text-white transition-all font-medium">
                    <Settings size={20} />
                    <span>Configuración</span>
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 rounded-full text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-all font-medium">
                    <LogOut size={20} />
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
}
