import { requireGuest } from "@/lib/auth";
import { SignupForm } from "@/components/auth/signup-form";
import { AuthLayout } from "@/components/auth/auth-layout";

export default async function SignupPage(props: PageProps<"/[lang]/auth/signup">) {
    const { lang } = await props.params;
    await requireGuest(lang);

    return (
        <AuthLayout lang={lang} quote="Join thousands of people already chatting in real-time." quoteAuthor="RealtimeChat Team">
            <div className="space-y-6">
                <div className="space-y-1.5 text-center">
                    <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
                    <p className="text-sm text-muted-foreground">
                        Join and start chatting instantly
                    </p>
                </div>
                <SignupForm lang={lang} />
            </div>
        </AuthLayout>
    );
}
