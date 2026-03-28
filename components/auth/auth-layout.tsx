import Link from "next/link";
import { MessageSquareIcon } from "lucide-react";
import type { ReactNode } from "react";

interface IAuthLayoutProps {
    children: ReactNode;
    lang: string;
    /** Shown in the decorative left panel */
    quote?: string;
    quoteAuthor?: string;
}

export const AuthLayout = ({
    children,
    lang,
    quote = "The right conversation at the right time changes everything.",
    quoteAuthor = "RealtimeChat",
}: IAuthLayoutProps) => {
    return (
        <div className="grid min-h-svh lg:grid-cols-[1fr_1fr]">
            {/* ── Left decorative panel ── */}
            <div className="relative hidden flex-col justify-between overflow-hidden bg-zinc-950 px-12 py-10 text-white lg:flex dark:bg-zinc-900">
                {/* radial glow */}
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_0%_0%,rgba(255,255,255,0.07),transparent)]" />

                {/* Grid pattern */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.035]"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(255,255,255,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.8) 1px,transparent 1px)",
                        backgroundSize: "36px 36px",
                    }}
                />

                {/* Decorative circle */}
                <div className="pointer-events-none absolute -bottom-40 -left-40 h-[420px] w-[420px] rounded-full border border-white/5 bg-white/[0.02]" />
                <div className="pointer-events-none absolute -bottom-20 -left-20 h-[260px] w-[260px] rounded-full border border-white/5 bg-white/[0.02]" />

                {/* Logo / brand */}
                <Link
                    href={`/${lang}`}
                    className="relative z-10 flex w-fit items-center gap-2.5 text-sm font-semibold transition-opacity hover:opacity-80"
                >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-zinc-950">
                        <MessageSquareIcon className="h-4 w-4" />
                    </span>
                    RealtimeChat
                </Link>

                {/* Quote */}
                <blockquote className="relative z-10 space-y-3">
                    <p className="max-w-sm text-xl leading-relaxed font-light text-zinc-100">
                        &ldquo;{quote}&rdquo;
                    </p>
                    <footer className="text-sm text-zinc-500">&mdash; {quoteAuthor}</footer>
                </blockquote>
            </div>

            {/* ── Right form panel ── */}
            <div className="flex flex-col items-center justify-center bg-background px-8 py-12 sm:px-16">
                {/* Mobile brand */}
                <Link
                    href={`/${lang}`}
                    className="mb-10 flex items-center gap-2 text-sm font-semibold lg:hidden"
                >
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background">
                        <MessageSquareIcon className="h-4 w-4" />
                    </span>
                    RealtimeChat
                </Link>

                <div className="w-full max-w-md">
                    {children}
                </div>
            </div>
        </div>
    );
};
