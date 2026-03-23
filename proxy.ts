import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { defaultLocale, locales, type Locale } from "@/lib/i18n";

const PUBLIC_PATHS = ["/auth/login", "/auth/signup", "/auth/callback", "/auth/reset-password", "/auth/update-password"];

const resolveLocale = (request: NextRequest): Locale => {
    const acceptLanguage = request.headers.get("accept-language");

    if (!acceptLanguage) {
        return defaultLocale;
    }

    const preferredLanguages = acceptLanguage
        .split(",")
        .map((part) => part.trim().split(";")[0]?.toLowerCase())
        .filter(Boolean) as string[];

    for (const language of preferredLanguages) {
        if (locales.includes(language as Locale)) {
            return language as Locale;
        }

        const languageCode = language.split("-")[0];
        if (languageCode && locales.includes(languageCode as Locale)) {
            return languageCode as Locale;
        }
    }

    return defaultLocale;
};

export const proxy = async (request: NextRequest) => {
    const pathname = request.nextUrl.pathname;

    // Ensure locale prefix
    const pathnameHasLocale = locales.some(
        (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
    );

    if (!pathnameHasLocale) {
        const locale = resolveLocale(request);
        const nextUrl = request.nextUrl.clone();
        nextUrl.pathname = `/${locale}${pathname}`;
        return NextResponse.redirect(nextUrl);
    }

    // Refresh Supabase session
    const { supabaseResponse, user } = await updateSession(request);

    // Extract locale from path (first segment)
    const lang = pathname.split("/")[1] ?? defaultLocale;

    // Determine if current path is public (auth)
    const strippedPath = pathname.replace(`/${lang}`, "");
    const isPublic = PUBLIC_PATHS.some((p) => strippedPath.startsWith(p));

    // Protect: unauthenticated → /auth/login
    if (!user && !isPublic) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = `/${lang}/auth/login`;
        return NextResponse.redirect(loginUrl);
    }

    // Redirect already-authed users away from auth pages
    if (user && isPublic) {
        const chatUrl = request.nextUrl.clone();
        chatUrl.pathname = `/${lang}/chat`;
        return NextResponse.redirect(chatUrl);
    }

    return supabaseResponse;
};

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
