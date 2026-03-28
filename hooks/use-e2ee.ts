"use client";

/**
 * useE2EE — manages E2EE key lifecycle for a DM conversation.
 *
 * On mount:
 *   1. Load own key pair from IndexedDB
 *   2. If none, generate new pair → store in IndexedDB → upload public key to server
 *   3. Fetch partner's public key from server
 *   4. Derive shared AES-GCM key (ECDH)
 *
 * Exposes:
 *   encrypt(plaintext) → { ciphertext, iv }
 *   decrypt(ciphertext, iv) → plaintext | null
 *   ready — true once shared key is derived
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
    generateKeyPair,
    exportPublicKey,
    deriveSharedKey,
    importPublicKey,
    encryptMessage,
    decryptMessage,
} from "@/lib/e2e-crypto";
import { storeKeyPair, getKeyPair } from "@/lib/key-store";
import { uploadPublicKey, getPartnerPublicKey } from "@/app/actions/e2ee";

interface IUseE2EEReturn {
    /** true once shared key is ready */
    ready: boolean;
    /** Encrypt a plaintext string. Returns ciphertext + IV (both base64). */
    encrypt: (plaintext: string) => Promise<{ ciphertext: string; iv: string }>;
    /**
     * Decrypt a ciphertext string.
     * Returns null if partner has no public key (message was sent unencrypted)
     * or on decryption failure.
     */
    decrypt: (ciphertext: string, iv: string) => Promise<string | null>;
    /**
     * Decrypt a message that might or might not be encrypted.
     * Safe to call on all incoming messages regardless of isEncrypted flag.
     */
    safeDecrypt: (content: string, iv: string | null, isEncrypted: string) => Promise<string>;
}

export const useE2EE = (currentUserId: string, partnerId: string): IUseE2EEReturn => {
    const [ready, setReady] = useState(false);
    const sharedKeyRef = useRef<CryptoKey | null>(null);

    useEffect(() => {
        if (!currentUserId || !partnerId) return;

        let cancelled = false;

        const init = async () => {
            try {
                // ── 1. Own key pair ──────────────────────────────────────────
                let ownKeys = await getKeyPair(currentUserId);

                if (!ownKeys) {
                    // First time on this device — generate + persist + upload
                    const newPair = await generateKeyPair();
                    await storeKeyPair(currentUserId, newPair);
                    const pubB64 = await exportPublicKey(newPair.publicKey);
                    await uploadPublicKey(pubB64);
                    ownKeys = { privateKey: newPair.privateKey, publicKey: newPair.publicKey };
                }

                // ── 2. Partner's public key ──────────────────────────────────
                const { publicKey: partnerPubB64 } = await getPartnerPublicKey(partnerId);

                if (!partnerPubB64) {
                    // Partner hasn't uploaded a key yet — E2EE not possible
                    console.warn("[E2EE] Partner has no public key — falling back to plaintext");
                    return;
                }

                const partnerPubKey = await importPublicKey(partnerPubB64);

                // ── 3. Derive shared key ─────────────────────────────────────
                const shared = await deriveSharedKey(ownKeys.privateKey, partnerPubKey);

                if (!cancelled) {
                    sharedKeyRef.current = shared;
                    setReady(true);
                }
            } catch (err) {
                console.error("[E2EE] Key init failed:", err);
            }
        };

        init();
        return () => { cancelled = true; };
    }, [currentUserId, partnerId]);

    const encrypt = useCallback(async (plaintext: string) => {
        if (!sharedKeyRef.current) {
            throw new Error("[E2EE] Shared key not ready");
        }
        return encryptMessage(plaintext, sharedKeyRef.current);
    }, []);

    const decrypt = useCallback(async (ciphertext: string, iv: string) => {
        if (!sharedKeyRef.current) return null;
        return decryptMessage(ciphertext, iv, sharedKeyRef.current);
    }, []);

    /**
     * Use this on all received messages:
     * - If isEncrypted==="true" and we have the key → decrypt
     * - If isEncrypted==="true" but no key yet → show placeholder
     * - If not encrypted → return content as-is
     */
    const safeDecrypt = useCallback(
        async (content: string, iv: string | null, isEncrypted: string): Promise<string> => {
            if (isEncrypted !== "true" || !iv) return content; // plaintext / legacy
            if (!sharedKeyRef.current) return "🔒 Encrypted message (key loading…)";
            const result = await decryptMessage(content, iv, sharedKeyRef.current);
            return result ?? "🔒 Unable to decrypt message";
        },
        [],
    );

    return { ready, encrypt, decrypt, safeDecrypt };
};
