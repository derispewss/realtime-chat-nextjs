"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
    CheckCheckIcon,
    CheckIcon,
    EllipsisVertical,
    Eye,
    Info,
    MessageCircle,
    Pencil,
    Trash2,
    UserMinus,
    UserX,
} from "lucide-react";
import type { IMessageBubbleProps } from "@/types/chat";

export const MessageBubble = ({
    id,
    content,
    senderId,
    senderUsername,
    senderAvatarUrl,
    isOwn,
    createdAt,
    deliveredAt,
    readAt,
    isBeingEdited,
    onStartEdit,
    onDeleteForMe,
    onDeleteForEveryone,
    onViewSeen,
    onDMInfo,
    onDeleteForBoth,
    onChatUser,
}: IMessageBubbleProps) => {
    const [deleting, setDeleting] = useState(false);
    const initials = senderUsername.slice(0, 2).toUpperCase();
    const time = new Intl.DateTimeFormat("en", {
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(createdAt));

    const showAvatar = !isOwn;
    const canChatUser = !isOwn && Boolean(onChatUser);

    // Exactly one mode: group xor dm
    const isGroupMode = Boolean(onDeleteForEveryone || onViewSeen) && !Boolean(onDeleteForBoth || onDMInfo);
    const isDMMode = Boolean(onDMInfo || onDeleteForBoth);

    const runDeleting = async (fn: () => Promise<void>) => {
        setDeleting(true);
        try { await fn(); } finally { setDeleting(false); }
    };

    // Inner component — same structure for both right-click and ⋮ menus
    const MenuItems = ({ variant }: { variant: "context" | "dropdown" }) => {
        const Item = variant === "context" ? ContextMenuItem : DropdownMenuItem;
        const Sep = variant === "context" ? ContextMenuSeparator : DropdownMenuSeparator;
        return (
            <>
                {isOwn && onStartEdit && (
                    <Item onSelect={() => onStartEdit(id, content)}>
                        <Pencil className="h-4 w-4" />
                        Edit
                    </Item>
                )}

                {canChatUser && (
                    <Item onSelect={() => onChatUser?.(senderId)}>
                        <MessageCircle className="h-4 w-4" />
                        Chat {senderUsername}
                    </Item>
                )}

                {isGroupMode && isOwn && onViewSeen && (
                    <Item onSelect={() => onViewSeen(id)}>
                        <Eye className="h-4 w-4" />
                        Seen by
                    </Item>
                )}

                {isDMMode && onDMInfo && (
                    <Item onSelect={() => onDMInfo(id)}>
                        <Info className="h-4 w-4" />
                        Info
                    </Item>
                )}

                <Sep />

                {/* Delete for me — exactly ONE entry, shared for both group and DM */}
                {onDeleteForMe && (
                    <Item
                        onSelect={() => runDeleting(() => onDeleteForMe(id))}
                        className="text-gray-600"
                    >
                        <UserX className="h-4 w-4" />
                        Delete for me
                    </Item>
                )}

                {isGroupMode && isOwn && onDeleteForEveryone && (
                    <Item
                        onSelect={() => runDeleting(() => onDeleteForEveryone(id))}
                        className="text-destructive focus:text-destructive"
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete for everyone
                    </Item>
                )}

                {isDMMode && isOwn && onDeleteForBoth && (
                    <Item
                        onSelect={() => runDeleting(() => onDeleteForBoth(id))}
                        className="text-destructive focus:text-destructive"
                    >
                        <UserMinus className="h-4 w-4" />
                        Delete for {senderUsername.length > 12 ? "both" : `${senderUsername} & me`}
                    </Item>
                )}
            </>
        );
    };

    const hasMenu =
        Boolean(onStartEdit) ||
        Boolean(onDeleteForMe) ||
        Boolean(onDeleteForEveryone) ||
        Boolean(onViewSeen) ||
        Boolean(onDMInfo) ||
        Boolean(onDeleteForBoth) ||
        canChatUser;

    return (
        <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
                "group/msg flex items-end gap-2.5",
                isOwn ? "flex-row-reverse" : "flex-row",
                deleting && "opacity-40 pointer-events-none",
            )}
        >
            {/* Avatar */}
            {showAvatar ? (
                <Avatar className="h-8 w-8 shrink-0 border border-gray-200 shadow-sm">
                    {senderAvatarUrl && <AvatarImage src={senderAvatarUrl} />}
                    <AvatarFallback className="bg-gray-100 text-[11px] font-semibold text-gray-600">
                        {initials}
                    </AvatarFallback>
                </Avatar>
            ) : null}

            {/* Bubble */}
            <div className={cn("flex max-w-[75%] flex-col gap-0.5", isOwn && "items-end")}>
                {!isOwn && (
                    <span className="mb-0.5 ml-1 text-[11px] font-semibold tracking-wide text-gray-500">
                        {senderUsername}
                    </span>
                )}

                {/* Right-click context menu wraps the bubble */}
                <ContextMenu>
                    <ContextMenuTrigger asChild>
                        <div
                            className={cn(
                                "relative px-3.5 py-2 text-[14px] leading-relaxed transition-all duration-150 cursor-pointer select-text",
                                isOwn
                                    ? "rounded-2xl rounded-br-md bg-black text-white shadow-md"
                                    : "rounded-2xl rounded-bl-md border border-gray-200 bg-gray-50 text-black shadow-sm",
                                isBeingEdited && "ring-2 ring-gray-400 ring-offset-1",
                            )}
                        >
                            {/* ⋮ dropdown button (fallback for mobile / discoverability) */}
                            {hasMenu && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={cn(
                                                "absolute top-1 h-6 w-6 opacity-0 transition-opacity group-hover/msg:opacity-100",
                                                isOwn
                                                    ? "-left-8 text-gray-500 hover:text-black"
                                                    : "-right-8 text-gray-400 hover:text-black",
                                            )}
                                        >
                                            <EllipsisVertical className="h-3.5 w-3.5" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align={isOwn ? "end" : "start"} className="w-52">
                                        <MenuItems variant="dropdown" />
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}

                            {/* Content */}
                            <div>
                                <p className="whitespace-pre-wrap break-words pr-16">{content}</p>
                                {/* Timestamp & read receipts */}
                                <span className="absolute right-3 bottom-1.5 inline-flex items-center gap-1 text-[10px] leading-none text-gray-400">
                                    <span>{time}</span>
                                    {isOwn && !deliveredAt && <CheckIcon className="h-3 w-3" />}
                                    {isOwn && deliveredAt && !readAt && <CheckCheckIcon className="h-3 w-3" />}
                                    {isOwn && readAt && <CheckCheckIcon className="h-3 w-3 text-gray-300" />}
                                </span>
                            </div>
                        </div>
                    </ContextMenuTrigger>

                    {hasMenu && (
                        <ContextMenuContent className="w-52">
                            <MenuItems variant="context" />
                        </ContextMenuContent>
                    )}
                </ContextMenu>
            </div>
        </motion.div>
    );
};
