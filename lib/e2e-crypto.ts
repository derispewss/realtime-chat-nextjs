/**
 * E2EE Crypto Utilities — WebCrypto API (browser-native, zero dependencies)
 *
 * Algorithm: ECDH P-256 for key exchange → AES-GCM 256-bit for symmetric encryption
 *
 * Flow (DM):
 *   Send:    senderPrivKey + recipientPubKey → sharedSecret → AES-GCM encrypt → ciphertext + iv
 *   Receive: recipientPrivKey + senderPubKey → sharedSecret → AES-GCM decrypt → plaintext
 *
 * Note: This is *deterministic shared secret* (both sides derive the same key independently).
 * No ephemeral keys / ratchet — this is not Signal-level forward secrecy.
 * For a web app this is the practical limit; native apps can do better.
 */

// ── Helpers ─────────────────────────────────────────────────────────────────

const buf2b64 = (buf: ArrayBuffer): string =>
    btoa(String.fromCharCode(...new Uint8Array(buf)));

const b642buf = (b64: string): ArrayBuffer => {
    const bin = atob(b64);
    const buf = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    return buf.buffer;
};

// ── Key Generation ───────────────────────────────────────────────────────────

/**
 * Generate a new ECDH P-256 key pair.
 * extractable=false for private key (can't be exported — stays in WebCrypto subsystem).
 * Public key is exportable as SPKI → store on server.
 */
export const generateKeyPair = (): Promise<CryptoKeyPair> =>
    crypto.subtle.generateKey(
        { name: "ECDH", namedCurve: "P-256" },
        true, // extractable (we need to export public key)
        ["deriveKey", "deriveBits"],
    );

// ── Key Export / Import ─────────────────────────────────────────────────────

/** Export public key to base64 (SPKI format) — safe to store on server */
export const exportPublicKey = async (key: CryptoKey): Promise<string> => {
    const spki = await crypto.subtle.exportKey("spki", key);
    return buf2b64(spki);
};

/** Export private key to base64 (PKCS8) — store ONLY in IndexedDB, never server */
export const exportPrivateKey = async (key: CryptoKey): Promise<string> => {
    const pkcs8 = await crypto.subtle.exportKey("pkcs8", key);
    return buf2b64(pkcs8);
};

/** Import public key from base64 (server payload) */
export const importPublicKey = (b64: string): Promise<CryptoKey> =>
    crypto.subtle.importKey(
        "spki",
        b642buf(b64),
        { name: "ECDH", namedCurve: "P-256" },
        false,
        [],
    );

/** Import private key from base64 (IndexedDB payload) */
export const importPrivateKey = (b64: string): Promise<CryptoKey> =>
    crypto.subtle.importKey(
        "pkcs8",
        b642buf(b64),
        { name: "ECDH", namedCurve: "P-256" },
        false,
        ["deriveKey", "deriveBits"],
    );

// ── Shared Secret Derivation ─────────────────────────────────────────────────

/**
 * Derive a shared AES-GCM 256-bit key from own private key + partner's public key.
 * Both sides derive the SAME key without ever transmitting it.
 */
export const deriveSharedKey = (
    ownPrivateKey: CryptoKey,
    partnerPublicKey: CryptoKey,
): Promise<CryptoKey> =>
    crypto.subtle.deriveKey(
        { name: "ECDH", public: partnerPublicKey },
        ownPrivateKey,
        { name: "AES-GCM", length: 256 },
        false, // non-extractable — never leaves WebCrypto
        ["encrypt", "decrypt"],
    );

// ── Encrypt / Decrypt ────────────────────────────────────────────────────────

/**
 * Encrypt plaintext with AES-GCM.
 * Returns base64 ciphertext + base64 IV (both must be stored / transmitted).
 */
export const encryptMessage = async (
    plaintext: string,
    sharedKey: CryptoKey,
): Promise<{ ciphertext: string; iv: string }> => {
    const encoder = new TextEncoder();
    const ivBuf = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV
    const ciphertextBuf = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: ivBuf },
        sharedKey,
        encoder.encode(plaintext),
    );
    return {
        ciphertext: buf2b64(ciphertextBuf),
        iv: buf2b64(ivBuf.buffer),
    };
};

/**
 * Decrypt AES-GCM ciphertext.
 * Returns plaintext string, or null if decryption fails (wrong key / tampered).
 */
export const decryptMessage = async (
    ciphertext: string,
    ivB64: string,
    sharedKey: CryptoKey,
): Promise<string | null> => {
    try {
        const decoder = new TextDecoder();
        const plaintextBuf = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv: b642buf(ivB64) },
            sharedKey,
            b642buf(ciphertext),
        );
        return decoder.decode(plaintextBuf);
    } catch {
        // Decryption failure = wrong key or data corruption
        return null;
    }
};
