"use server";

import { revalidatePath } from "next/cache";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { IUpdateProfileInput, IUpdateProfilePasswordInput } from "@/types/profile";

export const updateProfile = async (input: IUpdateProfileInput) => {
    const user = await requireAuth(input.lang);
    const nextUsername = input.username.trim();

    if (nextUsername.length < 3) {
        return { error: "Username must be at least 3 characters." };
    }

    const [existingUsername] = await db
        .select({ id: profiles.id })
        .from(profiles)
        .where(
            and(
                eq(profiles.username, nextUsername),
                ne(profiles.id, user.id),
            ),
        )
        .limit(1);

    if (existingUsername) {
        return { error: "Username is already taken." };
    }

    await db
        .update(profiles)
        .set({
            username: nextUsername,
            avatarUrl: input.avatarUrl,
            updatedAt: new Date(),
        })
        .where(eq(profiles.id, user.id));

    revalidatePath(`/${input.lang}/chat`, "layout");
    revalidatePath(`/${input.lang}/profile`, "page");

    return { success: true };
};

export const updateProfilePassword = async (input: IUpdateProfilePasswordInput) => {
    await requireAuth(input.lang);

    if (input.password.length < 6) {
        return { error: "Password must be at least 6 characters." };
    }

    if (input.password !== input.confirmPassword) {
        return { error: "Password confirmation does not match." };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({
        password: input.password,
    });

    if (error) {
        return { error: error.message };
    }

    return { success: true };
};
