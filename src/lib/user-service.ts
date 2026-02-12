import { supabase } from './supabase';
import { cookies } from 'next/headers';
import { User } from '@/types';

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

export async function getCurrentUser(): Promise<User | null> {
    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) return null;

        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error || !data) return null;

        return mapUsuarioToUser(data);
    } catch (error) {
        console.error("Error in getCurrentUser:", error);
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

    const { error } = await supabase
        .from('usuarios')
        .update(updateData)
        .eq('id', currentUser.id);

    return !error;
}

// Helper: map Supabase 'usuarios' row to app 'User' type
function mapUsuarioToUser(row: any): User {
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
    };
}
