"use client";

import { useState } from "react";
import { RoomHeader } from "@/components/chat/room-header";
import { GroupInfoSheet } from "@/components/chat/group-info-sheet";
import { GroupChatWindow } from "@/components/chat/group-chat-window";
import type { IMessage } from "@/types/chat";

interface IMember {
    id: string;
    username: string;
    avatarUrl: string | null;
    role: string;
}

interface IRoom {
    id: string;
    name: string;
    description: string | null;
    ownerId: string;
    createdAt: Date;
}

interface IGroupRoomViewProps {
    lang: string;
    room: IRoom;
    members: IMember[];
    isOwner: boolean;
    currentUserId: string;
    currentUsername: string;
    initialMessages: IMessage[];
    onInvite: (userId: string) => Promise<void>;
}

export const GroupRoomView = ({
    lang,
    room,
    members,
    isOwner,
    currentUserId,
    currentUsername,
    initialMessages,
    onInvite,
}: IGroupRoomViewProps) => {
    const [infoOpen, setInfoOpen] = useState(false);

    return (
        <div className="flex h-full flex-col overflow-hidden">
            {/* Header with context menu */}
            <RoomHeader
                lang={lang}
                roomId={room.id}
                roomName={room.name}
                roomDescription={room.description}
                memberCount={members.length}
                isOwner={isOwner}
                onShowInfo={() => setInfoOpen(true)}
                onInvite={onInvite}
            />

            {/* Scrollable chat area */}
            <GroupChatWindow
                lang={lang}
                roomId={room.id}
                currentUserId={currentUserId}
                currentUsername={currentUsername}
                initialMessages={initialMessages}
            />

            {/* Group info slide-in */}
            <GroupInfoSheet
                open={infoOpen}
                onClose={() => setInfoOpen(false)}
                roomName={room.name}
                roomDescription={room.description}
                createdAt={room.createdAt}
                members={members}
                currentUserId={currentUserId}
            />
        </div>
    );
};
