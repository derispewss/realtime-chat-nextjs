import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getRoomsByUser } from "@/db/queries/rooms";
import { getDMPartnersWithLastMessage } from "@/db/queries/direct-messages";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default async function ChatLayout(props: LayoutProps<"/[lang]/chat">) {
    const { children } = props;
    const { lang } = await props.params;

    const user = await requireAuth(lang);
    let profile;
    let groups;
    let dmPartners;

    try {
        if (!user?.id) {
            redirect(`/${lang}/auth/login`);
        }

        const [profileRow] = await db
            .select({
                id: profiles.id,
                username: profiles.username,
                avatarUrl: profiles.avatarUrl,
            })
            .from(profiles)
            .where(eq(profiles.id, user.id))
            .limit(1);

        if (!profileRow) {
            redirect(`/${lang}/auth/login?error=profile_missing`);
        }

        profile = profileRow;

        [groups, dmPartners] = await Promise.all([
            getRoomsByUser(user.id),
            getDMPartnersWithLastMessage(user.id),
        ]);
    } catch (err) {
        console.error("[ChatLayout] DB error:", err);
        redirect(`/${lang}/auth/login?error=db_unavailable`);
    }

    return (
        <SidebarProvider
            style={{
                "--sidebar-width": "350px",
            } as React.CSSProperties}
        >
            <AppSidebar
                lang={lang}
                groups={groups!}
                dmPartners={dmPartners!}
                currentUser={profile!}
            />
            <SidebarInset className="h-screen overflow-hidden">
                <div className="sticky top-0 z-30 flex items-center gap-2 border-b bg-background/95 px-3 py-2 backdrop-blur md:hidden">
                    <SidebarTrigger />
                    <span className="text-sm font-medium">Menu</span>
                </div>
                <main className="flex h-full flex-1 flex-col overflow-hidden">{children}</main>
            </SidebarInset>
        </SidebarProvider>
    );
}
