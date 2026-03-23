"use client";

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./message-bubble";
import { TypingIndicator } from "./typing-indicator";
import { AnimatePresence } from "framer-motion";
import type { IMessageListProps } from "@/types/chat";

export const MessageList = ({
    messages,
    currentUserId,
    typingUsers = [],
    editingMessageId,
    onStartEdit,
    onDeleteForMe,
    onDeleteForEveryone,
    onViewSeen,
    onDMInfo,
    onDeleteForBoth,
    onChatUser,
}: IMessageListProps) => {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timeout = setTimeout(() => {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 50);
        return () => clearTimeout(timeout);
    }, [messages, typingUsers]);

    if (messages.length === 0 && typingUsers.length === 0) {
        return (
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                No messages yet. Say hello! 👋
            </div>
        );
    }

    return (
        <ScrollArea className="flex-1 px-4 py-3">
            <div className="flex flex-col gap-3">
                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <MessageBubble
                            key={msg.id}
                            id={msg.id}
                            content={msg.content}
                            senderId={msg.sender.id}
                            senderUsername={msg.sender.username}
                            senderAvatarUrl={msg.sender.avatarUrl}
                            isOwn={msg.sender.id === currentUserId}
                            createdAt={msg.createdAt}
                            deliveredAt={msg.deliveredAt}
                            readAt={msg.readAt}
                            isBeingEdited={editingMessageId === msg.id}
                            onStartEdit={onStartEdit}
                            onDeleteForMe={onDeleteForMe}
                            onDeleteForEveryone={onDeleteForEveryone}
                            onViewSeen={onViewSeen}
                            onDMInfo={onDMInfo}
                            onDeleteForBoth={onDeleteForBoth}
                            onChatUser={onChatUser}
                        />
                    ))}
                    {typingUsers.length > 0 && (
                        <TypingIndicator key="typing-indicator" usernames={typingUsers} />
                    )}
                </AnimatePresence>
                <div ref={bottomRef} className="h-1" />
            </div>
        </ScrollArea>
    );
};
