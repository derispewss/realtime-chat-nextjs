import { UpdatePasswordForm } from "@/components/auth/update-password-form";
import { MessageSquare } from "lucide-react";

export default async function UpdatePasswordPage(props: PageProps<"/[lang]/auth/update-password">) {
    const { lang } = await props.params;

    // No requireGuest here because Supabase logic redirects here with a recovery token

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm space-y-6">
                <div className="flex flex-col items-center space-y-2 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow">
                        <MessageSquare className="h-6 w-6" />
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Update password
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Enter your new password below
                    </p>
                </div>

                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <UpdatePasswordForm lang={lang} />
                </div>
            </div>
        </div>
    );
}
