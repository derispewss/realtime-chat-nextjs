"use client";

import { deleteDMForBoth, deleteDMForMe, editDM, sendDM } from "@/app/actions/direct-messages";
import { MessageInput } from "@/components/chat/message-input";
import { MessageList } from "@/components/chat/message-list";
import { DMInfoSheet } from "@/components/chat/dm-info-sheet";
import { useRealtimeDMs } from "@/hooks/use-realtime-dms";
import { useTypingIndicator } from "@/hooks/use-typing-indicator";
import { useE2EE } from "@/hooks/use-e2ee";
import debounce from "lodash.debounce";
import { useCallback, useEffect, useState } from "react";
import type { IDMChatWindowProps, IEditingMessage, IDMMessage } from "@/types/chat";

export const DMChatWindow = ({
    currentUserId,
    currentUsername,
    partnerId,
    initialMessages,
}: IDMChatWindowProps) => {
    const [editingMessage, setEditingMessage] = useState<IEditingMessage | null>(null);
    const [dmInfoMessageId, setDmInfoMessageId] = useState<string | null>(null);
    const [decryptedMessages, setDecryptedMessages] = useState<IDMMessage[]>([]);

    const SOUND_KEY = "chat.notifications.sound";
    const DESKTOP_KEY = "chat.notifications.desktop";

    // ── E2EE ─────────────────────────────────────────────────────────────────
    const { ready: e2eeReady, encrypt, safeDecrypt } = useE2EE(currentUserId, partnerId);

    // ── Notification ─────────────────────────────────────────────────────────
    const notifyIncoming = useCallback((payload: { senderUsername: string; content: string }) => {
        if (typeof window === "undefined") return;

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
                // Ignore audio API errors
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
                // Never show plaintext in notifications — show generic message
                body: e2eeReady ? "🔒 New encrypted message" : payload.content,
            });
        }
    }, [e2eeReady]);

    const { messages: rawMessages, appendMessage, updateMessageContent, removeMessage } = useRealtimeDMs(
        currentUserId,
        partnerId,
        initialMessages,
        { onIncomingMessage: notifyIncoming },
    );

    // ── Decrypt all messages whenever raw messages or E2EE key changes ────────
    useEffect(() => {
        const run = async () => {
            const decrypted = await Promise.all(
                rawMessages.map(async (msg) => {
                    const plaintext = await safeDecrypt(
                        msg.content,
                        (msg as IDMMessage).iv ?? null,
                        (msg as IDMMessage).isEncrypted ?? "false",
                    );
                    return { ...msg, content: plaintext } as IDMMessage;
                }),
            );
            setDecryptedMessages(decrypted);
        };
        run();
    }, [rawMessages, safeDecrypt]);

    const dmRoomId = [currentUserId, partnerId].sort().join("-");
    const { typingUsers, sendTypingEvent } = useTypingIndicator(dmRoomId, currentUserId, currentUsername);

    // ── Send ─────────────────────────────────────────────────────────────────
    const handleSend = async (content: string) => {
        if (editingMessage) {
            const result = await editDM(editingMessage.id, content);
            if (result.message) {
                updateMessageContent(result.message.id, result.message.content);
            }
            setEditingMessage(null);
            return;
        }

        let payload: string;
        let iv: string | undefined;
        let isEncrypted = false;

        if (e2eeReady) {
            try {
                const enc = await encrypt(content);
                payload = enc.ciphertext;
                iv = enc.iv;
                isEncrypted = true;
            } catch {
                // Fallback to plaintext if encryption fails
                payload = content;
            }
        } else {
            payload = content;
        }

        const result = await sendDM(partnerId, payload, { iv, isEncrypted });
        if (result.message) {
            // Optimistic: show decrypted plaintext immediately for sender
            appendMessage({
                id: result.message.id,
                content, // always show original plaintext locally
                createdAt: new Date(result.message.createdAt),
                deliveredAt: result.message.deliveredAt
                    ? new Date(result.message.deliveredAt)
                    : null,
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
        removeMessage(messageId);
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
            {/* E2EE indicator */}
            {e2eeReady && (
                <div className="flex items-center justify-center gap-1.5 border-b bg-muted/30 px-4 py-1.5 text-[11px] text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    End-to-end encrypted
                </div>
            )}

            <MessageList
                messages={decryptedMessages}
                currentUserId={currentUserId}
                typingUsers={typingUsers}
                variant="dm"
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
