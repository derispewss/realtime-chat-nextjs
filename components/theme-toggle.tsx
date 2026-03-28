"use client";

import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "lucide-react";
import { useEffect, useState } from "react";

export const ThemeToggle = () => {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch — render only after mount when theme is known
    useEffect(() => { setMounted(true); }, []);

    const toggle = () => setTheme(resolvedTheme === "dark" ? "light" : "dark");

    return (
        <button
            type="button"
            onClick={toggle}
            suppressHydrationWarning
            aria-label={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-400/40 bg-white/80 text-zinc-700 transition hover:border-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-200 dark:hover:border-zinc-500"
        >
            {mounted ? (
                resolvedTheme === "dark" ? (
                    <SunIcon className="h-4 w-4" />
                ) : (
                    <MoonIcon className="h-4 w-4" />
                )
            ) : (
                // Matches the server HTML — prevents hydration mismatch
                <MoonIcon className="h-4 w-4" />
            )}
        </button>
    );
};
