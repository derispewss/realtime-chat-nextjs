"use server";

import { db } from "@/db";
import { directMessages } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { and, eq, isNull } from "drizzle-orm";

export const sendDM = async (receiverId: string, content: string) => {
    const user = await requireAuth();

    const [message] = await db
        .insert(directMessages)
        .values({
            senderId: user.id,
            receiverId,
            content,
        })
        .returning({
            id: directMessages.id,
            content: directMessages.content,
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

export const deleteDM = async (messageId: string) => {
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

    if (!message) {
        return { error: "Message not found or not yours" };
    }

    return { success: true, messageId: message.id };
};
