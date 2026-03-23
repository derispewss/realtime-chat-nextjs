import "server-only";

import { defaultLocale, locales, type Locale } from "@/lib/i18n";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
    en: () => import("./dictionaries/en.json").then((module) => module.default),
    id: () => import("./dictionaries/id.json").then((module) => module.default),
};

export type Dictionary = {
    meta: {
        title: string;
        description: string;
    };
    home: {
        navFeatures: string;
        navTestimonials: string;
        navFree: string;
        badge: string;
        headline: string;
        description: string;
        primaryCta: string;
        secondaryCta: string;
        tertiaryCta: string;
        statRoomsLabel: string;
        statRoomsValue: string;
        statLatencyLabel: string;
        statLatencyValue: string;
        statSecurityLabel: string;
        statSecurityValue: string;
        socialProof: string;
        trustTitle: string;
        trustOne: string;
        trustTwo: string;
        trustThree: string;
        featureTitle: string;
        featureOneTitle: string;
        featureOneDesc: string;
        featureTwoTitle: string;
        featureTwoDesc: string;
        featureThreeTitle: string;
        featureThreeDesc: string;
        testimonialTitle: string;
        testimonialQuote: string;
        testimonialAuthor: string;
        finalCtaTitle: string;
        finalCtaDesc: string;
        finalCtaButton: string;
        freeForever: string;
        switchLabel: string;
    };
    chat: {
        breadcrumbTitle: string;    
    };
};

type DictionaryValue = string | Dictionary | Dictionary[keyof Dictionary] | unknown;

export type TranslateFunction = (key: string) => string;

export const hasLocale = (locale: string): locale is Locale =>
    locales.includes(locale as Locale);

export const getDictionary = async (locale: string) => {
    const resolvedLocale: Locale = hasLocale(locale) ? locale : defaultLocale;
    return dictionaries[resolvedLocale]();
};

function getByPath(source: Dictionary, key: string): DictionaryValue {
    return key
        .split(".")
        .reduce<DictionaryValue>((acc, pathPart) => {
            if (!acc || typeof acc !== "object") {
                return undefined;
            }

            return (acc as Record<string, unknown>)[pathPart];
        }, source);
}

export async function getTranslator(locale: string): Promise<{
    locale: Locale;
    dictionary: Dictionary;
    t: TranslateFunction;
}> {
    const resolvedLocale: Locale = hasLocale(locale) ? locale : defaultLocale;

    const [dictionary, fallbackDictionary] = await Promise.all([
        dictionaries[resolvedLocale](),
        dictionaries[defaultLocale](),
    ]);

    const t: TranslateFunction = (key) => {
        const localizedValue = getByPath(dictionary, key);
        if (typeof localizedValue === "string") {
            return localizedValue;
        }

        const fallbackValue = getByPath(fallbackDictionary, key);
        if (typeof fallbackValue === "string") {
            return fallbackValue;
        }

        if (process.env.NODE_ENV !== "production") {
            console.warn(`[i18n] Missing translation key: ${key}`);
        }

        return key;
    };

    return {
        locale: resolvedLocale,
        dictionary,
        t,
    };
}
