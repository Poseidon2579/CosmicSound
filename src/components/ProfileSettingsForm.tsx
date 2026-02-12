"use client";

import { useState } from "react";
import { User } from "@/types";
import { uploadAvatar } from "@/lib/user-service";
import { updateUserProfileAction, generateMemberPreferencesAction } from "@/lib/user-actions";
import { useRouter } from "next/navigation";

export default function ProfileSettingsForm({ user }: { user: User }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState(user.username);
    const [bio, setBio] = useState(user.bio);
    const [avatar, setAvatar] = useState(user.avatar);
    const [uploading, setUploading] = useState(false);

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        try {
            setUploading(true);
            const file = e.target.files[0];
            const publicUrl = await uploadAvatar(file);
            if (publicUrl) {
                setAvatar(publicUrl);
                // Immediately update DB for avatar using Action
                await updateUserProfileAction({ avatar: publicUrl });
            }
        } catch (error) {
            console.error("Error uploading avatar:", error);
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        try {
            setLoading(true);

            // 1. Generate AI preferences if bio changed
            let preferences = user.preferences;
            if (bio !== user.bio) {
                preferences = await generateMemberPreferencesAction(bio);
            }

            // 2. Update DB using Action
            const result = await updateUserProfileAction({
                username,
                bio,
                preferences
            });

            if (result.success) {
                router.refresh();
                alert("¡Perfil actualizado con éxito!");
            } else {
                alert("Error al actualizar el perfil: " + result.error);
            }
        } catch (error) {
            console.error("Error saving profile:", error);
            alert("Ocurrió un error.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10">
            {/* Avatar Section */}
            <div className="bg-white/5 p-8 rounded-xl flex items-center gap-8 border border-white/5">
                <div className="relative group">
                    <div className={`size-32 rounded-full overflow-hidden border-4 border-white/5 shadow-2xl ${uploading ? 'opacity-50' : ''}`}>
                        <img
                            alt="Profile Avatar"
                            className="w-full h-full object-cover"
                            src={avatar}
                        />
                    </div>
                    {uploading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    )}
                    <label className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer">
                        <span className="material-symbols-outlined text-white">photo_camera</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={uploading} />
                    </label>
                </div>
                <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1">{username}</h3>
                    <p className="text-sm text-gray-400 mb-4">Tamaño recomendado: 400x400px. Soporta JPG, PNG o GIF.</p>
                    <div className="flex gap-3">
                        <label className="px-5 py-2 bg-primary rounded-full text-white text-sm font-bold hover:opacity-90 transition-all cursor-pointer">
                            Subir Nuevo
                            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={uploading} />
                        </label>
                        <button
                            onClick={() => setAvatar(`https://api.dicebear.com/9.x/avataaars/svg?seed=${user.email}`)}
                            className="px-5 py-2 rounded-full border border-white/10 text-sm font-bold hover:bg-white/5 transition-all"
                        >
                            Restablecer
                        </button>
                    </div>
                </div>
            </div>

            {/* General Info Form */}
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
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 opacity-50 cursor-not-allowed text-sm"
                            value={user.email}
                            disabled
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="username-input" className="text-xs font-bold text-gray-500 uppercase tracking-widest">Nombre de Usuario</label>
                        <input
                            id="username-input"
                            type="text"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary/50 text-sm"
                            placeholder="Tu nombre"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label htmlFor="bio-input" className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center justify-between">
                        Biografía
                        <span className="text-[10px] text-primary flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">sparkles</span>
                            IA Analizando...
                        </span>
                    </label>
                    <textarea
                        id="bio-input"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary/50 text-sm h-32"
                        placeholder="Cuéntanos algo sobre ti y tus gustos musicales..."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                    />
                </div>

                <div className="pt-4">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full md:w-auto px-8 py-3 bg-primary rounded-xl text-white font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">save</span>
                                Guardar Cambios
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
