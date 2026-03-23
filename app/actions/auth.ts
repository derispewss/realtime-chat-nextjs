"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { profiles } from "@/db/schema";

export const signUp = async (data: {
    email: string;
    password: string;
    username: string;
    lang: string;
}) => {
    const supabase = await createClient();
    const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
    });

    if (error || !authData.user) {
        return { error: error?.message ?? "Sign up failed" };
    }

    await db.insert(profiles).values({
        id: authData.user.id,
        email: data.email,
        username: data.username,
    });

    redirect(`/${data.lang}/chat`);
};

export const signIn = async (data: {
    email: string;
    password: string;
    lang: string;
}) => {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
    });

    if (error) {
        return { error: error.message };
    }

    redirect(`/${data.lang}/chat`);
};

export const resetPassword = async (data: {
    email: string;
    lang: string;
}) => {
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/${data.lang}/auth/update-password`,
    });

    if (error) {
        return { error: error.message };
    }

    return { success: "Password reset email sent. Check your inbox." };
};

export const updatePassword = async (data: {
    password: string;
    lang: string;
}) => {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({
        password: data.password,
    });

    if (error) {
        return { error: error.message };
    }

    redirect(`/${data.lang}/chat`);
};

export const signOut = async (lang = "en") => {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect(`/${lang}/auth/login`);
};
