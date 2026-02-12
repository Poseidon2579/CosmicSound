import { supabase } from './supabase';
import { supabase as supabaseBrowser } from './supabase-browser';
import { User } from '@/types';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Simple Base64 "hash" for demonstration purposes
const hashPassword = (password: string) => Buffer.from(password).toString('base64');

export async function getUsers(): Promise<User[]> {
    const { data, error } = await supabase
        .from('usuarios')
        .select('*');

    if (error || !data) return [];

    return data.map(mapUsuarioToUser);
}

export async function registerUser(userData: Partial<User>): Promise<User | null> {
    try {
        // Check if email already exists
        const { data: existing } = await supabase
            .from('usuarios')
            .select('id')
            .eq('email', userData.email)
            .single();

        if (existing) {
            throw new Error("Email already registered");
        }

        const newUsuario = {
            id: `user_${Date.now()}`,
            nombre_usuario: userData.username || 'Anonymous',
            handle: userData.handle || userData.username?.toLowerCase().replace(/\s/g, '_') || 'user',
            email: userData.email || '',
            contrasena: userData.password ? hashPassword(userData.password) : '',
            bio: userData.bio || 'Explorador del vacío sonoro.',
            avatar: userData.avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${userData.username || Date.now()}`,
            fecha_registro: new Date().toISOString().split('T')[0],
            visibilidad: true,
            historial: true,
            sincronizacion: true
        };

        const { data, error } = await supabase
            .from('usuarios')
            .insert(newUsuario)
            .select()
            .single();

        if (error || !data) {
            console.error("Error registering user:", error);
            return null;
        }

        return mapUsuarioToUser(data);
    } catch (error) {
        console.error("Error registering user:", error);
        return null;
    }
}

export async function loginUser(email: string, password: string): Promise<User | null> {
    try {
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', email)
            .eq('contrasena', hashPassword(password))
            .single();

        if (error || !data) return null;

        return mapUsuarioToUser(data);
    } catch (error) {
        console.error("Error logging in user:", error);
        return null;
    }
}

// Client-side version of getCurrentUser using browser client
export async function getCurrentUser(): Promise<User | null> {
    try {
        const { data: { user }, error: authError } = await supabaseBrowser.auth.getUser();

        if (authError || !user) return null;

        const { data, error } = await supabaseBrowser
            .from('usuarios')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error || !data) {
            return {
                id: user.id,
                username: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Nuevo Usuario',
                handle: 'completar_perfil',
                email: user.email || '',
                bio: 'Cuenta en proceso de configuración.',
                avatar: user.user_metadata?.avatar_url || `https://api.dicebear.com/9.x/avataaars/svg?seed=${user.email}`,
                joined: new Date().toISOString().split('T')[0],
                visibility: true,
                history: true,
                sync: true,
                isPartial: true
            };
        }

        return mapUsuarioToUser(data);
    } catch (error) {
        console.error("Error in getCurrentUser (Browser):", error);
        return null;
    }
}

export async function updateUserProfile(updatedUser: Partial<User>): Promise<boolean> {
    const currentUser = await getCurrentUser();
    if (!currentUser) return false;

    const updateData: Record<string, any> = {};
    if (updatedUser.username !== undefined) updateData.nombre_usuario = updatedUser.username;
    if (updatedUser.handle !== undefined) updateData.handle = updatedUser.handle;
    if (updatedUser.bio !== undefined) updateData.bio = updatedUser.bio;
    if (updatedUser.avatar !== undefined) updateData.avatar = updatedUser.avatar;
    if (updatedUser.visibility !== undefined) updateData.visibilidad = updatedUser.visibility;
    if (updatedUser.history !== undefined) updateData.historial = updatedUser.history;
    if (updatedUser.sync !== undefined) updateData.sincronizacion = updatedUser.sync;
    if (updatedUser.preferences !== undefined) updateData.preferencias = updatedUser.preferences;

    const { error } = await supabaseBrowser
        .from('usuarios')
        .update(updateData)
        .eq('id', currentUser.id);

    return !error;
}

export async function uploadAvatar(file: File): Promise<string | null> {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) return null;

        const fileExt = file.name.split('.').pop();
        const fileName = `${currentUser.id}-${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabaseBrowser.storage
            .from('avatars')
            .upload(filePath, file);

        if (uploadError) {
            console.error("Upload error:", uploadError);
            return null;
        }

        const { data } = supabaseBrowser.storage
            .from('avatars')
            .getPublicUrl(filePath);

        return data.publicUrl;
    } catch (error) {
        console.error("Error uploading avatar:", error);
        return null;
    }
}

export async function generateMemberPreferences(bio: string): Promise<any> {
    try {
        const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Analiza la siguiente biografía de un usuario de una red social de música y extrae sus preferencias musicales en formato JSON. 
        Incluye géneros, artistas, instrumentos o vibras mencionadas. 
        Bio: "${bio}"
        Formato de salida esperado: { "genres": [], "artists": [], "interests": [], "moods": [] }`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean markdown if present
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return {};
    } catch (error) {
        console.error("Error generating preferences:", error);
        return {};
    }
}

export async function updatePreferencesFromSearch(query: string): Promise<void> {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) return;

        const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Extrae géneros, artistas o moods de esta búsqueda musical: "${query}". 
        Responde solo un JSON con esta estructura: { "genres": [], "artists": [], "interests": [] }`;

        const result = await model.generateContent(prompt);
        const text = (await result.response).text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            const newPrefs = JSON.parse(jsonMatch[0]);
            const currentPrefs = currentUser.preferences || { genres: [], artists: [], interests: [], moods: [] };

            // Merge and dedup
            const merged = {
                genres: Array.from(new Set([...(currentPrefs.genres || []), ...(newPrefs.genres || [])])).slice(-10),
                artists: Array.from(new Set([...(currentPrefs.artists || []), ...(newPrefs.artists || [])])).slice(-10),
                interests: Array.from(new Set([...(currentPrefs.interests || []), ...(newPrefs.interests || [])])).slice(-10),
                moods: currentPrefs.moods || []
            };

            await updateUserProfile({ preferences: merged });
        }
    } catch (error) {
        console.error("Error updating search preferences:", error);
    }
}

// Helper: map Supabase 'usuarios' row to app 'User' type
export function mapUsuarioToUser(row: any): User {
    return {
        id: row.id,
        username: row.nombre_usuario,
        handle: row.handle,
        email: row.email,
        password: row.contrasena,
        bio: row.bio,
        avatar: row.avatar,
        joined: row.fecha_registro,
        visibility: row.visibilidad,
        history: row.historial,
        sync: row.sincronizacion,
        preferences: row.preferencias
    };
}
