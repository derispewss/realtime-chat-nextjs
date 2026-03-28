"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Hash, Users, UserMinus, X, Info, UserPlus } from "lucide-react";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { leaveGroup } from "@/app/actions/groups";
import { SearchUserDialog } from "@/components/chat/search-user-dialog";

interface IRoomHeaderProps {
    lang: string;
    roomId: string;
    roomName: string;
    roomDescription?: string | null;
    memberCount: number;
    isOwner: boolean;
    onShowInfo: () => void;
    onInvite: (userId: string) => Promise<void>;
}

export const RoomHeader = ({
    lang,
    roomId,
    roomName,
    roomDescription,
    memberCount,
    isOwner,
    onShowInfo,
    onInvite,
}: IRoomHeaderProps) => {
    const router = useRouter();
    const [showLeaveDialog, setShowLeaveDialog] = useState(false);
    const [leaving, setLeaving] = useState(false);

    const handleClose = () => router.push(`/${lang}/chat`);

    const handleLeave = async () => {
        setLeaving(true);
        try {
            await leaveGroup(roomId);
            router.push(`/${lang}/chat`);
            router.refresh();
        } finally {
            setLeaving(false);
            setShowLeaveDialog(false);
        }
    };

    return (
        <>
            <ContextMenu>
                <ContextMenuTrigger asChild>
                    <header className="flex shrink-0 cursor-default select-none items-center gap-3 border-b bg-background px-4 py-3 transition-colors hover:bg-muted/20">
                        <Hash className="h-4 w-4 shrink-0 text-muted-foreground" />

                        <div className="flex min-w-0 flex-1 flex-col">
                            <h1 className="truncate font-semibold leading-tight">{roomName}</h1>
                            {roomDescription && (
                                <p className="truncate text-xs text-muted-foreground">
                                    {roomDescription}
                                </p>
                            )}
                        </div>

                        <div className="ml-auto flex items-center gap-1.5">
                            <Badge variant="secondary" className="gap-1 shrink-0">
                                <Users className="h-3 w-3" />
                                {memberCount}
                            </Badge>

                            <SearchUserDialog
                                lang={lang}
                                mode="invite"
                                onInvite={onInvite}
                                trigger={
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        aria-label="Invite member"
                                    >
                                        <UserPlus className="h-4 w-4" />
                                    </Button>
                                }
                            />

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                aria-label="Group info"
                                onClick={onShowInfo}
                            >
                                <Info className="h-4 w-4" />
                            </Button>
                        </div>
                    </header>
                </ContextMenuTrigger>

                <ContextMenuContent className="w-52">
                    <ContextMenuItem onSelect={onShowInfo}>
                        <Info className="h-4 w-4" />
                        Group info
                    </ContextMenuItem>

                    <ContextMenuSeparator />

                    <ContextMenuItem onSelect={handleClose}>
                        <X className="h-4 w-4" />
                        Close chat
                    </ContextMenuItem>

                    {!isOwner && (
                        <>
                            <ContextMenuSeparator />
                            <ContextMenuItem
                                onSelect={() => setShowLeaveDialog(true)}
                                className="text-destructive focus:text-destructive"
                            >
                                <UserMinus className="h-4 w-4" />
                                Exit group
                            </ContextMenuItem>
                        </>
                    )}
                </ContextMenuContent>
            </ContextMenu>

            {/* Confirm exit group */}
            <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Exit group?</DialogTitle>
                        <DialogDescription>
                            You will no longer receive messages from{" "}
                            <strong>{roomName}</strong>. You can be re-invited later by a member.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setShowLeaveDialog(false)}
                            disabled={leaving}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleLeave}
                            disabled={leaving}
                        >
                            {leaving ? "Leaving…" : "Exit group"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
