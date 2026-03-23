import { db } from "@/db";
import { rooms, roomMembers, profiles } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export const getRoomsByUser = async (userId: string) => {
    return db
        .select({
            id: rooms.id,
            name: rooms.name,
            description: rooms.description,
            ownerId: rooms.ownerId,
            createdAt: rooms.createdAt,
        })
        .from(rooms)
        .innerJoin(roomMembers, eq(rooms.id, roomMembers.roomId))
        .where(eq(roomMembers.userId, userId));
};

export const getRoomById = async (roomId: string) => {
    const [room] = await db
        .select()
        .from(rooms)
        .where(eq(rooms.id, roomId))
        .limit(1);
    return room ?? null;
};

export const getRoomMembers = async (roomId: string) => {
    return db
        .select({
            id: profiles.id,
            username: profiles.username,
            avatarUrl: profiles.avatarUrl,
            role: roomMembers.role,
        })
        .from(roomMembers)
        .innerJoin(profiles, eq(roomMembers.userId, profiles.id))
        .where(eq(roomMembers.roomId, roomId));
};

export const isRoomMember = async (roomId: string, userId: string) => {
    const [row] = await db
        .select({ id: roomMembers.id })
        .from(roomMembers)
        .where(and(eq(roomMembers.roomId, roomId), eq(roomMembers.userId, userId)))
        .limit(1);
    return !!row;
};
