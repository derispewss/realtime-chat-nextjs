import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { ProfileSettingsPanel } from "@/components/profile/profile-settings-panel";

const StandaloneProfilePage = async (props: PageProps<"/[lang]/profile">) => {
    const { lang } = await props.params;
    const user = await requireAuth(lang);

    const [profile] = await db
        .select({
            username: profiles.username,
            email: profiles.email,
            avatarUrl: profiles.avatarUrl,
        })
        .from(profiles)
        .where(eq(profiles.id, user.id))
        .limit(1);

    if (!profile) {
        notFound();
    }

    return (
        <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-8 sm:px-6">
            <div className="rounded-xl border bg-card p-6 shadow-sm sm:p-8">
                <h1 className="text-2xl font-semibold">Profile Settings</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Personalize your account, security, and notification preferences.
                </p>

                <div className="mt-6">
                    <ProfileSettingsPanel
                        lang={lang}
                        initialUsername={profile.username}
                        email={profile.email}
                        initialAvatarUrl={profile.avatarUrl}
                    />
                </div>
            </div>
        </main>
    );
};

export default StandaloneProfilePage;
