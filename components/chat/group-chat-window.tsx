"use client";

import {
    deleteGroupMessage,
    editGroupMessage,
    sendGroupMessage,
} from "@/app/actions/groups";
import { MessageInput } from "@/components/chat/message-input";
import { MessageList } from "@/components/chat/message-list";
import { useRealtimeMessages } from "@/hooks/use-realtime-messages";
import { useTypingIndicator } from "@/hooks/use-typing-indicator";
import debounce from "lodash.debounce";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

interface IMessage {
    id: string;
    content: string;
    createdAt: Date;
    sender: { id: string; username: string; avatarUrl: string | null };
}

interface IGroupChatWindowProps {
    lang: string;
    roomId: string;
    currentUserId: string;
    currentUsername: string;
    initialMessages: IMessage[];
}

export const GroupChatWindow = ({
    lang,
    roomId,
    currentUserId,
    currentUsername,
    initialMessages,
}: IGroupChatWindowProps) => {
    const router = useRouter();
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

    const handleEdit = async (messageId: string, content: string) => {
        const result = await editGroupMessage(roomId, messageId, content);
        if (result.message) {
            updateMessageContent(result.message.id, result.message.content);
        }
    };

    const handleDelete = async (messageId: string) => {
        const result = await deleteGroupMessage(roomId, messageId);
        if (result.success) {
            removeMessage(messageId);
        }
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
                onEditMessage={handleEdit}
                onDeleteMessage={handleDelete}
                onChatUser={handleChatUser}
            />
            <MessageInput onSend={handleSend} onType={handleType} />
        </div>
    );
};
