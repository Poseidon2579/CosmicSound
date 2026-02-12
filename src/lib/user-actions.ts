"use server";

import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { User } from '@/types';
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function updateUserProfileAction(updatedUser: Partial<User>) {
    try {
        const cookieStore = cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name) {
                        return cookieStore.get(name)?.value;
                    },
                    set(name, value, options) {
                        cookieStore.set({ name, value, ...options });
                    },
                    remove(name, options) {
                        cookieStore.set({ name, value: '', ...options });
                    },
                },
            }
        );

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) return { success: false, error: 'Unauthorized' };

        const updateData: Record<string, any> = {};
        if (updatedUser.username !== undefined) updateData.nombre_usuario = updatedUser.username;
        if (updatedUser.handle !== undefined) updateData.handle = updatedUser.handle;
        if (updatedUser.bio !== undefined) updateData.bio = updatedUser.bio;
        if (updatedUser.avatar !== undefined) updateData.avatar = updatedUser.avatar;
        if (updatedUser.visibility !== undefined) updateData.visibilidad = updatedUser.visibility;
        if (updatedUser.history !== undefined) updateData.historial = updatedUser.history;
        if (updatedUser.sync !== undefined) updateData.sincronizacion = updatedUser.sync;
        if (updatedUser.preferences !== undefined) updateData.preferencias = updatedUser.preferences;

        const { error } = await supabase
            .from('usuarios')
            .update(updateData)
            .eq('id', user.id);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error("Error in updateUserProfileAction:", error);
        return { success: false, error: 'Failed to update profile' };
    }
}

export async function generateMemberPreferencesAction(bio: string) {
    try {
        const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Analiza la siguiente biografía de un usuario de una red social de música y extrae sus preferencias musicales en formato JSON. 
        Incluye géneros, artistas, instrumentos o vibras mencionadas. 
        Bio: "${bio}"
        Formato de salida esperado: { "genres": [], "artists": [], "interests": [], "moods": [] }`;

        const result = await model.generateContent(prompt);
        const text = (await result.response).text();
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
