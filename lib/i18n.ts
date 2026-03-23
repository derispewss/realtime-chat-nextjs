export const locales = ["en", "id"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const ogLocales: Record<Locale, string> = {
    en: "en_US",
    id: "id_ID",
};
