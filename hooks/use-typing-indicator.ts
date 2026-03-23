import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export const useTypingIndicator = (roomId: string, currentUserId: string, currentUsername: string) => {
    const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
    const supabase = createClient();

    useEffect(() => {
        const channel = supabase.channel(`typing:${roomId}`);

        channel
            .on("broadcast", { event: "typing" }, (payload) => {
                if (payload.payload.userId === currentUserId) return;

                const username = payload.payload.username;
                
                setTypingUsers((prev) => {
                    const next = new Set(prev);
                    next.add(username);
                    return next;
                });

                // Clear after 3 seconds of inactvity
                setTimeout(() => {
                    setTypingUsers((prev) => {
                        const next = new Set(prev);
                        next.delete(username);
                        return next;
                    });
                }, 3000);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [roomId, currentUserId, supabase]);

    const sendTypingEvent = async () => {
        const channel = supabase.channel(`typing:${roomId}`);
        await channel.send({
            type: "broadcast",
            event: "typing",
            payload: { userId: currentUserId, username: currentUsername },
        });
    };

    return {
        typingUsers: Array.from(typingUsers),
        sendTypingEvent,
    };
};
