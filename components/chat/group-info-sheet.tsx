"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Crown, Hash, Users } from "lucide-react";

interface IMember {
    id: string;
    username: string;
    avatarUrl: string | null;
    role: string;
}

interface IGroupInfoSheetProps {
    open: boolean;
    onClose: () => void;
    roomName: string;
    roomDescription?: string | null;
    createdAt?: Date | string;
    members: IMember[];
    currentUserId: string;
}

export const GroupInfoSheet = ({
    open,
    onClose,
    roomName,
    roomDescription,
    createdAt,
    members,
    currentUserId,
}: IGroupInfoSheetProps) => {
    const owner = members.find((m) => m.role === "owner");

    const formattedDate = createdAt
        ? new Intl.DateTimeFormat("en", {
              day: "numeric",
              month: "long",
              year: "numeric",
          }).format(new Date(createdAt))
        : null;

    return (
        <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
            <SheetContent side="right" className="flex w-80 flex-col gap-0 p-0 sm:w-96">
                <SheetHeader className="border-b px-5 py-4">
                    <SheetTitle className="flex items-center gap-2 text-base">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        Group Info
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto">
                    {/* Group identity */}
                    <div className="flex flex-col items-center gap-3 border-b px-5 py-6 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                            <Hash className="h-7 w-7 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-lg font-semibold leading-tight">{roomName}</p>
                            {roomDescription && (
                                <p className="mt-1 text-sm text-muted-foreground">{roomDescription}</p>
                            )}
                            {formattedDate && (
                                <p className="mt-2 text-xs text-muted-foreground">
                                    Created {formattedDate}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Members */}
                    <div className="px-5 py-4">
                        <div className="mb-3 flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-semibold">
                                {members.length} member{members.length !== 1 ? "s" : ""}
                            </span>
                        </div>

                        <ul className="space-y-1">
                            {members.map((member) => {
                                const isYou = member.id === currentUserId;
                                const initials = member.username.slice(0, 2).toUpperCase();
                                return (
                                    <li
                                        key={member.id}
                                        className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/50"
                                    >
                                        <Avatar className="h-8 w-8 shrink-0">
                                            <AvatarFallback className="text-xs font-semibold">
                                                {initials}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex min-w-0 flex-1 items-center gap-2">
                                            <span className="truncate text-sm font-medium">
                                                {member.username}
                                                {isYou && (
                                                    <span className="ml-1 text-muted-foreground font-normal">
                                                        (you)
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                        {member.role === "owner" && (
                                            <Badge
                                                variant="secondary"
                                                className="shrink-0 gap-1 text-[10px]"
                                            >
                                                <Crown className="h-2.5 w-2.5" />
                                                Owner
                                            </Badge>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};
