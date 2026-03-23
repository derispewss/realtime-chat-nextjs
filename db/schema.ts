import {
    pgTable,
    uuid,
    text,
    timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ----------- profiles -----------

export const profiles = pgTable("profiles", {
    id: uuid("id").primaryKey(),
    username: text("username").notNull().unique(),
    email: text("email").notNull().unique(),
    avatarUrl: text("avatar_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ----------- rooms -----------

export const rooms = pgTable("rooms", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description"),
    ownerId: uuid("owner_id")
        .references(() => profiles.id, { onDelete: "cascade" })
        .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ----------- room_members -----------

export const roomMembers = pgTable("room_members", {
    id: uuid("id").primaryKey().defaultRandom(),
    roomId: uuid("room_id")
        .references(() => rooms.id, { onDelete: "cascade" })
        .notNull(),
    userId: uuid("user_id")
        .references(() => profiles.id, { onDelete: "cascade" })
        .notNull(),
    role: text("role").default("member").notNull(),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

// ----------- messages -----------

export const messages = pgTable("messages", {
    id: uuid("id").primaryKey().defaultRandom(),
    roomId: uuid("room_id")
        .references(() => rooms.id, { onDelete: "cascade" })
        .notNull(),
    senderId: uuid("sender_id")
        .references(() => profiles.id, { onDelete: "cascade" })
        .notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ----------- direct_messages -----------

export const directMessages = pgTable("direct_messages", {
    id: uuid("id").primaryKey().defaultRandom(),
    senderId: uuid("sender_id")
        .references(() => profiles.id, { onDelete: "cascade" })
        .notNull(),
    receiverId: uuid("receiver_id")
        .references(() => profiles.id, { onDelete: "cascade" })
        .notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    deliveredAt: timestamp("delivered_at"),
    readAt: timestamp("read_at"),
});

// ----------- relations -----------

export const profilesRelations = relations(profiles, ({ many }) => ({
    messages: many(messages),
    sentDMs: many(directMessages, { relationName: "sender" }),
    receivedDMs: many(directMessages, { relationName: "receiver" }),
    roomMemberships: many(roomMembers),
    ownedRooms: many(rooms),
}));

export const roomsRelations = relations(rooms, ({ one, many }) => ({
    owner: one(profiles, { fields: [rooms.ownerId], references: [profiles.id] }),
    members: many(roomMembers),
    messages: many(messages),
}));

export const roomMembersRelations = relations(roomMembers, ({ one }) => ({
    room: one(rooms, { fields: [roomMembers.roomId], references: [rooms.id] }),
    user: one(profiles, { fields: [roomMembers.userId], references: [profiles.id] }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
    room: one(rooms, { fields: [messages.roomId], references: [rooms.id] }),
    sender: one(profiles, { fields: [messages.senderId], references: [profiles.id] }),
}));

export const directMessagesRelations = relations(directMessages, ({ one }) => ({
    sender: one(profiles, {
        fields: [directMessages.senderId],
        references: [profiles.id],
        relationName: "sender",
    }),
    receiver: one(profiles, {
        fields: [directMessages.receiverId],
        references: [profiles.id],
        relationName: "receiver",
    }),
}));

// ----------- type exports -----------

export type IProfile = typeof profiles.$inferSelect;
export type INewProfile = typeof profiles.$inferInsert;
export type IRoom = typeof rooms.$inferSelect;
export type INewRoom = typeof rooms.$inferInsert;
export type IRoomMember = typeof roomMembers.$inferSelect;
export type IMessage = typeof messages.$inferSelect;
export type INewMessage = typeof messages.$inferInsert;
export type IDirectMessage = typeof directMessages.$inferSelect;
export type INewDirectMessage = typeof directMessages.$inferInsert;
