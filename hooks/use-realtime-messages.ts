"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface IRealtimeMessage {
    id: string;
    content: string;
    createdAt: Date;
    sender: {
        id: string;
        username: string;
        avatarUrl: string | null;
    };
}

interface IRoomRealtimeRow {
    id: string;
    room_id: string;
    sender_id: string;
    content: string;
    created_at: string;
}

interface IRoomRealtimeOldRow {
    id: string;
    room_id: string;
}

interface IRealtimeGroupSyncResponse {
    messages: Array<{
        id: string;
        content: string;
        createdAt: string;
        sender: {
            id: string;
            username: string;
            avatarUrl: string | null;
        };
    }>;
}

interface IUseRealtimeGroupOptions {
    currentUserId?: string;
    onIncomingMessage?: (message: { id: string; content: string; senderUsername: string }) => void;
}

export const useRealtimeMessages = (
    roomId: string,
    initialMessages: IRealtimeMessage[],
    options?: IUseRealtimeGroupOptions,
) => {
    const [messages, setMessages] = useState(initialMessages);
    const isSubscribedRef = useRef(false);
    const lastServerSyncRef = useRef("");
    const notifiedMessageIdsRef = useRef(new Set(initialMessages.map((message) => message.id)));

    useEffect(() => {
        notifiedMessageIdsRef.current = new Set(initialMessages.map((message) => message.id));
    }, [initialMessages, roomId]);

    const mergeMessages = useCallback((base: IRealtimeMessage[], incoming: IRealtimeMessage[]) => {
        const byId = new Map<string, IRealtimeMessage>();

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

    const appendMessage = useCallback((nextMessage: IRealtimeMessage) => {
        setMessages((prev) => {
            if (prev.some((msg) => msg.id === nextMessage.id)) {
                return prev;
            }

            if (
                options?.currentUserId &&
                nextMessage.sender.id !== options.currentUserId &&
                !notifiedMessageIdsRef.current.has(nextMessage.id)
            ) {
                options.onIncomingMessage?.({
                    id: nextMessage.id,
                    content: nextMessage.content,
                    senderUsername: nextMessage.sender.username,
                });
                notifiedMessageIdsRef.current.add(nextMessage.id);
            }

            return mergeMessages(prev, [nextMessage]);
        });
    }, [mergeMessages, options]);

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

    const syncMessagesFromServer = useCallback(async () => {
        const afterQuery = lastServerSyncRef.current
            ? `?after=${encodeURIComponent(lastServerSyncRef.current)}`
            : "";

        const response = await fetch(`/api/realtime/groups/${roomId}${afterQuery}`, {
            method: "GET",
            credentials: "same-origin",
            cache: "no-store",
        });

        if (!response.ok) {
            return;
        }

        const payload = (await response.json()) as IRealtimeGroupSyncResponse;
        if (!payload.messages || payload.messages.length === 0) {
            return;
        }

        const serverMessages = payload.messages.map((message) => {
            return {
                id: message.id,
                content: message.content,
                createdAt: new Date(message.createdAt),
                sender: {
                    id: message.sender.id,
                    username: message.sender.username,
                    avatarUrl: message.sender.avatarUrl,
                },
            } satisfies IRealtimeMessage;
        });

        lastServerSyncRef.current = serverMessages[serverMessages.length - 1].createdAt.toISOString();
        setMessages((prev) => mergeMessages(prev, serverMessages));
    }, [mergeMessages, roomId]);

    useEffect(() => {
        const supabase = createClient();

        const channel = supabase
            .channel(`room:${roomId}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "messages",
                    filter: `room_id=eq.${roomId}`,
                },
                (payload) => {
                    const row = payload.new as IRoomRealtimeRow;
                    updateMessageContent(row.id, row.content);
                },
            )
            .on(
                "postgres_changes",
                {
                    event: "DELETE",
                    schema: "public",
                    table: "messages",
                    filter: `room_id=eq.${roomId}`,
                },
                (payload) => {
                    const oldRow = payload.old as IRoomRealtimeOldRow;
                    removeMessage(oldRow.id);
                },
            )
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `room_id=eq.${roomId}`,
                },
                async (payload) => {
                    const row = payload.new as IRoomRealtimeRow;
                    const newMsg = {
                        id: row.id,
                        content: row.content,
                        createdAt: new Date(row.created_at),
                        senderId: row.sender_id,
                    };

                    const { data: sender } = await supabase
                        .from("profiles")
                        .select("id, username, avatar_url")
                        .eq("id", newMsg.senderId)
                        .single();

                    appendMessage({
                        id: newMsg.id,
                        content: newMsg.content,
                        createdAt: newMsg.createdAt,
                        sender: {
                            id: sender?.id ?? newMsg.senderId,
                            username: sender?.username ?? "User",
                            avatarUrl: sender?.avatar_url ?? null,
                        },
                    });
                },
            )
            .subscribe((status) => {
                isSubscribedRef.current = status === "SUBSCRIBED";

                if (status === "SUBSCRIBED") {
                    void syncMessagesFromServer();
                }
            });

        return () => {
            isSubscribedRef.current = false;
            supabase.removeChannel(channel);
        };
    }, [appendMessage, roomId, syncMessagesFromServer, updateMessageContent, removeMessage]);

    useEffect(() => {
        const handleSync = () => {
            void syncMessagesFromServer();
        };

        const recoveryInterval = window.setInterval(() => {
            const shouldSync =
                document.visibilityState === "visible" &&
                (document.hasFocus() || !isSubscribedRef.current);

            if (shouldSync) {
                void syncMessagesFromServer();
            }
        }, 2500);

        document.addEventListener("visibilitychange", handleSync);
        window.addEventListener("focus", handleSync);
        window.addEventListener("online", handleSync);

        return () => {
            window.clearInterval(recoveryInterval);
            document.removeEventListener("visibilitychange", handleSync);
            window.removeEventListener("focus", handleSync);
            window.removeEventListener("online", handleSync);
        };
    }, [syncMessagesFromServer]);

    return {
        messages,
        appendMessage,
        updateMessageContent,
        removeMessage,
    };
};
