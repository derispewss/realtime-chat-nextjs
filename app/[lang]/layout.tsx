import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";

import { getDictionary, hasLocale } from "./dictionaries";
import { locales, ogLocales } from "@/lib/i18n";
import { TooltipProvider } from "@/components/ui/tooltip";

const siteName = "Realtime Chat Next.js";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

const plusJakartaSans = Plus_Jakarta_Sans({
    variable: "--font-plus-jakarta-sans",
    subsets: ["latin"],
    display: "swap",
});

export async function generateStaticParams() {
    return locales.map((lang) => ({ lang }));
}

export async function generateMetadata(
    props: LayoutProps<"/[lang]">,
): Promise<Metadata> {
    const { lang } = await props.params;

    if (!hasLocale(lang)) {
        notFound();
    }

    const dict = await getDictionary(lang);

    return {
        metadataBase: new URL(siteUrl),
        title: {
            default: siteName,
            template: `%s | ${siteName}`,
        },
        description: dict.meta.description,
        applicationName: siteName,
        alternates: {
            canonical: `/${lang}`,
            languages: {
                en: "/en",
                id: "/id",
            },
        },
        openGraph: {
            title: siteName,
            description: dict.meta.description,
            url: `/${lang}`,
            siteName,
            type: "website",
            locale: ogLocales[lang],
            alternateLocale: locales.filter((locale) => locale !== lang).map((locale) => ogLocales[locale]),
        },
        twitter: {
            card: "summary_large_image",
            title: siteName,
            description: dict.meta.description,
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                "max-image-preview": "large",
                "max-snippet": -1,
                "max-video-preview": -1,
            },
        },
        category: "technology",
    };
}

export default async function LocaleLayout(props: LayoutProps<"/[lang]">) {
    const { children } = props;
    const { lang } = await props.params;

    if (!hasLocale(lang)) {
        notFound();
    }

    return (
        <html
            lang={lang}
            suppressHydrationWarning
            className={`${plusJakartaSans.variable} h-full antialiased`}
        >
            <head />
            <body suppressHydrationWarning className="min-h-full flex flex-col">
                <TooltipProvider>{children}</TooltipProvider>
            </body>
        </html>
    );
}
