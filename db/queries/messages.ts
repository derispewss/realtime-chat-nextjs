import { db } from "@/db";
import { messages, profiles } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export const getMessagesByRoom = async (roomId: string) => {
    return db
        .select({
            id: messages.id,
            content: messages.content,
            createdAt: messages.createdAt,
            sender: {
                id: profiles.id,
                username: profiles.username,
                avatarUrl: profiles.avatarUrl,
            },
        })
        .from(messages)
        .innerJoin(profiles, eq(messages.senderId, profiles.id))
        .where(eq(messages.roomId, roomId))
        .orderBy(asc(messages.createdAt));
};
