"use client";

import {
    deleteGroupMessageForEveryone,
    deleteGroupMessageForMe,
    editGroupMessage,
    sendGroupMessage,
} from "@/app/actions/groups";
import { MessageInput } from "@/components/chat/message-input";
import { MessageList } from "@/components/chat/message-list";
import { SeenBySheet } from "@/components/chat/seen-by-sheet";
import { useRealtimeMessages } from "@/hooks/use-realtime-messages";
import { useTypingIndicator } from "@/hooks/use-typing-indicator";
import debounce from "lodash.debounce";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import type { IGroupChatWindowProps, IEditingMessage } from "@/types/chat";


export const GroupChatWindow = ({
    lang,
    roomId,
    currentUserId,
    currentUsername,
    initialMessages,
}: IGroupChatWindowProps) => {
    const router = useRouter();
    const [editingMessage, setEditingMessage] = useState<IEditingMessage | null>(null);
    const [seenByMessageId, setSeenByMessageId] = useState<string | null>(null);
    const SOUND_KEY = "chat.notifications.sound";
    const DESKTOP_KEY = "chat.notifications.desktop";

    const notifyIncoming = useCallback((payload: { senderUsername: string; content: string }) => {
        if (typeof window === "undefined") {
            return;
        }

        const soundEnabled = window.localStorage.getItem(SOUND_KEY) !== "false";
        const desktopEnabled = window.localStorage.getItem(DESKTOP_KEY) === "true";

        if (soundEnabled) {
            try {
                const audioContext = new window.AudioContext();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.type = "sine";
                oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.02, audioContext.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.12);

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.12);
            } catch {
                // Ignore audio API errors in unsupported environments.
            }
        }

        const isBackgrounded =
            typeof document !== "undefined" &&
            (document.visibilityState !== "visible" || !document.hasFocus());

        if (
            desktopEnabled &&
            isBackgrounded &&
            typeof Notification !== "undefined" &&
            Notification.permission === "granted"
        ) {
            new Notification(payload.senderUsername, {
                body: payload.content,
            });
        }
    }, []);

    const { messages, appendMessage, updateMessageContent, removeMessage } = useRealtimeMessages(
        roomId,
        initialMessages,
        {
            currentUserId,
            onIncomingMessage: notifyIncoming,
        },
    );
    const { typingUsers, sendTypingEvent } = useTypingIndicator(roomId, currentUserId, currentUsername);

    const handleSend = async (content: string) => {
        if (editingMessage) {
            const result = await editGroupMessage(roomId, editingMessage.id, content);
            if (result.message) {
                updateMessageContent(result.message.id, result.message.content);
            }
            setEditingMessage(null);
            return;
        }

        const result = await sendGroupMessage(roomId, content);
        if (result.message) {
            appendMessage({
                id: result.message.id,
                content: result.message.content,
                createdAt: new Date(result.message.createdAt),
                sender: {
                    id: currentUserId,
                    username: currentUsername,
                    avatarUrl: null,
                },
            });
        }
    };

    const handleStartEdit = (messageId: string, content: string) => {
        setEditingMessage({ id: messageId, content });
    };

    const handleCancelEdit = () => {
        setEditingMessage(null);
    };

    const handleDeleteForEveryone = async (messageId: string) => {
        const result = await deleteGroupMessageForEveryone(roomId, messageId);
        if (result.success) removeMessage(messageId);
    };

    const handleDeleteForMe = async (messageId: string) => {
        await deleteGroupMessageForMe(roomId, messageId);
        removeMessage(messageId); // hide locally immediately
    };

    const handleChatUser = (userId: string) => {
        router.push(`/${lang}/chat/dms/${userId}`);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const handleType = useCallback(
        debounce(() => {
            sendTypingEvent();
        }, 1000, { leading: true, trailing: false }),
        [sendTypingEvent],
    );

    return (
        <div className="flex flex-1 flex-col overflow-hidden">
            <MessageList
                messages={messages}
                currentUserId={currentUserId}
                typingUsers={typingUsers}
                editingMessageId={editingMessage?.id}
                onStartEdit={handleStartEdit}
                onDeleteForMe={handleDeleteForMe}
                onDeleteForEveryone={handleDeleteForEveryone}
                onViewSeen={(id) => setSeenByMessageId(id)}
                onChatUser={handleChatUser}
            />
            <MessageInput
                onSend={handleSend}
                onType={handleType}
                editingMessage={editingMessage}
                onCancelEdit={handleCancelEdit}
            />
            <SeenBySheet
                messageId={seenByMessageId}
                onClose={() => setSeenByMessageId(null)}
            />
        </div>
    );
};
