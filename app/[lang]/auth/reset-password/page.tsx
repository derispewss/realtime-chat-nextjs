import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { MessageSquare } from "lucide-react";
import { requireGuest } from "@/lib/auth";

export default async function ResetPasswordPage(props: PageProps<"/[lang]/auth/reset-password">) {
    const { lang } = await props.params;

    // Only guests should see this page
    await requireGuest(lang);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm space-y-6">
                <div className="flex flex-col items-center space-y-2 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow">
                        <MessageSquare className="h-6 w-6" />
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Reset password
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Enter your email to receive a reset link
                    </p>
                </div>

                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <ResetPasswordForm lang={lang} />
                </div>
            </div>
        </div>
    );
}
