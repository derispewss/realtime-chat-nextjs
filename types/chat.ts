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
