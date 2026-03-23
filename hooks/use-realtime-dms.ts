"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { markDMDelivered, markDMRead } from "@/app/actions/direct-messages";

interface IRealtimeDM {
    id: string;
    content: string;
    createdAt: Date;
    deliveredAt: Date | null;
    readAt: Date | null;
    sender: {
        id: string;
        username: string;
        avatarUrl: string | null;
    };
}

interface IDMRealtimeRow {
    id: string;
    content: string;
    sender_id: string;
    receiver_id: string;
    created_at: string;
    delivered_at: string | null;
    read_at: string | null;
}

interface IDMRealtimeOldRow {
    id: string;
    sender_id: string;
    receiver_id: string;
}

interface IRealtimeDMSyncResponse {
    messages: Array<{
        id: string;
        content: string;
        createdAt: string;
        deliveredAt: string | null;
        readAt: string | null;
        sender: {
            id: string;
            username: string;
            avatarUrl: string | null;
        };
    }>;
}

interface IUseRealtimeDMOptions {
    onIncomingMessage?: (message: { id: string; content: string; senderUsername: string }) => void;
}

const mapRealtimeRow = (row: IDMRealtimeRow) => {
    return {
        id: row.id,
        content: row.content,
        senderId: row.sender_id,
        receiverId: row.receiver_id,
        createdAt: new Date(row.created_at),
        deliveredAt: row.delivered_at ? new Date(row.delivered_at) : null,
        readAt: row.read_at ? new Date(row.read_at) : null,
    };
};

export const useRealtimeDMs = (
    currentUserId: string,
    partnerId: string,
    initialMessages: IRealtimeDM[],
    options?: IUseRealtimeDMOptions,
) => {
    const [messages, setMessages] = useState(initialMessages);
    const readSyncInFlightRef = useRef(false);
    const lastReadKeyRef = useRef("");
    const isSubscribedRef = useRef(false);
    const lastServerSyncRef = useRef<string>("");
    const notifiedMessageIdsRef = useRef(new Set(initialMessages.map((message) => message.id)));

    useEffect(() => {
        notifiedMessageIdsRef.current = new Set(initialMessages.map((message) => message.id));
    }, [initialMessages, partnerId]);

    const mergeMessages = useCallback((base: IRealtimeDM[], incoming: IRealtimeDM[]) => {
        const byId = new Map<string, IRealtimeDM>();

        for (const message of base) {
            byId.set(message.id, message);
        }

        for (const message of incoming) {
            byId.set(message.id, message);
        }

        return Array.from(byId.values()).sort(
            (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
        );
    }, []);

    const appendMessage = useCallback((nextMessage: IRealtimeDM) => {
        setMessages((prev) => {
            if (prev.some((msg) => msg.id === nextMessage.id)) {
                return prev;
            }

            if (
                nextMessage.sender.id !== currentUserId &&
                !notifiedMessageIdsRef.current.has(nextMessage.id)
            ) {
                options?.onIncomingMessage?.({
                    id: nextMessage.id,
                    content: nextMessage.content,
                    senderUsername: nextMessage.sender.username,
                });
                notifiedMessageIdsRef.current.add(nextMessage.id);
            }

            return mergeMessages(prev, [nextMessage]);
        });
    }, [currentUserId, mergeMessages, options]);

    const upsertReceiptState = useCallback((messageId: string, deliveredAt: Date | null, readAt: Date | null) => {
        setMessages((prev) => {
            return prev.map((msg) => {
                if (msg.id !== messageId) {
                    return msg;
                }

                return {
                    ...msg,
                    deliveredAt,
                    readAt,
                };
            });
        });
    }, []);

    const updateMessageContent = useCallback((messageId: string, content: string) => {
        setMessages((prev) => {
            return prev.map((message) => {
                if (message.id !== messageId) {
                    return message;
                }

                return {
                    ...message,
                    content,
                };
            });
        });
    }, []);

    const removeMessage = useCallback((messageId: string) => {
        setMessages((prev) => prev.filter((message) => message.id !== messageId));
    }, []);

    const unreadIncomingKey = useMemo(() => {
        return messages
            .filter((msg) => msg.sender.id === partnerId && msg.readAt === null)
            .map((msg) => msg.id)
            .sort()
            .join(",");
    }, [messages, partnerId]);

    const syncReadState = useCallback(async () => {
        const isWindowActive =
            typeof document !== "undefined" &&
            document.visibilityState === "visible" &&
            typeof window !== "undefined" &&
            document.hasFocus();

        if (!isWindowActive) {
            return;
        }

        if (!unreadIncomingKey || readSyncInFlightRef.current || lastReadKeyRef.current === unreadIncomingKey) {
            return;
        }

        readSyncInFlightRef.current = true;

        try {
            await markDMRead(partnerId);
            lastReadKeyRef.current = unreadIncomingKey;
        } finally {
            readSyncInFlightRef.current = false;
        }
    }, [partnerId, unreadIncomingKey]);

    const syncConversationFromServer = useCallback(async () => {
        const afterQuery = lastServerSyncRef.current
            ? `?after=${encodeURIComponent(lastServerSyncRef.current)}`
            : "";

        const response = await fetch(`/api/realtime/dms/${partnerId}${afterQuery}`, {
            method: "GET",
            credentials: "same-origin",
            cache: "no-store",
        });

        if (!response.ok) {
            return;
        }

        const payload = (await response.json()) as IRealtimeDMSyncResponse;
        if (!payload.messages || payload.messages.length === 0) {
            return;
        }

        const serverMessages = payload.messages.map((message) => ({
            id: message.id,
            content: message.content,
            createdAt: new Date(message.createdAt),
            deliveredAt: message.deliveredAt ? new Date(message.deliveredAt) : null,
            readAt: message.readAt ? new Date(message.readAt) : null,
            sender: {
                id: message.sender.id,
                username: message.sender.username,
                avatarUrl: message.sender.avatarUrl,
            },
        } satisfies IRealtimeDM));

        lastServerSyncRef.current = serverMessages[serverMessages.length - 1].createdAt.toISOString();
        setMessages((prev) => mergeMessages(prev, serverMessages));
    }, [mergeMessages, partnerId]);

    useEffect(() => {
        const supabase = createClient();

        const channel = supabase
            .channel(`dm:${[currentUserId, partnerId].sort().join("-")}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "direct_messages",
                },
                async (payload) => {
                    const row = payload.new as IDMRealtimeRow;
                    const newMsg = mapRealtimeRow(row);

                    // Only show messages for this conversation
                    const isThisConversation =
                        (newMsg.senderId === currentUserId &&
                            newMsg.receiverId === partnerId) ||
                        (newMsg.senderId === partnerId &&
                            newMsg.receiverId === currentUserId);

                    if (!isThisConversation) return;

                    const { data: sender } = await supabase
                        .from("profiles")
                        .select("id, username, avatar_url")
                        .eq("id", newMsg.senderId)
                        .single();

                    appendMessage({
                        id: newMsg.id,
                        content: newMsg.content,
                        createdAt: newMsg.createdAt,
                        deliveredAt: newMsg.deliveredAt,
                        readAt: newMsg.readAt,
                        sender: {
                            id: sender?.id ?? newMsg.senderId,
                            username: sender?.username ?? "User",
                            avatarUrl: sender?.avatar_url ?? null,
                        },
                    });

                    if (newMsg.receiverId === currentUserId) {
                        await markDMDelivered(newMsg.id);

                        if (document.visibilityState === "visible") {
                            await markDMRead(partnerId);
                        }
                    }
                },
            )
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "direct_messages",
                },
                (payload) => {
                    const row = payload.new as IDMRealtimeRow;
                    const updatedMsg = mapRealtimeRow(row);
                    const isThisConversation =
                        (updatedMsg.senderId === currentUserId &&
                            updatedMsg.receiverId === partnerId) ||
                        (updatedMsg.senderId === partnerId &&
                            updatedMsg.receiverId === currentUserId);

                    if (!isThisConversation) return;

                    upsertReceiptState(
                        updatedMsg.id,
                        updatedMsg.deliveredAt,
                        updatedMsg.readAt,
                    );

                    updateMessageContent(updatedMsg.id, updatedMsg.content);
                },
            )
            .on(
                "postgres_changes",
                {
                    event: "DELETE",
                    schema: "public",
                    table: "direct_messages",
                },
                (payload) => {
                    const oldRow = payload.old as IDMRealtimeOldRow;

                    const isThisConversation =
                        (oldRow.sender_id === currentUserId && oldRow.receiver_id === partnerId) ||
                        (oldRow.sender_id === partnerId && oldRow.receiver_id === currentUserId);

                    if (!isThisConversation) {
                        return;
                    }

                    removeMessage(oldRow.id);
                },
            )
            .subscribe((status) => {
                isSubscribedRef.current = status === "SUBSCRIBED";

                if (status === "SUBSCRIBED") {
                    void syncConversationFromServer();
                }
            });

        return () => {
            isSubscribedRef.current = false;
            supabase.removeChannel(channel);
        };
    }, [
        appendMessage,
        currentUserId,
        partnerId,
        removeMessage,
        syncConversationFromServer,
        updateMessageContent,
        upsertReceiptState,
    ]);

    useEffect(() => {
        void syncReadState();
    }, [syncReadState]);

    useEffect(() => {
        const handleVisibility = () => {
            void syncReadState();
            void syncConversationFromServer();
        };

        const handleOnline = () => {
            void syncConversationFromServer();
        };

        const recoveryInterval = window.setInterval(() => {
            const shouldSync =
                document.visibilityState === "visible" &&
                (document.hasFocus() || !isSubscribedRef.current);

            if (shouldSync) {
                void syncConversationFromServer();
            }
        }, 2500);

        document.addEventListener("visibilitychange", handleVisibility);
        window.addEventListener("focus", handleVisibility);
        window.addEventListener("online", handleOnline);

        return () => {
            window.clearInterval(recoveryInterval);
            document.removeEventListener("visibilitychange", handleVisibility);
            window.removeEventListener("focus", handleVisibility);
            window.removeEventListener("online", handleOnline);
        };
    }, [syncConversationFromServer, syncReadState]);

    return {
        messages,
        appendMessage,
        updateMessageContent,
        removeMessage,
    };
};
