"use client";

import { cn } from "@/lib/utils";
import { useUserPresence } from "@/hooks/use-user-presence";

interface IUserPresenceBadgeProps {
    currentUserId: string;
    targetUserId: string;
}

export const UserPresenceBadge = ({ currentUserId, targetUserId }: IUserPresenceBadgeProps) => {
    const { status } = useUserPresence(currentUserId, targetUserId);

    return (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
                className={cn(
                    "h-2 w-2 rounded-full",
                    status === "online" && "bg-foreground",
                    status === "idle" && "bg-muted-foreground",
                    status === "offline" && "bg-border",
                )}
            />
            <span className="capitalize">{status}</span>
        </div>
    );
};
