import { notFound, redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { getRoomById, isRoomMember, getRoomMembers } from "@/db/queries/rooms";
import { getMessagesByRoom } from "@/db/queries/messages";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { inviteMember } from "@/app/actions/groups";
import { GroupRoomView } from "@/components/chat/group-room-view";

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

    const isOwner = room.ownerId === user.id;

    const handleInvite = async (targetUserId: string) => {
        "use server";
        await inviteMember(roomId, targetUserId);
    };

    return (
        <GroupRoomView
            lang={lang}
            room={room}
            members={members}
            isOwner={isOwner}
            currentUserId={user.id}
            currentUsername={profile.username}
            initialMessages={initialMessages}
            onInvite={handleInvite}
        />
    );
}
