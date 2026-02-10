import Sidebar from "@/components/Sidebar";
import { getCurrentUser } from "@/lib/user-service";
import Link from "next/link";

export default async function SettingsPage() {
    const user = await getCurrentUser();

    if (!user) return null;

    return (
        <div className="flex min-h-screen bg-background-dark text-white">
            <Sidebar user={user} />

            <main className="flex-1 flex flex-col overflow-hidden">
                <div className="max-w-4xl mx-auto px-8 py-12 md:px-16 lg:px-24 w-full">
                    {/* Header */}
                    <div className="flex items-end justify-between mb-12">
                        <div>
                            <h2 className="text-4xl font-bold tracking-tight mb-2">Núcleo del Sistema</h2>
                            <p className="text-gray-400">Administra tu identidad cósmica y visibilidad en la galaxia.</p>
                        </div>
                        <Link href="/profile" className="flex items-center gap-2 px-6 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-all text-sm font-semibold">
                            <span className="material-symbols-outlined text-sm">visibility</span>
                            Ver Perfil Público
                        </Link>
                    </div>

                    {/* Profile Section */}
                    <div className="space-y-10">
                        {/* Avatar */}
                        <div className="bg-white/5 p-8 rounded-xl flex items-center gap-8 border border-white/5">
                            <div className="relative group cursor-pointer">
                                <div className="size-32 rounded-full overflow-hidden border-4 border-white/5 shadow-2xl">
                                    <img
                                        alt="Profile Avatar"
                                        className="w-full h-full object-cover"
                                        src={user.avatar}
                                    />
                                </div>
                                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                    <span className="material-symbols-outlined text-white">photo_camera</span>
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold mb-1">{user.username}</h3>
                                <p className="text-sm text-gray-400 mb-4">Tamaño recomendado: 400x400px. Soporta JPG, PNG o GIF.</p>
                                <div className="flex gap-3">
                                    <button className="px-5 py-2 bg-primary rounded-full text-white text-sm font-bold hover:opacity-90 transition-all">Subir Nuevo</button>
                                    <button className="px-5 py-2 rounded-full border border-white/10 text-sm font-bold hover:bg-white/5 transition-all">Eliminar</button>
                                </div>
                            </div>
                        </div>

                        {/* General Info Form (Read Only for now) */}
                        <div className="space-y-6">
                            <h4 className="text-lg font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">edit_note</span>
                                Identidad Pública
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="email-input" className="text-xs font-bold text-gray-500 uppercase tracking-widest">Email</label>
                                    <input
                                        id="email-input"
                                        type="email"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary/50 text-sm"
                                        placeholder="email@example.com"
                                        value={user.email}
                                        readOnly
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="handle-input" className="text-xs font-bold text-gray-500 uppercase tracking-widest">Handle</label>
                                    <input
                                        id="handle-input"
                                        type="text"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary/50 text-sm"
                                        placeholder="@example"
                                        value={`@${user.handle}`}
                                        readOnly
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="bio-input" className="text-xs font-bold text-gray-500 uppercase tracking-widest">Biografía</label>
                                <textarea
                                    id="bio-input"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary/50 text-sm h-24"
                                    placeholder="Cuéntanos algo sobre ti..."
                                    value={user.bio}
                                    readOnly
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
