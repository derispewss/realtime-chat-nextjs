import { requireGuest } from "@/lib/auth";
import { LoginForm } from "@/components/auth/login-form";
import { AuthLayout } from "@/components/auth/auth-layout";

export default async function LoginPage(props: PageProps<"/[lang]/auth/login">) {
    const { lang } = await props.params;
    await requireGuest(lang);

    return (
        <AuthLayout lang={lang} quote="Real-time conversations that bring people closer." quoteAuthor="RealtimeChat Team">
            <div className="space-y-6">
                <div className="space-y-1.5 text-center">
                    <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
                    <p className="text-sm text-muted-foreground">
                        Sign in to your account to continue
                    </p>
                </div>
                <LoginForm lang={lang} />
            </div>
        </AuthLayout>
    );
}
