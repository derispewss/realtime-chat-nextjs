import { requireGuest } from "@/lib/auth";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { AuthLayout } from "@/components/auth/auth-layout";

export default async function ResetPasswordPage(props: PageProps<"/[lang]/auth/reset-password">) {
    const { lang } = await props.params;
    await requireGuest(lang);

    return (
        <AuthLayout lang={lang} quote="Your account security is our top priority." quoteAuthor="RealtimeChat Team">
            <div className="space-y-6">
                <div className="space-y-1.5 text-center">
                    <h1 className="text-2xl font-bold tracking-tight">Reset password</h1>
                    <p className="text-sm text-muted-foreground">
                        Enter your email to receive a reset link
                    </p>
                </div>
                <ResetPasswordForm lang={lang} />
            </div>
        </AuthLayout>
    );
}
