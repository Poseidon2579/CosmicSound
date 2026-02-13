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
        { id: "pop", en: "Pop", es: "Pop" },
        { id: "rock", en: "Rock", es: "Rock" },
        { id: "urban", en: "Urban", es: "Urbano" },
        { id: "reggaeton", en: "Reggaeton", es: "Reggaeton" },
        { id: "hip-hop", en: "Hip Hop", es: "Hip Hop" },
        { id: "electronic", en: "Electronic", es: "Electrónica" },
        { id: "indie", en: "Indie", es: "Indie" },
        { id: "rnb", en: "R&B", es: "R&B" },
        { id: "jazz", en: "Jazz", es: "Jazz" },
        { id: "classical", en: "Classical", es: "Clásica" },
        { id: "metal", en: "Metal", es: "Metal" },
        { id: "lo-fi", en: "Lo-Fi", es: "Lo-Fi" },
        { id: "k-pop", en: "K-Pop", es: "K-Pop" },
        { id: "salsa", en: "Salsa", es: "Salsa" },
        { id: "cumbia", en: "Cumbia", es: "Cumbia" },
        { id: "punk", en: "Punk", es: "Punk" },
        { id: "techno", en: "Techno", es: "Techno" },
        { id: "house", en: "House", es: "House" },
        { id: "trance", en: "Trance", es: "Trance" },
        { id: "dubstep", en: "Dubstep", es: "Dubstep" },
        { id: "ambient", en: "Ambient", es: "Ambient" },
        { id: "dreampop", en: "Dreampop", es: "Dreampop" },
        { id: "shoegaze", en: "Shoegaze", es: "Shoegaze" },
        { id: "synthwave", en: "Synthwave", es: "Synthwave" },
        { id: "vaporwave", en: "Vaporwave", es: "Vaporwave" },
        { id: "afrobeat", en: "Afrobeat", es: "Afrobeat" },
        { id: "bossa-nova", en: "Bossa Nova", es: "Bossa Nova" },
        { id: "samba", en: "Samba", es: "Samba" },
        { id: "bolero", en: "Bolero", es: "Bolero" },
        { id: "tango", en: "Tango", es: "Tango" },
        { id: "mariachi", en: "Mariachi", es: "Mariachi" },
        { id: "flamenco", en: "Flamenco", es: "Flamenco" },
        { id: "bluegrass", en: "Bluegrass", es: "Bluegrass" },
        { id: "country", en: "Country", es: "Country" },
        { id: "folk", en: "Folk", es: "Folk" },
        { id: "gospel", en: "Gospel", es: "Gospel" },
        { id: "soul", en: "Soul", es: "Soul" },
        { id: "funk", en: "Funk", es: "Funk" },
        { id: "disco", en: "Disco", es: "Disco" },
        { id: "ska", en: "Ska", es: "Ska" },
        { id: "reggae", en: "Reggae", es: "Reggae" },
        { id: "dancehall", en: "Dancehall", es: "Dancehall" },
        { id: "bachata", en: "Bachata", es: "Bachata" },
        { id: "merengue", en: "Merengue", es: "Merengue" },
        { id: "vallenato", en: "Vallenato", es: "Vallenato" },
        { id: "trap", en: "Trap", es: "Trap" },
        { id: "drill", en: "Drill", es: "Drill" },
        { id: "grime", en: "Grime", es: "Grime" },
        { id: "garage", en: "Garage", es: "Garage" },
        { id: "industrial", en: "Industrial", es: "Industrial" },
        { id: "ebm", en: "EBM", es: "EBM" },
        { id: "ethereal", en: "Ethereal", es: "Etéreo" },
        { id: "new-wave", en: "New Wave", es: "New Wave" },
        { id: "post-punk", en: "Post-Punk", es: "Post-Punk" },
        { id: "darkwave", en: "Darkwave", es: "Darkwave" },
        { id: "grunge", en: "Grunge", es: "Grunge" },
        { id: "britpop", en: "Britpop", es: "Britpop" },
        { id: "hardcore", en: "Hardcore", es: "Hardcore" },
        { id: "emo", en: "Emo", es: "Emo" },
        { id: "screamo", en: "Screamo", es: "Screamo" },
        { id: "math-rock", en: "Math Rock", es: "Math Rock" },
        { id: "post-rock", en: "Post-Rock", es: "Post-Rock" },
        { id: "stoner-rock", en: "Stoner Rock", es: "Stoner Rock" },
        { id: "psychedelic", en: "Psychedelic", es: "Psicodelia" },
        { id: "sludge", en: "Sludge", es: "Sludge" },
        { id: "doom-metal", en: "Doom Metal", es: "Doom Metal" },
        { id: "black-metal", en: "Black Metal", es: "Black Metal" },
        { id: "death-metal", en: "Death Metal", es: "Death Metal" },
        { id: "thrash", en: "Thrash", es: "Thrash" },
        { id: "power-metal", en: "Power Metal", es: "Power Metal" },
        { id: "symphonic-metal", en: "Symphonic Metal", es: "Metal Sinfónico" },
        { id: "melodic-death", en: "Melodic Death", es: "Death Melódico" },
        { id: "eurobeat", en: "Eurobeat", es: "Eurobeat" },
        { id: "hyperpop", en: "Hyperpop", es: "Hyperpop" },
        { id: "j-pop", en: "J-Pop", es: "J-Pop" },
        { id: "j-rock", en: "J-Rock", es: "J-Rock" },
        { id: "visual-kei", en: "Visual Kei", es: "Visual Kei" },
        { id: "math-core", en: "Math Core", es: "Math Core" },
        { id: "glitch", en: "Glitch", es: "Glitch" },
        { id: "breakcore", en: "Breakcore", es: "Breakcore" },
        { id: "idm", en: "IDM", es: "IDM" },
        { id: "trip-hop", en: "Trip Hop", es: "Trip Hop" },
        { id: "acid-jazz", en: "Acid Jazz", es: "Acid Jazz" },
        { id: "nu-jazz", en: "Nu Jazz", es: "Nu Jazz" },
        { id: "hardstyle", en: "Hardstyle", es: "Hardstyle" },
        { id: "hard-trance", en: "Hard Trance", es: "Hard Trance" },
        { id: "minimal", en: "Minimal", es: "Minimal" },
        { id: "deep-house", en: "Deep House", es: "Deep House" },
        { id: "progressive", en: "Progressive", es: "Progresivo" },
        { id: "psybient", en: "Psybient", es: "Psybient" },
        { id: "goa", en: "Goa", es: "Goa" },
        { id: "dark-psy", en: "Dark Psy", es: "Dark Psy" },
        { id: "chillstep", en: "Chillstep", es: "Chillstep" },
        { id: "future-bass", en: "Future Bass", es: "Future Bass" },
        { id: "trap-latino", en: "Trap Latino", es: "Trap Latino" },
        { id: "corrido", en: "Corrido", es: "Corrido" },
        { id: "ranchera", en: "Ranchera", es: "Ranchera" },
        { id: "trova", en: "Trova", es: "Trova" },
        { id: "son-cubano", en: "Son Cubano", es: "Son Cubano" },
        { id: "mambo", en: "Mambo", es: "Mambo" },
        { id: "guaguanco", en: "Guaguancó", es: "Guaguancó" },
        { id: "alternative", en: "Alternative", es: "Alternativo" },
        { id: "alternative-rock", en: "Alternative Rock", es: "Rock Alternativo" },
        { id: "alternative-pop", en: "Alternative Pop", es: "Pop Alternativo" },
        { id: "indie-rock", en: "Indie Rock", es: "Rock Indie" },
        { id: "indie-pop", en: "Indie Pop", es: "Pop Indie" },
        { id: "synth-pop", en: "Synth Pop", es: "Synth Pop" },
        { id: "dream-pop", en: "Dream Pop", es: "Dream Pop" },
        { id: "lo-fi-hip-hop", en: "Lo-Fi Hip Hop", es: "Lo-Fi Hip Hop" },
        { id: "vaporwave-vibe", en: "Vaporwave", es: "Vaporwave" },
        { id: "chillwave", en: "Chillwave", es: "Chillwave" },
        { id: "bedroom-pop", en: "Bedroom Pop", es: "Bedroom Pop" },
        { id: "art-pop", en: "Art Pop", es: "Art Pop" },
        { id: "glitch-hop", en: "Glitch Hop", es: "Glitch Hop" },
        { id: "wonky", en: "Wonky", es: "Wonky" },
        { id: "experimental", en: "Experimental", es: "Experimental" },
        { id: "avant-garde", en: "Avant-Garde", es: "Vanguardia" },
        { id: "noise", en: "Noise", es: "Ruido" },
        { id: "drone", en: "Drone", es: "Zumbido" },
        { id: "skate-punk", en: "Skate Punk", es: "Skate Punk" },
        { id: "pop-punk", en: "Pop Punk", es: "Pop Punk" },
        { id: "emocore", en: "Emocore", es: "Emocore" },
        { id: "post-hardcore", en: "Post-Hardcore", es: "Post-Hardcore" },
        { id: "metalcore", en: "Metalcore", es: "Metalcore" },
        { id: "deathcore", en: "Deathcore", es: "Deathcore" },
        { id: "mathcore", en: "Mathcore", es: "Mathcore" },
        { id: "grindcore", en: "Grindcore", es: "Grindcore" },
        { id: "crust-punk", en: "Crust Punk", es: "Crust Punk" },
        { id: "anarcho-punk", en: "Anarcho-Punk", es: "Anarco-Punk" }
    ].sort((a, b) => a.es.localeCompare(b.es));

    const [genreSearch, setGenreSearch] = useState("");
    const [selectedGenreForDecades, setSelectedGenreForDecades] = useState<string | null>(null);

    const filteredGenres = genreSearch
        ? allGenres.filter(g =>
            g.es.toLowerCase().includes(genreSearch.toLowerCase()) ||
            g.en.toLowerCase().includes(genreSearch.toLowerCase()) ||
            g.id.toLowerCase().includes(genreSearch.toLowerCase())
        )
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

    const toggleGenre = (genreId: string) => {
        const current = preferences?.genres || [];
        let newGenres;
        if (current.includes(genreId)) {
            newGenres = current.filter((g: string) => g !== genreId);
            const newCombinations = { ...(preferences?.combinations || {}) };
            delete newCombinations[genreId];
            setPreferences({ ...preferences, genres: newGenres, combinations: newCombinations });
        } else {
            newGenres = [...current, genreId];
            setPreferences({ ...preferences, genres: newGenres });
            setSelectedGenreForDecades(genreId);
        }
    };

    const toggleDecadeForGenre = (genreId: string, decade: string) => {
        const combinations = preferences?.combinations || {};
        const currentDecades = combinations[genreId] || [];
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
                [genreId]: newDecades
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
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Géneros (Bilingüe)</label>
                        <div className="relative w-48">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">search</span>
                            <input
                                type="text"
                                placeholder="Alternativo / Rock / Pop..."
                                className="w-full bg-white/5 border border-white/10 rounded-full pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50"
                                value={genreSearch}
                                onChange={(e) => setGenreSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto p-1 custom-scrollbar">
                        {filteredGenres.map(genre => {
                            const selected = (preferences?.genres || []).includes(genre.id);
                            const comboDecades = preferences?.combinations?.[genre.id] || [];
                            return (
                                <div key={genre.id} className="relative group">
                                    <button
                                        onClick={() => toggleGenre(genre.id)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-2 ${selected
                                            ? "bg-primary border-primary text-white shadow-lg shadow-primary/25"
                                            : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
                                            }`}
                                    >
                                        {genre.es}
                                        {comboDecades.length > 0 && <span className="bg-white/20 px-1.5 rounded-md text-[9px]">{comboDecades.join(', ')}</span>}
                                        {selected && (
                                            <span
                                                onClick={(e) => { e.stopPropagation(); setSelectedGenreForDecades(genre.id); }}
                                                className="material-symbols-outlined text-[14px] hover:text-white/70"
                                            >
                                                timeline
                                            </span>
                                        )}
                                    </button>

                                    {selectedGenreForDecades === genre.id && (
                                        <div className="absolute top-full mt-2 left-0 z-50 bg-[#1a1a24] border border-white/10 p-4 rounded-xl shadow-2xl min-w-[200px]">
                                            <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                                                <span className="text-[10px] font-black uppercase text-primary italic">Décadas para {genre.es}</span>
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
                                                            onClick={() => toggleDecadeForGenre(genre.id, decade)}
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
