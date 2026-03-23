import { requireGuest } from "@/lib/auth";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage(props: PageProps<"/[lang]/auth/login">) {
    const { lang } = await props.params;
    await requireGuest(lang);

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="w-full max-w-sm space-y-6">
                <div className="space-y-1 text-center">
                    <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
                    <p className="text-sm text-muted-foreground">
                        Sign in to your account
                    </p>
                </div>
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <LoginForm lang={lang} />
                </div>
            </div>
        </div>
    );
}
