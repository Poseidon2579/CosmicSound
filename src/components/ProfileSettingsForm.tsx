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
    const [preferences, setPreferences] = useState(user.preferences || { genres: [], artists: [], interests: [], moods: [], combinations: {} });
    const [uploading, setUploading] = useState(false);

    const allGenres = [
        "Pop", "Rock", "Urban", "Reggaeton", "Hip Hop", "Electronic", "Indie", "R&B", "Jazz", "Classical", "Metal", "Lo-Fi", "K-Pop", "Salsa", "Cumbia",
        "Punk", "Techno", "House", "Trance", "Dubstep", "Ambient", "Dreampop", "Shoegaze", "Synthwave", "Vaporwave", "Afrobeat", "Bossa Nova", "Samba",
        "Bolero", "Tango", "Mariachi", "Flamenco", "Bluegrass", "Country", "Folk", "Gospel", "Soul", "Funk", "Disco", "Ska", "Reggae", "Dancehall",
        "Bachata", "Merengue", "Vallenato", "Trap", "Drill", "Grime", "Garage", "Industrial", "EBM", "Ethereal", "New Wave", "Post-Punk", "Darkwave",
        "Grunge", "Britpop", "Hardcore", "Emo", "Screamo", "Math Rock", "Post-Rock", "Stoner Rock", "Psychedelic", "Sludge", "Doom Metal", "Black Metal",
        "Death Metal", "Thrash", "Power Metal", "Symphonic Metal", "Melodic Death", "Eurobeat", "Hyperpop", "J-Pop", "J-Rock", "Visual Kei", "Math Core",
        "Glitch", "Breakcore", "IDM", "Trip Hop", "Acid Jazz", "Nu Jazz", "Hardstyle", "Hard Trance", "Minimal", "Deep House", "Progressive", "Psybient",
        "Goa", "Dark Psy", "Chillstep", "Future Bass", "Trap Latino", "Corrido", "Ranchera", "Trova", "Son Cubano", "Mambo", "Guaguancó"
    ].sort();

    const [genreSearch, setGenreSearch] = useState("");
    const [selectedGenreForDecades, setSelectedGenreForDecades] = useState<string | null>(null);

    const filteredGenres = genreSearch
        ? allGenres.filter(g => g.toLowerCase().includes(genreSearch.toLowerCase()))
        : allGenres.slice(0, 20);

    const allDecades = ["60s", "70s", "80s", "90s", "2000s", "2010s", "2020s"];

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        try {
            setUploading(true);
            const file = e.target.files[0];
            const publicUrl = await uploadAvatar(file);
            if (publicUrl) {
                setAvatar(publicUrl);
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

            let finalPreferences = preferences;
            if (bio !== user.bio) {
                const aiPrefs = await generateMemberPreferencesAction(bio);
                finalPreferences = {
                    ...aiPrefs,
                    genres: Array.from(new Set([...(preferences.genres || []), ...(aiPrefs.genres || [])])),
                    combinations: preferences.combinations || {}
                };
            }

            const result = await updateUserProfileAction({
                username,
                bio,
                preferences: finalPreferences
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

    const toggleGenre = (genre: string) => {
        const current = preferences?.genres || [];
        let newGenres;
        if (current.includes(genre)) {
            newGenres = current.filter((g: string) => g !== genre);
            const newCombinations = { ...(preferences?.combinations || {}) };
            delete newCombinations[genre];
            setPreferences({ ...preferences, genres: newGenres, combinations: newCombinations });
        } else {
            newGenres = [...current, genre];
            setPreferences({ ...preferences, genres: newGenres });
            setSelectedGenreForDecades(genre);
        }
    };

    const toggleDecadeForGenre = (genre: string, decade: string) => {
        const combinations = preferences?.combinations || {};
        const currentDecades = combinations[genre] || [];
        let newDecades;
        if (currentDecades.includes(decade)) {
            newDecades = currentDecades.filter((d: string) => d !== decade);
        } else {
            newDecades = [...currentDecades, decade];
        }
        setPreferences({
            ...preferences,
            combinations: {
                ...combinations,
                [genre]: newDecades
            }
        });
    };

    return (
        <div className="space-y-10">
            {/* Avatar Section */}
            <div className="bg-white/5 p-8 rounded-xl flex items-center gap-8 border border-white/5 backdrop-blur-md">
                <div className="relative group">
                    <div className={`size-32 rounded-full overflow-hidden border-4 border-white/5 shadow-2xl ${uploading ? 'opacity-50' : ''}`}>
                        <img alt="Profile Avatar" className="w-full h-full object-cover" src={avatar} />
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
                    <p className="text-sm text-gray-400 mb-4">Muestra tu identidad a la galaxia.</p>
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

            {/* Form */}
            <div className="space-y-6">
                <h4 className="text-lg font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">edit_note</span>
                    Perfil Musical
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

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Géneros (+100)</label>
                        <div className="relative w-48">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">search</span>
                            <input
                                type="text"
                                placeholder="Buscar..."
                                className="w-full bg-white/5 border border-white/10 rounded-full pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50"
                                value={genreSearch}
                                onChange={(e) => setGenreSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto p-1 custom-scrollbar">
                        {filteredGenres.map(genre => {
                            const selected = (preferences?.genres || []).includes(genre);
                            const comboDecades = preferences?.combinations?.[genre] || [];
                            return (
                                <div key={genre} className="relative group">
                                    <button
                                        onClick={() => toggleGenre(genre)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-2 ${selected
                                            ? "bg-primary border-primary text-white shadow-lg shadow-primary/25"
                                            : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
                                            }`}
                                    >
                                        {genre}
                                        {comboDecades.length > 0 && <span className="bg-white/20 px-1.5 rounded-md text-[9px]">{comboDecades.join(', ')}</span>}
                                        {selected && (
                                            <span
                                                onClick={(e) => { e.stopPropagation(); setSelectedGenreForDecades(genre); }}
                                                className="material-symbols-outlined text-[14px] hover:text-white/70"
                                            >
                                                timeline
                                            </span>
                                        )}
                                    </button>

                                    {selectedGenreForDecades === genre && (
                                        <div className="absolute top-full mt-2 left-0 z-50 bg-[#1a1a24] border border-white/10 p-4 rounded-xl shadow-2xl min-w-[200px]">
                                            <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                                                <span className="text-[10px] font-black uppercase text-primary italic">Décadas para {genre}</span>
                                                <button onClick={() => setSelectedGenreForDecades(null)}>
                                                    <span className="material-symbols-outlined text-sm">close</span>
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {allDecades.map(decade => {
                                                    const isDecadeSelected = comboDecades.includes(decade);
                                                    return (
                                                        <button
                                                            key={decade}
                                                            onClick={() => toggleDecadeForGenre(genre, decade)}
                                                            className={`px-2 py-1 rounded-md text-[10px] font-bold border transition-all ${isDecadeSelected
                                                                ? "bg-blue-500 border-blue-500 text-white"
                                                                : "bg-white/5 border-white/10 text-gray-500 hover:bg-white/10"
                                                                }`}
                                                        >
                                                            {decade}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    {genreSearch && filteredGenres.length === 0 && (
                        <p className="text-xs text-gray-500 italic">No encontramos ese género, pero puedes describirlo en tu Bio.</p>
                    )}
                </div>

                <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Filtros de Décadas Generales</label>
                    <div className="flex flex-wrap gap-2">
                        {allDecades.map(decade => {
                            const selected = (preferences?.decades || []).includes(decade);
                            return (
                                <button
                                    key={decade}
                                    onClick={() => {
                                        const current = preferences?.decades || [];
                                        const newDecades = selected ? current.filter((d: string) => d !== decade) : [...current, decade];
                                        setPreferences({ ...preferences, decades: newDecades });
                                    }}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${selected
                                        ? "bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/25"
                                        : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
                                        }`}
                                >
                                    {decade}
                                </button>
                            );
                        })}
                    </div>
                    <p className="text-[10px] text-gray-500">Selecciona géneros y asígnales décadas específicas para una brújula musical perfecta.</p>
                </div>

                <div className="space-y-2">
                    <label htmlFor="bio-input" className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center justify-between">
                        Biografía (Análisis IA Activo)
                        <span className="text-[10px] text-primary flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">sparkles</span>
                            <span className="font-black italic uppercase tracking-tighter">KALA AI MUSIC</span>
                        </span>
                    </label>
                    <textarea
                        id="bio-input"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm h-32 focus:outline-none focus:ring-1 focus:ring-primary/50"
                        placeholder="Describe tus gustos..."
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
