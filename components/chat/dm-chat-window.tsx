"use client";

import { deleteDM, editDM, sendDM } from "@/app/actions/direct-messages";
import { MessageInput } from "@/components/chat/message-input";
import { MessageList } from "@/components/chat/message-list";
import { useRealtimeDMs } from "@/hooks/use-realtime-dms";
import { useTypingIndicator } from "@/hooks/use-typing-indicator";
import debounce from "lodash.debounce";
import { useCallback } from "react";

interface IMessage {
    id: string;
    content: string;
    createdAt: Date;
    deliveredAt: Date | null;
    readAt: Date | null;
    sender: { id: string; username: string; avatarUrl: string | null };
}

interface IDMChatWindowProps {
    currentUserId: string;
    currentUsername: string;
    partnerId: string;
    initialMessages: IMessage[];
}

export const DMChatWindow = ({
    currentUserId,
    currentUsername,
    partnerId,
    initialMessages,
}: IDMChatWindowProps) => {
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

    const { messages, appendMessage, updateMessageContent, removeMessage } = useRealtimeDMs(
        currentUserId,
        partnerId,
        initialMessages,
        {
            onIncomingMessage: notifyIncoming,
        },
    );

    // Sort IDs to create a unique room ID for this specific DM pairs' typing channel
    const dmRoomId = [currentUserId, partnerId].sort().join("-");
    const { typingUsers, sendTypingEvent } = useTypingIndicator(dmRoomId, currentUserId, currentUsername);

    const handleSend = async (content: string) => {
        const result = await sendDM(partnerId, content);
        if (result.message) {
            appendMessage({
                id: result.message.id,
                content: result.message.content,
                createdAt: new Date(result.message.createdAt),
                deliveredAt: result.message.deliveredAt ? new Date(result.message.deliveredAt) : null,
                readAt: result.message.readAt ? new Date(result.message.readAt) : null,
                sender: {
                    id: currentUserId,
                    username: currentUsername,
                    avatarUrl: null,
                },
            });
        }
    };

    const handleEdit = async (messageId: string, content: string) => {
        const result = await editDM(messageId, content);
        if (result.message) {
            updateMessageContent(result.message.id, result.message.content);
        }
    };

    const handleDelete = async (messageId: string) => {
        const result = await deleteDM(messageId);
        if (result.success) {
            removeMessage(messageId);
        }
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
                onEditMessage={handleEdit}
                onDeleteMessage={handleDelete}
            />
            <MessageInput onSend={handleSend} onType={handleType} />
        </div>
    );
};
