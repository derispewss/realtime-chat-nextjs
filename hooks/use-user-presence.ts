"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type TPresenceStatus = "online" | "idle" | "offline";

interface IPresencePayload {
    userId: string;
    status: Exclude<TPresenceStatus, "offline">;
    updatedAt: string;
}

const getCurrentActivity = (): Exclude<TPresenceStatus, "offline"> => {
    const isVisible = document.visibilityState === "visible";
    const isFocused = document.hasFocus();

    return isVisible && isFocused ? "online" : "idle";
};

const getTargetStatus = (
    presence: Record<string, IPresencePayload[]>,
    targetUserId: string,
): TPresenceStatus => {
    const targetEntries = presence[targetUserId] ?? [];

    if (targetEntries.length === 0) {
        return "offline";
    }

    if (targetEntries.some((entry) => entry.status === "online")) {
        return "online";
    }

    return "idle";
};

export const useUserPresence = (currentUserId: string, targetUserId: string) => {
    const [status, setStatus] = useState<TPresenceStatus>("offline");

    useEffect(() => {
        const supabase = createClient();
        const channel = supabase.channel("presence:chat", {
            config: {
                presence: {
                    key: currentUserId,
                },
            },
        });

        const trackCurrentStatus = async () => {
            await channel.track({
                userId: currentUserId,
                status: getCurrentActivity(),
                updatedAt: new Date().toISOString(),
            });
        };

        const handlePresenceSync = () => {
            const state = channel.presenceState<IPresencePayload>();
            setStatus(getTargetStatus(state, targetUserId));
        };

        channel
            .on("presence", { event: "sync" }, handlePresenceSync)
            .on("presence", { event: "join" }, handlePresenceSync)
            .on("presence", { event: "leave" }, handlePresenceSync)
            .subscribe(async (subscriptionStatus) => {
                if (subscriptionStatus === "SUBSCRIBED") {
                    await trackCurrentStatus();
                }
            });

        const handleActivityChange = () => {
            void trackCurrentStatus();
        };

        document.addEventListener("visibilitychange", handleActivityChange);
        window.addEventListener("focus", handleActivityChange);
        window.addEventListener("blur", handleActivityChange);

        return () => {
            document.removeEventListener("visibilitychange", handleActivityChange);
            window.removeEventListener("focus", handleActivityChange);
            window.removeEventListener("blur", handleActivityChange);
            void channel.untrack();
            void supabase.removeChannel(channel);
        };
    }, [currentUserId, targetUserId]);

    return { status };
};
