import { db } from "@/db";
import { directMessages, profiles } from "@/db/schema";
import { eq, or, and, asc, isNull, desc, sql } from "drizzle-orm";

export interface IDMPartnerWithLastMessage {
    id: string;
    username: string;
    avatarUrl: string | null;
    unreadCount: number;
    lastMessage: {
        id: string;
        content: string;
        createdAt: Date;
        senderId: string;
        deliveredAt: Date | null;
        readAt: Date | null;
        iv?: string | null;
        isEncrypted?: string;
    } | null;
}

export const getDMConversation = async (userAId: string, userBId: string) => {
    return db
        .select({
            id: directMessages.id,
            content: directMessages.content,
            iv: directMessages.iv,
            isEncrypted: directMessages.isEncrypted,
            createdAt: directMessages.createdAt,
            deliveredAt: directMessages.deliveredAt,
            readAt: directMessages.readAt,
            sender: {
                id: profiles.id,
                username: profiles.username,
                avatarUrl: profiles.avatarUrl,
            },
        })
        .from(directMessages)
        .innerJoin(profiles, eq(directMessages.senderId, profiles.id))
        .where(
            or(
                and(
                    eq(directMessages.senderId, userAId),
                    eq(directMessages.receiverId, userBId),
                ),
                and(
                    eq(directMessages.senderId, userBId),
                    eq(directMessages.receiverId, userAId),
                ),
            ),
        )
        .orderBy(asc(directMessages.createdAt));
};

// Get all unique DM partners for the current user
export const getDMPartners = async (userId: string) => {
    const sent = await db
        .selectDistinct({ partnerId: directMessages.receiverId })
        .from(directMessages)
        .where(eq(directMessages.senderId, userId));

    const received = await db
        .selectDistinct({ partnerId: directMessages.senderId })
        .from(directMessages)
        .where(eq(directMessages.receiverId, userId));

    const partnerIds = [
        ...new Set([
            ...sent.map((r) => r.partnerId),
            ...received.map((r) => r.partnerId),
        ]),
    ];

    if (partnerIds.length === 0) return [];

    return db
        .select({
            id: profiles.id,
            username: profiles.username,
            avatarUrl: profiles.avatarUrl,
        })
        .from(profiles)
        .where(
            or(...partnerIds.map((id) => eq(profiles.id, id))),
        );
};

export const getDMPartnersWithLastMessage = async (userId: string): Promise<IDMPartnerWithLastMessage[]> => {
    const sent = await db
        .selectDistinct({ partnerId: directMessages.receiverId })
        .from(directMessages)
        .where(eq(directMessages.senderId, userId));

    const received = await db
        .selectDistinct({ partnerId: directMessages.senderId })
        .from(directMessages)
        .where(eq(directMessages.receiverId, userId));

    const partnerIds = [
        ...new Set([
            ...sent.map((row) => row.partnerId),
            ...received.map((row) => row.partnerId),
        ]),
    ];

    if (partnerIds.length === 0) {
        return [];
    }

    const partnerProfiles = await db
        .select({
            id: profiles.id,
            username: profiles.username,
            avatarUrl: profiles.avatarUrl,
        })
        .from(profiles)
        .where(or(...partnerIds.map((id) => eq(profiles.id, id))));

    const partnerWithMessage = await Promise.all(
        partnerProfiles.map(async (partner) => {
            const [lastMessage] = await db
                .select({
                    id: directMessages.id,
                    content: directMessages.content,
                    iv: directMessages.iv,
                    isEncrypted: directMessages.isEncrypted,
                    createdAt: directMessages.createdAt,
                    senderId: directMessages.senderId,
                    deliveredAt: directMessages.deliveredAt,
                    readAt: directMessages.readAt,
                })
                .from(directMessages)
                .where(
                    or(
                        and(
                            eq(directMessages.senderId, userId),
                            eq(directMessages.receiverId, partner.id),
                        ),
                        and(
                            eq(directMessages.senderId, partner.id),
                            eq(directMessages.receiverId, userId),
                        ),
                    ),
                )
                .orderBy(desc(directMessages.createdAt))
                .limit(1);

            const [unreadCountRow] = await db
                .select({ count: sql<number>`count(*)` })
                .from(directMessages)
                .where(
                    and(
                        eq(directMessages.senderId, partner.id),
                        eq(directMessages.receiverId, userId),
                        isNull(directMessages.readAt),
                    ),
                );

            return {
                id: partner.id,
                username: partner.username,
                avatarUrl: partner.avatarUrl,
                unreadCount: Number(unreadCountRow?.count ?? 0),
                lastMessage: lastMessage
                    ? {
                        id: lastMessage.id,
                        content: lastMessage.isEncrypted === "true" ? "🔒 Encrypted message" : lastMessage.content,
                        createdAt: lastMessage.createdAt,
                        senderId: lastMessage.senderId,
                        deliveredAt: lastMessage.deliveredAt,
                        readAt: lastMessage.readAt,
                        iv: lastMessage.iv,
                        isEncrypted: lastMessage.isEncrypted,
                    }
                    : null,
            } satisfies IDMPartnerWithLastMessage;
        }),
    );

    return partnerWithMessage.sort((a, b) => {
        const aTime = a.lastMessage?.createdAt?.getTime() ?? 0;
        const bTime = b.lastMessage?.createdAt?.getTime() ?? 0;
        return bTime - aTime;
    });
};

export const markDMConversationRead = async (currentUserId: string, partnerId: string) => {
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
                eq(directMessages.receiverId, currentUserId),
                isNull(directMessages.readAt),
            ),
        );
};
