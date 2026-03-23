import type { MetadataRoute } from "next";

import { locales } from "@/lib/i18n";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();

    return locales.map((locale, index) => ({
        url: `${siteUrl}/${locale}`,
        lastModified: now,
        changeFrequency: "daily",
        priority: index === 0 ? 1 : 0.9,
    }));
}
