"use client";

/**
 * Global E2EE Initializer
 *
 * Placed in the chat layout. Ensures that the current user's ECDH key pair
 * is generated and uploaded to the server immediately after login/on app load,
 * rather than waiting for them to open a DM window.
 *
 * This ensures that when someone else wants to DM them, their public key
 * is already available on the server.
 */

import { useEffect, useRef } from "react";
import { generateKeyPair, exportPublicKey } from "@/lib/e2e-crypto";
import { storeKeyPair, getKeyPair } from "@/lib/key-store";
import { uploadPublicKey } from "@/app/actions/e2ee";

export const E2EInitializer = ({ currentUserId }: { currentUserId: string }) => {
    const initializedRef = useRef(false);

    useEffect(() => {
        if (!currentUserId || initializedRef.current) return;
        initializedRef.current = true;

        const initKey = async () => {
            try {
                const existingPair = await getKeyPair(currentUserId);
                if (!existingPair) {
                    console.log("[E2EE Global] Generating new key pair for user...");
                    const newPair = await generateKeyPair();
                    await storeKeyPair(currentUserId, newPair);
                    const pubB64 = await exportPublicKey(newPair.publicKey);
                    await uploadPublicKey(pubB64);
                    console.log("[E2EE Global] Public key uploaded successfully.");
                } else {
                    // Optional: we could re-upload public key here just in case server lost it,
                    // but usually keeping it untouched is fine.
                }
            } catch (err) {
                console.error("[E2EE Global] Failed to initialize keys:", err);
            }
        };

        initKey();
    }, [currentUserId]);

    return null; // pure logic component
};
