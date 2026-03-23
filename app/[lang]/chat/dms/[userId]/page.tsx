import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { getDMConversation, markDMConversationRead } from "@/db/queries/direct-messages";
import { DMChatWindow } from "@/components/chat/dm-chat-window";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserPresenceBadge } from "@/components/chat/user-presence-badge";

export default async function DMPage(props: PageProps<"/[lang]/chat/dms/[userId]">) {
    const { lang, userId } = await props.params;
    const user = await requireAuth(lang);

    // Get both partner and current user profile in one query
    const relatedProfiles = await db
        .select({
            id: profiles.id,
            username: profiles.username,
            avatarUrl: profiles.avatarUrl,
        })
        .from(profiles)
        .where(inArray(profiles.id, [userId, user.id]));

    const partner = relatedProfiles.find((p) => p.id === userId);
    const currentUserProfile = relatedProfiles.find((p) => p.id === user.id);

    if (!partner || !currentUserProfile) notFound();

    await markDMConversationRead(user.id, userId);
    const rawMessages = await getDMConversation(user.id, userId);
    const initialMessages = rawMessages.map((m) => ({
        ...m,
        createdAt: new Date(m.createdAt),
        deliveredAt: m.deliveredAt ? new Date(m.deliveredAt) : null,
        readAt: m.readAt ? new Date(m.readAt) : null,
    }));

    return (
        <div className="flex h-full flex-col">
            {/* Header */}
            <header className="flex shrink-0 items-center gap-3 border-b bg-background px-4 py-3">
                <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-xs">
                        {partner.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-0.5">
                    <h1 className="font-semibold">{partner.username}</h1>
                    <UserPresenceBadge currentUserId={user.id} targetUserId={userId} />
                </div>
            </header>

            <DMChatWindow
                currentUserId={user.id}
                currentUsername={currentUserProfile.username}
                partnerId={userId}
                initialMessages={initialMessages}
            />
        </div>
    );
}
