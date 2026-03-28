"use server";

import { db } from "@/db";
import { directMessages, messageDeletions } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { and, eq, isNull, or } from "drizzle-orm";

export const sendDM = async (
    receiverId: string,
    content: string,
    opts?: { iv?: string; isEncrypted?: boolean },
) => {
    const user = await requireAuth();

    const [message] = await db
        .insert(directMessages)
        .values({
            senderId: user.id,
            receiverId,
            content,
            iv: opts?.iv ?? null,
            isEncrypted: opts?.isEncrypted ? "true" : "false",
        })
        .returning({
            id: directMessages.id,
            content: directMessages.content,
            iv: directMessages.iv,
            isEncrypted: directMessages.isEncrypted,
            createdAt: directMessages.createdAt,
            senderId: directMessages.senderId,
            deliveredAt: directMessages.deliveredAt,
            readAt: directMessages.readAt,
        });

    return { success: true, message };
};


export const markDMDelivered = async (messageId: string) => {
    const user = await requireAuth();

    await db
        .update(directMessages)
        .set({ deliveredAt: new Date() })
        .where(
            and(
                eq(directMessages.id, messageId),
                eq(directMessages.receiverId, user.id),
                isNull(directMessages.deliveredAt),
            ),
        );

    return { success: true };
};

export const markDMRead = async (partnerId: string) => {
    const user = await requireAuth();
    const now = new Date();

    await db
        .update(directMessages)
        .set({
            deliveredAt: now,
            readAt: now,
        })
        .where(
            and(
                eq(directMessages.senderId, partnerId),
                eq(directMessages.receiverId, user.id),
                isNull(directMessages.readAt),
            ),
        );

    return { success: true };
};

export const editDM = async (messageId: string, content: string) => {
    const user = await requireAuth();
    const trimmedContent = content.trim();

    if (!trimmedContent) {
        return { error: "Message cannot be empty" };
    }

    const [message] = await db
        .update(directMessages)
        .set({ content: trimmedContent })
        .where(
            and(
                eq(directMessages.id, messageId),
                eq(directMessages.senderId, user.id),
            ),
        )
        .returning({
            id: directMessages.id,
            content: directMessages.content,
            createdAt: directMessages.createdAt,
            senderId: directMessages.senderId,
            receiverId: directMessages.receiverId,
            deliveredAt: directMessages.deliveredAt,
            readAt: directMessages.readAt,
        });

    if (!message) {
        return { error: "Message not found or not yours" };
    }

    return { success: true, message };
};

export const deleteDMForBoth = async (messageId: string) => {
    const user = await requireAuth();

    const [message] = await db
        .delete(directMessages)
        .where(
            and(
                eq(directMessages.id, messageId),
                eq(directMessages.senderId, user.id),
            ),
        )
        .returning({ id: directMessages.id });

    if (!message) return { error: "Message not found or not yours" };
    return { success: true, messageId: message.id };
};

export const deleteDMForMe = async (messageId: string) => {
    const user = await requireAuth();

    // Works for both sender and receiver
    await db
        .insert(messageDeletions)
        .values({ userId: user.id, dmId: messageId })
        .onConflictDoNothing();

    return { success: true };
};

export const getDMInfo = async (messageId: string) => {
    const user = await requireAuth();

    const [msg] = await db
        .select({
            id: directMessages.id,
            createdAt: directMessages.createdAt,
            deliveredAt: directMessages.deliveredAt,
            readAt: directMessages.readAt,
            senderId: directMessages.senderId,
        })
        .from(directMessages)
        .where(
            and(
                eq(directMessages.id, messageId),
                or(
                    eq(directMessages.senderId, user.id),
                    eq(directMessages.receiverId, user.id),
                ),
            ),
        )
        .limit(1);

    if (!msg) return { error: "Not found" };
    return { info: msg };
};

export const clearDMConversation = async (partnerId: string) => {
    const user = await requireAuth();

    // Fetch all DM IDs in this conversation (both sides)
    const allDMs = await db
        .select({ id: directMessages.id })
        .from(directMessages)
        .where(
            or(
                and(eq(directMessages.senderId, user.id), eq(directMessages.receiverId, partnerId)),
                and(eq(directMessages.senderId, partnerId), eq(directMessages.receiverId, user.id)),
            ),
        );

    if (!allDMs.length) return { success: true };

    // Soft-delete for me only
    await db
        .insert(messageDeletions)
        .values(allDMs.map(({ id }) => ({ userId: user.id, dmId: id })))
        .onConflictDoNothing();

    return { success: true };
};
