"use client";

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./message-bubble";
import { TypingIndicator } from "./typing-indicator";
import { AnimatePresence } from "framer-motion";

interface IMessage {
    id: string;
    content: string;
    createdAt: Date;
    deliveredAt?: Date | null;
    readAt?: Date | null;
    sender: {
        id: string;
        username: string;
        avatarUrl: string | null;
    };
}

interface IMessageListProps {
    messages: IMessage[];
    currentUserId: string;
    typingUsers?: string[];
    onEditMessage?: (messageId: string, content: string) => Promise<void>;
    onDeleteMessage?: (messageId: string) => Promise<void>;
    onChatUser?: (userId: string) => void;
}

export const MessageList = ({
    messages,
    currentUserId,
    typingUsers = [],
    onEditMessage,
    onDeleteMessage,
    onChatUser,
}: IMessageListProps) => {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Delay slightly giving time for animation to render layout shift
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
        <ScrollArea className="flex-1 px-4 py-4">
            <div className="flex flex-col gap-4">
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
                            onEditMessage={onEditMessage}
                            onDeleteMessage={onDeleteMessage}
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
