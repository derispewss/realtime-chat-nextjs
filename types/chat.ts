import type React from "react";

// ---- Sender ----
export interface ISender {
    id: string;
    username: string;
    avatarUrl: string | null;
}

// ---- Messages ----
export interface IMessage {
    id: string;
    content: string;
    createdAt: Date;
    deliveredAt?: Date | null;
    readAt?: Date | null;
    sender: ISender;
}

// DM messages always have deliveredAt/readAt fields
export interface IDMMessage {
    id: string;
    content: string;
    createdAt: Date;
    deliveredAt: Date | null;
    readAt: Date | null;
    sender: ISender;
}

// ---- Room / Group ----
export interface IRoom {
    id: string;
    name: string;
    description: string | null;
    ownerId: string;
    createdAt: Date;
}

export interface IRoomMember {
    id: string;
    username: string;
    avatarUrl: string | null;
    role: string;
}

// ---- Profile ----
export interface IProfile {
    id: string;
    username: string;
    avatarUrl: string | null;
}

export interface ISearchUser {
    id: string;
    username: string;
    email: string;
    avatarUrl: string | null;
}

// ---- DM partner ----
export interface IDMPartner {
    id: string;
    username: string;
    avatarUrl: string | null;
}

// ---- Edit state ----
export interface IEditingMessage {
    id: string;
    content: string;
}

// ---- Readers (seen by) ----
export interface IMessageReader {
    id: string;
    username: string;
    avatarUrl: string | null;
    readAt: Date;
}

// ---- DM Info ----
export interface IDMInfo {
    id: string;
    createdAt: Date;
    deliveredAt: Date | null;
    readAt: Date | null;
    senderId: string;
}

// ---- Component Props ----

export interface IMessageBubbleProps {
    id: string;
    content: string;
    senderId: string;
    senderUsername: string;
    senderAvatarUrl?: string | null;
    isOwn: boolean;
    createdAt: Date;
    deliveredAt?: Date | null;
    readAt?: Date | null;
    isBeingEdited?: boolean;
    // Group actions
    onStartEdit?: (messageId: string, content: string) => void;
    onDeleteForMe?: (messageId: string) => Promise<void>;
    onDeleteForEveryone?: (messageId: string) => Promise<void>;
    onViewSeen?: (messageId: string) => void;
    // DM actions
    onDMInfo?: (messageId: string) => void;
    onDeleteForBoth?: (messageId: string) => Promise<void>;
    // Group chat user — click avatar to DM
    onChatUser?: (userId: string) => void;
}

export interface IMessageListProps {
    messages: IMessage[];
    currentUserId: string;
    typingUsers?: string[];
    editingMessageId?: string | null;
    onStartEdit?: (messageId: string, content: string) => void;
    // Group delete modes
    onDeleteForMe?: (messageId: string) => Promise<void>;
    onDeleteForEveryone?: (messageId: string) => Promise<void>;
    onViewSeen?: (messageId: string) => void;
    // DM  actions
    onDMInfo?: (messageId: string) => void;
    onDeleteForBoth?: (messageId: string) => Promise<void>;
    // Group chat user
    onChatUser?: (userId: string) => void;
}

export interface IMessageInputProps {
    onSend: (content: string) => Promise<void>;
    onType?: () => void;
    disabled?: boolean;
    editingMessage?: IEditingMessage | null;
    onCancelEdit?: () => void;
}

export interface IGroupChatWindowProps {
    lang: string;
    roomId: string;
    currentUserId: string;
    currentUsername: string;
    initialMessages: IMessage[];
}

export interface IDMChatWindowProps {
    currentUserId: string;
    currentUsername: string;
    partnerId: string;
    initialMessages: IDMMessage[];
}

export interface IChatConversationSkeletonProps {
    type: "dm" | "group";
}

export interface IUserPresenceBadgeProps {
    currentUserId: string;
    targetUserId: string;
}

export interface ISearchUserDialogProps {
    lang: string;
    trigger: React.ReactNode;
    mode: "dm" | "invite";
    onInvite?: (userId: string) => Promise<void>;
}

export interface ICreateGroupDialogProps {
    lang: string;
    trigger: React.ReactNode;
}
