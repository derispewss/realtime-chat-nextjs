"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { messageDeletions, messageReads, messages, roomMembers, rooms } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { isRoomMember } from "@/db/queries/rooms";

export const createGroup = async (formData: FormData) => {
    const user = await requireAuth();
    const name = formData.get("name") as string;
    const description = (formData.get("description") as string) || null;

    const [room] = await db
        .insert(rooms)
        .values({ name, description, ownerId: user.id })
        .returning();

    // Owner is also a member
    await db.insert(roomMembers).values({
        roomId: room.id,
        userId: user.id,
        role: "owner",
    });

    revalidatePath("/[lang]/chat", "layout");
    return { roomId: room.id };
};

export const inviteMember = async (groupId: string, targetUserId: string) => {
    await requireAuth();
    const alreadyMember = await isRoomMember(groupId, targetUserId);
    if (alreadyMember) return { error: "User is already a member" };

    await db.insert(roomMembers).values({
        roomId: groupId,
        userId: targetUserId,
        role: "member",
    });

    revalidatePath(`/[lang]/chat/groups/${groupId}`, "page");
    return { success: true };
};

export const sendGroupMessage = async (roomId: string, content: string) => {
    const user = await requireAuth();

    const canSend = await isRoomMember(roomId, user.id);
    if (!canSend) return { error: "Not a member of this room" };

    const [message] = await db
        .insert(messages)
        .values({
            roomId,
            senderId: user.id,
            content,
        })
        .returning({
            id: messages.id,
            content: messages.content,
            createdAt: messages.createdAt,
            senderId: messages.senderId,
        });

    return { success: true, message };
};

export const editGroupMessage = async (roomId: string, messageId: string, content: string) => {
    const user = await requireAuth();
    const trimmedContent = content.trim();

    if (!trimmedContent) {
        return { error: "Message cannot be empty" };
    }

    const canSend = await isRoomMember(roomId, user.id);
    if (!canSend) {
        return { error: "Not a member of this room" };
    }

    const [message] = await db
        .update(messages)
        .set({ content: trimmedContent })
        .where(
            and(
                eq(messages.id, messageId),
                eq(messages.roomId, roomId),
                eq(messages.senderId, user.id),
            ),
        )
        .returning({
            id: messages.id,
            content: messages.content,
            createdAt: messages.createdAt,
            senderId: messages.senderId,
        });

    if (!message) {
        return { error: "Message not found or not yours" };
    }

    return { success: true, message };
};

export const deleteGroupMessageForEveryone = async (roomId: string, messageId: string) => {
    const user = await requireAuth();

    const canSend = await isRoomMember(roomId, user.id);
    if (!canSend) return { error: "Not a member of this room" };

    const [message] = await db
        .delete(messages)
        .where(
            and(
                eq(messages.id, messageId),
                eq(messages.roomId, roomId),
                eq(messages.senderId, user.id),
            ),
        )
        .returning({ id: messages.id });

    if (!message) return { error: "Message not found or not yours" };
    return { success: true, messageId: message.id };
};

export const deleteGroupMessageForMe = async (roomId: string, messageId: string) => {
    const user = await requireAuth();

    const canSend = await isRoomMember(roomId, user.id);
    if (!canSend) return { error: "Not a member of this room" };

    await db
        .insert(messageDeletions)
        .values({ userId: user.id, messageId })
        .onConflictDoNothing();

    return { success: true };
};

export const getMessageReaders = async (messageId: string) => {
    await requireAuth();

    const readers = await db.query.messageReads.findMany({
        where: eq(messageReads.messageId, messageId),
        with: { user: { columns: { id: true, username: true, avatarUrl: true } } },
        columns: { readAt: true },
    });

    return { readers: readers.map(r => ({ ...r.user, readAt: r.readAt })) };
};

export const markGroupMessageRead = async (messageIds: string[]) => {
    const user = await requireAuth();
    if (!messageIds.length) return { success: true };

    await db
        .insert(messageReads)
        .values(messageIds.map(id => ({ messageId: id, userId: user.id })))
        .onConflictDoNothing();

    return { success: true };
};

export const leaveGroup = async (roomId: string) => {
    const user = await requireAuth();

    const [room] = await db
        .select({ ownerId: rooms.ownerId })
        .from(rooms)
        .where(eq(rooms.id, roomId))
        .limit(1);

    if (!room) return { error: "Group not found" };

    if (room.ownerId === user.id) {
        // Owner leaving = delete the whole room
        await db.delete(rooms).where(eq(rooms.id, roomId));
    } else {
        await db
            .delete(roomMembers)
            .where(and(eq(roomMembers.roomId, roomId), eq(roomMembers.userId, user.id)));
    }

    revalidatePath("/[lang]/chat", "layout");
    return { success: true };
};
