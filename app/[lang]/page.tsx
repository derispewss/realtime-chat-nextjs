import type { Metadata } from "next";
import { BoltIcon, LockKeyholeIcon, SearchIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getTranslator, hasLocale } from "./dictionaries";
import { locales, type Locale } from "@/lib/i18n";
import { ThemeToggle } from "@/components/theme-toggle";

export async function generateMetadata(
    props: PageProps<"/[lang]">,
): Promise<Metadata> {
    const { lang } = await props.params;

    if (!hasLocale(lang)) {
        notFound();
    }

    const { t } = await getTranslator(lang);

    return {
        title: t("meta.title"),
        description: t("meta.description"),
    };
}

export default async function HomePage(props: PageProps<"/[lang]">) {
    const { lang } = await props.params;

    if (!hasLocale(lang)) {
        notFound();
    }

    const { t } = await getTranslator(lang);

    return (
        <div className="relative min-h-full overflow-hidden bg-zinc-100 text-zinc-950 transition-colors dark:bg-zinc-950 dark:text-zinc-50">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(0,0,0,0.1),transparent_45%),radial-gradient(circle_at_85%_10%,rgba(255,255,255,0.22),transparent_35%),radial-gradient(circle_at_55%_85%,rgba(0,0,0,0.08),transparent_40%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.1),transparent_35%),radial-gradient(circle_at_80%_5%,rgba(255,255,255,0.06),transparent_40%),radial-gradient(circle_at_50%_90%,rgba(255,255,255,0.08),transparent_35%)]" />
            <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-8 sm:px-10 lg:px-16 lg:py-12">
                <header className="flex flex-col gap-4 rounded-2xl border border-zinc-300/70 bg-white/80 px-4 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70 sm:flex-row sm:items-center sm:justify-between motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-2 motion-safe:duration-500">
                    <div className="flex items-center gap-3">
                        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-zinc-900/20 bg-white px-3 py-1 text-xs font-semibold tracking-wide uppercase dark:border-zinc-700 dark:bg-zinc-800">
                            <span className="h-2 w-2 rounded-full bg-zinc-900 dark:bg-zinc-100" />
                            {t("home.badge")}
                        </div>
                        <nav className="hidden items-center gap-5 text-sm text-zinc-600 sm:flex dark:text-zinc-300">
                            <a href="#features" className="hover:text-zinc-900 dark:hover:text-white">{t("home.navFeatures")}</a>
                            <a href="#testimonials" className="hover:text-zinc-900 dark:hover:text-white">{t("home.navTestimonials")}</a>
                            <a href="#free" className="hover:text-zinc-900 dark:hover:text-white">{t("home.navFree")}</a>
                        </nav>
                    </div>

                    <div className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                        <span>{t("home.switchLabel")}:</span>
                        {locales.map((locale) => (
                            <Link
                                key={locale}
                                href={`/${locale}`}
                                aria-current={lang === locale ? "page" : undefined}
                                className={`rounded-full border px-3 py-1 transition ${lang === locale
                                    ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                                    : "border-zinc-400/60 bg-white/80 hover:border-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/70 dark:hover:border-zinc-500"
                                    }`}
                            >
                                {formatLocaleLabel(locale)}
                            </Link>
                        ))}
                        <ThemeToggle />
                    </div>
                </header>

                <section className="grid items-start gap-10 lg:grid-cols-[1.25fr_0.75fr] motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 motion-safe:duration-700 [animation-delay:80ms]">
                    <div className="space-y-7">
                        <h1 className="max-w-3xl text-4xl leading-tight font-bold tracking-tight sm:text-5xl lg:text-6xl">
                            {t("home.headline")}
                        </h1>
                        <p className="max-w-2xl text-base leading-8 text-zinc-700 sm:text-lg dark:text-zinc-300">
                            {t("home.description")}
                        </p>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Link
                                href={`/${lang}/chat`}
                                className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 px-7 text-base font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                            >
                                {t("home.primaryCta")}
                            </Link>
                            <a
                                href="#features"
                                className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-500/40 bg-white/70 px-7 text-base font-semibold text-zinc-900 transition hover:bg-white dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                            >
                                {t("home.secondaryCta")}
                            </a>
                            <a
                                href="#free"
                                className="inline-flex h-12 items-center justify-center rounded-full border border-transparent px-2 text-sm font-semibold text-zinc-700 underline-offset-4 transition hover:underline dark:text-zinc-300"
                            >
                                {t("home.tertiaryCta")}
                            </a>
                        </div>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("home.socialProof")}</p>
                    </div>

                    <div className="grid gap-4 rounded-3xl border border-zinc-300/70 bg-white/85 p-5 shadow-[0_24px_50px_rgba(10,10,10,0.1)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/75 dark:shadow-[0_22px_50px_rgba(0,0,0,0.45)] sm:grid-cols-3 lg:grid-cols-1">
                        <StatCard label={t("home.statRoomsLabel")} value={t("home.statRoomsValue")} />
                        <StatCard label={t("home.statLatencyLabel")} value={t("home.statLatencyValue")} />
                        <StatCard label={t("home.statSecurityLabel")} value={t("home.statSecurityValue")} />
                    </div>
                </section>

                <section className="rounded-3xl border border-zinc-300/70 bg-white/85 p-6 dark:border-zinc-800 dark:bg-zinc-900/75 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 motion-safe:duration-700 [animation-delay:140ms]">
                    <h2 className="text-xl font-semibold sm:text-2xl">{t("home.trustTitle")}</h2>
                    <ul className="mt-5 grid gap-3 text-sm text-zinc-700 sm:grid-cols-3 dark:text-zinc-300">
                        <li className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/70">{t("home.trustOne")}</li>
                        <li className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/70">{t("home.trustTwo")}</li>
                        <li className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/70">{t("home.trustThree")}</li>
                    </ul>
                </section>

                <section id="features" className="space-y-6 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 motion-safe:duration-700 [animation-delay:200ms]">
                    <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                        {t("home.featureTitle")}
                    </h2>
                    <div className="grid gap-4 md:grid-cols-3">
                        <FeatureCard
                            title={t("home.featureOneTitle")}
                            description={t("home.featureOneDesc")}
                            icon={<BoltIcon className="h-4 w-4" />}
                        />
                        <FeatureCard
                            title={t("home.featureTwoTitle")}
                            description={t("home.featureTwoDesc")}
                            icon={<LockKeyholeIcon className="h-4 w-4" />}
                        />
                        <FeatureCard
                            title={t("home.featureThreeTitle")}
                            description={t("home.featureThreeDesc")}
                            icon={<SearchIcon className="h-4 w-4" />}
                        />
                    </div>
                </section>

                <section id="testimonials" className="rounded-3xl border border-zinc-300/70 bg-white/85 p-6 dark:border-zinc-800 dark:bg-zinc-900/75 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 motion-safe:duration-700 [animation-delay:260ms]">
                    <p className="text-sm font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">{t("home.testimonialTitle")}</p>
                    <blockquote className="mt-3 max-w-3xl text-lg leading-8 text-zinc-800 dark:text-zinc-200">
                        &ldquo;{t("home.testimonialQuote")}&rdquo;
                    </blockquote>
                    <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">{t("home.testimonialAuthor")}</p>
                </section>

                <section id="free" className="rounded-3xl bg-zinc-900 px-6 py-8 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 motion-safe:duration-700 [animation-delay:320ms]">
                    <h2 className="text-2xl font-bold sm:text-3xl">{t("home.finalCtaTitle")}</h2>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-300 dark:text-zinc-900/90">{t("home.finalCtaDesc")}</p>
                    <p className="mt-2 text-xs font-medium tracking-wide text-zinc-400 uppercase dark:text-zinc-700">{t("home.freeForever")}</p>
                    <Link
                        href={`/${lang}/chat`}
                        className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-200 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-black"
                    >
                        {t("home.finalCtaButton")}
                    </Link>
                </section>
            </main>
        </div>
    );
}

function formatLocaleLabel(locale: Locale) {
    return locale.toUpperCase();
}

function StatCard(props: { label: string; value: string }) {
    return (
        <article className="rounded-2xl border border-zinc-300/80 bg-white px-4 py-4 transition hover:-translate-y-0.5 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950/70">
            <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                {props.label}
            </p>
            <p className="mt-2 text-2xl font-bold text-zinc-950 dark:text-zinc-100">{props.value}</p>
        </article>
    );
}

function FeatureCard(props: { title: string; description: string; icon: React.ReactNode }) {
    return (
        <article className="rounded-2xl border border-zinc-300/70 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/80 dark:hover:bg-zinc-900">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                {props.icon}
            </div>
            <h3 className="mt-3 text-lg font-semibold text-zinc-950 dark:text-zinc-100">{props.title}</h3>
            <p className="mt-2 text-sm leading-7 text-zinc-700 dark:text-zinc-300">{props.description}</p>
        </article>
    );
}
