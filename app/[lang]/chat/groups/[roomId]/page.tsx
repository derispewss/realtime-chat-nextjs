import { notFound, redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { getRoomById, isRoomMember, getRoomMembers } from "@/db/queries/rooms";
import { getMessagesByRoom } from "@/db/queries/messages";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { GroupChatWindow } from "@/components/chat/group-chat-window";
import { SearchUserDialog } from "@/components/chat/search-user-dialog";
import { inviteMember } from "@/app/actions/groups";
import { Hash, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function GroupPage(props: PageProps<"/[lang]/chat/groups/[roomId]">) {
    const { lang, roomId } = await props.params;
    const user = await requireAuth(lang);

    const [room, isMember, [profile]] = await Promise.all([
        getRoomById(roomId),
        isRoomMember(roomId, user.id),
        db.select().from(profiles).where(eq(profiles.id, user.id)),
    ]);

    if (!room || !profile) notFound();
    if (!isMember) redirect(`/${lang}/chat`);

    const [rawMessages, members] = await Promise.all([
        getMessagesByRoom(roomId),
        getRoomMembers(roomId),
    ]);

    const initialMessages = rawMessages.map((m) => ({
        ...m,
        createdAt: new Date(m.createdAt),
    }));

    const handleInvite = async (targetUserId: string) => {
        "use server";
        await inviteMember(roomId, targetUserId);
    };

    return (
        <div className="flex h-full flex-col">
            {/* Header */}
            <header className="flex shrink-0 items-center gap-3 border-b bg-background px-4 py-3">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <h1 className="font-semibold">{room.name}</h1>
                {room.description && (
                    <span className="hidden text-xs text-muted-foreground sm:block">
                        — {room.description}
                    </span>
                )}
                <div className="ml-auto flex items-center gap-2">
                    <Badge variant="secondary" className="gap-1">
                        <Users className="h-3 w-3" />
                        {members.length}
                    </Badge>
                    <SearchUserDialog
                        lang={lang}
                        mode="invite"
                        onInvite={handleInvite}
                        trigger={
                            <Button variant="outline" size="sm" className="gap-1.5">
                                <UserPlus className="h-3.5 w-3.5" />
                                Invite
                            </Button>
                        }
                    />
                </div>
            </header>

            <GroupChatWindow
                lang={lang}
                roomId={roomId}
                currentUserId={user.id}
                currentUsername={profile.username}
                initialMessages={initialMessages}
            />
        </div>
    );
}
