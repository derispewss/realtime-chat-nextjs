"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useEffect, useState } from "react";

const THEME_STORAGE_KEY = "theme";

type ThemeMode = "light" | "dark";

function getInitialTheme(): ThemeMode {
    if (typeof document === "undefined") {
        return "light";
    }

    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === "light" || savedTheme === "dark") {
        return savedTheme;
    }

    const hasDarkClass = document.documentElement.classList.contains("dark");
    if (hasDarkClass) {
        return "dark";
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
}

function applyTheme(theme: ThemeMode) {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
}

export function ThemeToggle() {
    const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    const toggleTheme = () => {
        const nextTheme: ThemeMode = theme === "dark" ? "light" : "dark";
        setTheme(nextTheme);
        applyTheme(nextTheme);
        window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    };

    return (
        <button
            type="button"
            onClick={toggleTheme}
            suppressHydrationWarning
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-400/40 bg-white/80 text-zinc-700 transition hover:border-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-200 dark:hover:border-zinc-500"
        >
            {theme === "dark" ? (
                <SunIcon className="h-4 w-4" />
            ) : (
                <MoonIcon className="h-4 w-4" />
            )}
        </button>
    );
}
