import { supabase } from './supabase';

export const signInWithGoogle = async () => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${baseUrl}/auth/callback`,
        },
    });

    if (error) throw error;
    return data;
};

export const signUpWithEmail = async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: username,
            },
        },
    });

    if (error) throw error;
    return data;
};

export const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw error;
    return data;
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

export const resetPasswordForEmail = async (email: string) => {
    // Check if user exists in our usuarios table first (as requested by user)
    const { data, error: checkError } = await supabase
        .from('usuarios')
        .select('email')
        .eq('email', email)
        .single();

    if (checkError || !data) {
        throw new Error("El correo no está registrado en nuestro sistema.");
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    });

    if (error) throw error;
};

export const updateUserPassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({
        password: password
    });

    if (error) throw error;
};
