import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { User } from '@/types';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { mapUsuarioToUser } from './user-service'; // We'll keep the mapper in the shared file

export async function getCurrentUserServer(): Promise<User | null> {
    try {
        const cookieStore = cookies();

        const supabaseServer = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name) {
                        return cookieStore.get(name)?.value;
                    },
                },
            }
        );

        const { data: { user }, error: authError } = await supabaseServer.auth.getUser();

        if (authError || !user) return null;

        const { data, error } = await supabaseServer
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
        console.error("Error in getCurrentUserServer:", error);
        return null;
    }
}
