"use server";

import { db } from "@/db";
import { profiles } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq } from "drizzle-orm";

/**
 * Upload the current user's ECDH public key to the server.
 * Called once on first login (or after key regeneration).
 * The public key is safe to store — it's useless without the private key.
 */
export const uploadPublicKey = async (publicKeyB64: string): Promise<{ success: boolean }> => {
    const user = await requireAuth();

    await db
        .update(profiles)
        .set({ publicKey: publicKeyB64, updatedAt: new Date() })
        .where(eq(profiles.id, user.id));

    return { success: true };
};

/**
 * Fetch another user's public key.
 * Returns null if the user hasn't uploaded a key yet (no E2EE possible — fallback to plaintext).
 */
export const getPartnerPublicKey = async (
    partnerId: string,
): Promise<{ publicKey: string | null }> => {
    await requireAuth(); // caller must be authenticated

    const [row] = await db
        .select({ publicKey: profiles.publicKey })
        .from(profiles)
        .where(eq(profiles.id, partnerId))
        .limit(1);

    return { publicKey: row?.publicKey ?? null };
};
