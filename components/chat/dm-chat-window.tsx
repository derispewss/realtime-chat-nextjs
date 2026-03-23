"use client";

import { deleteDMForBoth, deleteDMForMe, editDM, sendDM } from "@/app/actions/direct-messages";
import { MessageInput } from "@/components/chat/message-input";
import { MessageList } from "@/components/chat/message-list";
import { DMInfoSheet } from "@/components/chat/dm-info-sheet";
import { useRealtimeDMs } from "@/hooks/use-realtime-dms";
import { useTypingIndicator } from "@/hooks/use-typing-indicator";
import debounce from "lodash.debounce";
import { useCallback, useState } from "react";
import type { IDMChatWindowProps, IEditingMessage } from "@/types/chat";


export const DMChatWindow = ({
    currentUserId,
    currentUsername,
    partnerId,
    initialMessages,
}: IDMChatWindowProps) => {
    const [editingMessage, setEditingMessage] = useState<IEditingMessage | null>(null);
    const [dmInfoMessageId, setDmInfoMessageId] = useState<string | null>(null);
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
        if (editingMessage) {
            const result = await editDM(editingMessage.id, content);
            if (result.message) {
                updateMessageContent(result.message.id, result.message.content);
            }
            setEditingMessage(null);
            return;
        }

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

    const handleStartEdit = (messageId: string, content: string) => {
        setEditingMessage({ id: messageId, content });
    };

    const handleCancelEdit = () => {
        setEditingMessage(null);
    };

    const handleDeleteForBoth = async (messageId: string) => {
        const result = await deleteDMForBoth(messageId);
        if (result.success) removeMessage(messageId);
    };

    const handleDeleteForMe = async (messageId: string) => {
        await deleteDMForMe(messageId);
        removeMessage(messageId); // hide locally
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
                onDeleteForBoth={handleDeleteForBoth}
                onDMInfo={(id) => setDmInfoMessageId(id)}
            />
            <MessageInput
                onSend={handleSend}
                onType={handleType}
                editingMessage={editingMessage}
                onCancelEdit={handleCancelEdit}
            />
            <DMInfoSheet
                messageId={dmInfoMessageId}
                onClose={() => setDmInfoMessageId(null)}
            />
        </div>
    );
};
