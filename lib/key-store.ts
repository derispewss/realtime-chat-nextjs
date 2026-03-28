/**
 * Key Store — persists ECDH key pairs in IndexedDB.
 *
 * Why IndexedDB over localStorage?
 * - Can store CryptoKey objects directly (non-extractable form)
 * - More storage capacity
 * - Slightly harder to casually inspect in DevTools than localStorage
 *
 * Security note: IndexedDB is accessible by same-origin JavaScript.
 * If the served JS is compromised (XSS), keys can be stolen.
 * This is the fundamental limit of all browser-based E2EE.
 */

const DB_NAME = "e2ee_keystore";
const STORE_NAME = "keys";
const DB_VERSION = 1;

let dbInstance: IDBDatabase | null = null;

const openDB = (): Promise<IDBDatabase> => {
    if (dbInstance) return Promise.resolve(dbInstance);

    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);

        req.onupgradeneeded = () => {
            req.result.createObjectStore(STORE_NAME);
        };

        req.onsuccess = () => {
            dbInstance = req.result;
            resolve(req.result);
        };

        req.onerror = () => reject(req.error);
    });
};

const tx = async (
    mode: IDBTransactionMode,
): Promise<IDBObjectStore> => {
    const db = await openDB();
    return db.transaction(STORE_NAME, mode).objectStore(STORE_NAME);
};

const idbGet = <T>(store: IDBObjectStore, key: string): Promise<T | undefined> =>
    new Promise((resolve, reject) => {
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result as T);
        req.onerror = () => reject(req.error);
    });

const idbPut = (store: IDBObjectStore, key: string, value: unknown): Promise<void> =>
    new Promise((resolve, reject) => {
        const req = store.put(value, key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });

// ── Public API ───────────────────────────────────────────────────────────────

interface IStoredKeyPair {
    privateKey: CryptoKey;
    publicKey: CryptoKey;
}

/**
 * Store a CryptoKeyPair for the given userId.
 * CryptoKey objects are stored by value (structured clone) — they don't need to be extractable.
 */
export const storeKeyPair = async (
    userId: string,
    keyPair: CryptoKeyPair,
): Promise<void> => {
    const store = await tx("readwrite");
    await idbPut(store, `${userId}:privateKey`, keyPair.privateKey);
    await idbPut(store, `${userId}:publicKey`, keyPair.publicKey);
};

/** Retrieve the stored key pair for a user, or null if not found */
export const getKeyPair = async (
    userId: string,
): Promise<IStoredKeyPair | null> => {
    const store = await tx("readonly");
    const [privateKey, publicKey] = await Promise.all([
        idbGet<CryptoKey>(store, `${userId}:privateKey`),
        idbGet<CryptoKey>(store, `${userId}:publicKey`),
    ]);
    if (!privateKey || !publicKey) return null;
    return { privateKey, publicKey };
};

/** Clear stored keys for a user (e.g. on logout) */
export const clearKeyPair = async (userId: string): Promise<void> => {
    const store = await tx("readwrite");
    await new Promise<void>((resolve, reject) => {
        const r1 = store.delete(`${userId}:privateKey`);
        r1.onsuccess = () => {
            const r2 = store.delete(`${userId}:publicKey`);
            r2.onsuccess = () => resolve();
            r2.onerror = () => reject(r2.error);
        };
        r1.onerror = () => reject(r1.error);
    });
};
