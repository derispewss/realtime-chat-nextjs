import {
    pgTable,
    uuid,
    text,
    timestamp,
    uniqueIndex,
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

// ----------- message_deletions -----------
// Soft-delete: "delete for me" — one row per user per message/DM
export const messageDeletions = pgTable("message_deletions", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
        .references(() => profiles.id, { onDelete: "cascade" })
        .notNull(),
    // Exactly one of these is set
    messageId: uuid("message_id").references(() => messages.id, { onDelete: "cascade" }),
    dmId: uuid("dm_id").references(() => directMessages.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
    uniqueIndex("message_deletions_user_message_uidx").on(t.userId, t.messageId),
    uniqueIndex("message_deletions_user_dm_uidx").on(t.userId, t.dmId),
]);

// ----------- message_reads -----------
// Group message read receipts — who has seen each message
export const messageReads = pgTable("message_reads", {
    id: uuid("id").primaryKey().defaultRandom(),
    messageId: uuid("message_id")
        .references(() => messages.id, { onDelete: "cascade" })
        .notNull(),
    userId: uuid("user_id")
        .references(() => profiles.id, { onDelete: "cascade" })
        .notNull(),
    readAt: timestamp("read_at").defaultNow().notNull(),
}, (t) => [
    uniqueIndex("message_reads_message_user_uidx").on(t.messageId, t.userId),
]);

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

export const messagesRelations = relations(messages, ({ one, many }) => ({
    room: one(rooms, { fields: [messages.roomId], references: [rooms.id] }),
    sender: one(profiles, { fields: [messages.senderId], references: [profiles.id] }),
    reads: many(messageReads),
    deletions: many(messageDeletions),
}));

export const directMessagesRelations = relations(directMessages, ({ one, many }) => ({
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
    deletions: many(messageDeletions),
}));

export const messageReadsRelations = relations(messageReads, ({ one }) => ({
    message: one(messages, { fields: [messageReads.messageId], references: [messages.id] }),
    user: one(profiles, { fields: [messageReads.userId], references: [profiles.id] }),
}));

export const messageDeletionsRelations = relations(messageDeletions, ({ one }) => ({
    user: one(profiles, { fields: [messageDeletions.userId], references: [profiles.id] }),
    message: one(messages, { fields: [messageDeletions.messageId], references: [messages.id] }),
    dm: one(directMessages, { fields: [messageDeletions.dmId], references: [directMessages.id] }),
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
export type IMessageDeletion = typeof messageDeletions.$inferSelect;
export type IMessageRead = typeof messageReads.$inferSelect;
