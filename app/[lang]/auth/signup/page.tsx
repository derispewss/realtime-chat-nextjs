import { requireGuest } from "@/lib/auth";
import { SignupForm } from "@/components/auth/signup-form";

export default async function SignupPage(props: PageProps<"/[lang]/auth/signup">) {
    const { lang } = await props.params;
    await requireGuest(lang);

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="w-full max-w-sm space-y-6">
                <div className="space-y-1 text-center">
                    <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
                    <p className="text-sm text-muted-foreground">
                        Join and start chatting instantly
                    </p>
                </div>
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <SignupForm lang={lang} />
                </div>
            </div>
        </div>
    );
}
