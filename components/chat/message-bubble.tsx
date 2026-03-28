"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
    CheckCheckIcon,
    CheckIcon,
    ChevronDownIcon,
    EyeIcon,
    InfoIcon,
    MessageCircleIcon,
    PencilIcon,
    Trash2Icon,
    UserXIcon,
} from "lucide-react";

interface IMessageBubbleProps {
    id: string;
    content: string;
    senderId: string;
    senderUsername: string;
    senderAvatarUrl?: string | null;
    isOwn: boolean;
    createdAt: Date;
    deliveredAt?: Date | null;
    readAt?: Date | null;
    /** "group" shows avatar + name; "dm" hides both for pure-bubble layout */
    variant?: "group" | "dm";
    // Inline edit/delete (handled inside bubble)
    onEditMessage?: (messageId: string, content: string) => Promise<void>;
    onDeleteMessage?: (messageId: string) => Promise<void>;
    // Passed through from parent — handled externally
    isBeingEdited?: boolean;
    onStartEdit?: (messageId: string, content: string) => void;
    onDeleteForMe?: (messageId: string) => Promise<void>;
    onDeleteForEveryone?: (messageId: string) => Promise<void>;
    onViewSeen?: (messageId: string) => void;
    onDMInfo?: (messageId: string) => void;
    onDeleteForBoth?: (messageId: string) => Promise<void>;
    onChatUser?: (userId: string) => void;
}

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
    variant = "group",
    isBeingEdited,
    onEditMessage,
    onDeleteMessage,
    onStartEdit,
    onDeleteForMe,
    onDeleteForEveryone,
    onViewSeen,
    onDMInfo,
    onDeleteForBoth,
    onChatUser,
}: IMessageBubbleProps) => {
    const isDM = variant === "dm";
    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState(content);
    const [isSaving, setIsSaving] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const initials = senderUsername.slice(0, 2).toUpperCase();
    const time = new Intl.DateTimeFormat("en", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).format(new Date(createdAt));

    // Sync draft when content changes externally
    useEffect(() => {
        if (!isEditing) setDraft(content);
    }, [content, isEditing]);

    // Auto-focus textarea on edit
    useEffect(() => {
        if (isEditing) textareaRef.current?.focus();
    }, [isEditing]);

    // ── Capabilities ──────────────────────────────────────────────
    const inlineEdit = Boolean(onEditMessage);
    const externalEdit = Boolean(onStartEdit);
    const canEdit = isOwn && (inlineEdit || externalEdit);

    const hasDeleteOptions =
        Boolean(onDeleteForMe) ||
        Boolean(onDeleteForEveryone) ||
        Boolean(onDeleteForBoth) ||
        Boolean(onDeleteMessage);

    const isGroupMode = Boolean(onDeleteForEveryone || onViewSeen);
    const isDMMode = Boolean(onDMInfo || onDeleteForBoth);

    const hasMenu =
        canEdit ||
        hasDeleteOptions ||
        Boolean(onChatUser) ||
        Boolean(onViewSeen) ||
        Boolean(onDMInfo);

    // ── Handlers ─────────────────────────────────────────────────
    const handleSaveEdit = async () => {
        const next = draft.trim();
        if (!next || next === content) {
            setIsEditing(false);
            setDraft(content);
            return;
        }
        setIsSaving(true);
        try {
            if (onEditMessage) await onEditMessage(id, next);
            setIsEditing(false);
        } finally {
            setIsSaving(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSaveEdit();
        }
        if (e.key === "Escape") {
            setIsEditing(false);
            setDraft(content);
        }
    };

    const handleStartEdit = () => {
        if (inlineEdit) setIsEditing(true);
        else if (onStartEdit) onStartEdit(id, content);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={cn(
                "group/msg flex w-full items-end gap-2",
                isOwn && "flex-row-reverse",
            )}
        >
            {/* Avatar — group mode only */}
            {!isOwn && !isDM && (
                <button
                    type="button"
                    onClick={() => onChatUser?.(senderId)}
                    className={cn(
                        "mb-0.5 shrink-0 rounded-full outline-none transition-opacity",
                        onChatUser
                            ? "cursor-pointer hover:opacity-80"
                            : "pointer-events-none cursor-default",
                    )}
                    aria-label={onChatUser ? `Start chat with ${senderUsername}` : undefined}
                >
                    <Avatar className="h-7 w-7 shadow-sm">
                        {senderAvatarUrl && <AvatarImage src={senderAvatarUrl} />}
                        <AvatarFallback className="text-[10px] font-semibold">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                </button>
            )}

            {/* Bubble column */}
            <div
                className={cn(
                    "flex min-w-0 max-w-[78%] flex-col gap-0.5 sm:max-w-[68%]",
                    isOwn && "items-end",
                )}
            >
                {/* Sender name — group mode only */}
                {!isOwn && !isDM && (
                    <span className="ml-3 text-[11px] font-semibold text-muted-foreground">
                        {senderUsername}
                    </span>
                )}

                {/* ── Bubble ── */}
                <div
                    className={cn(
                        "group/bubble relative rounded-2xl px-3.5 py-2 text-sm shadow-sm",
                        isOwn
                            ? "rounded-br-sm bg-foreground text-background"
                            : "rounded-bl-sm border border-border/50 bg-muted/40 text-foreground dark:bg-muted/20",
                        isBeingEdited && "ring-2 ring-offset-1 ring-foreground/40",
                    )}
                >
                    {/* ▾ Action chevron — inside bubble, top corner, on hover */}
                    {hasMenu && !isEditing && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    aria-label="Message actions"
                                    className={cn(
                                        "absolute top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full",
                                        "opacity-0 transition-opacity group-hover/bubble:opacity-100",
                                        // fade from bubble bg to transparent — WhatsApp style
                                        isOwn
                                            ? "right-1 bg-foreground/80 text-background/70 hover:text-background"
                                            : "right-1 bg-muted hover:bg-muted-foreground/20 text-muted-foreground hover:text-foreground",
                                    )}
                                >
                                    <ChevronDownIcon className="h-3 w-3" />
                                </button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                                align="end"
                                side="bottom"
                                className="w-52"
                            >
                                {canEdit && (
                                    <DropdownMenuItem onSelect={handleStartEdit}>
                                        <PencilIcon className="h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                )}

                                {isGroupMode && isOwn && onViewSeen && (
                                    <DropdownMenuItem onSelect={() => onViewSeen(id)}>
                                        <EyeIcon className="h-4 w-4" />
                                        Seen by
                                    </DropdownMenuItem>
                                )}

                                {isDMMode && onDMInfo && (
                                    <DropdownMenuItem onSelect={() => onDMInfo(id)}>
                                        <InfoIcon className="h-4 w-4" />
                                        Info
                                    </DropdownMenuItem>
                                )}

                                {!isOwn && onChatUser && (
                                    <DropdownMenuItem onSelect={() => onChatUser(senderId)}>
                                        <MessageCircleIcon className="h-4 w-4" />
                                        Message {senderUsername}
                                    </DropdownMenuItem>
                                )}

                                {hasDeleteOptions && <DropdownMenuSeparator />}

                                {onDeleteForMe && (
                                    <DropdownMenuItem
                                        onSelect={() => onDeleteForMe(id)}
                                        className="text-muted-foreground focus:text-muted-foreground"
                                    >
                                        <UserXIcon className="h-4 w-4" />
                                        Delete for me
                                    </DropdownMenuItem>
                                )}

                                {isGroupMode && isOwn && onDeleteForEveryone && (
                                    <DropdownMenuItem
                                        onSelect={() => onDeleteForEveryone(id)}
                                        className="text-destructive focus:text-destructive"
                                    >
                                        <Trash2Icon className="h-4 w-4" />
                                        Delete for everyone
                                    </DropdownMenuItem>
                                )}

                                {isDMMode && isOwn && onDeleteForBoth && (
                                    <DropdownMenuItem
                                        onSelect={() => onDeleteForBoth(id)}
                                        className="text-destructive focus:text-destructive"
                                    >
                                        <Trash2Icon className="h-4 w-4" />
                                        Delete for{" "}
                                        {senderUsername.length > 12
                                            ? "both"
                                            : `${senderUsername} & me`}
                                    </DropdownMenuItem>
                                )}

                                {onDeleteMessage && isOwn && (
                                    <DropdownMenuItem
                                        onSelect={() => onDeleteMessage(id)}
                                        className="text-destructive focus:text-destructive"
                                    >
                                        <Trash2Icon className="h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                    {/* ── Content ── */}
                    <AnimatePresence mode="wait" initial={false}>
                        {isEditing ? (
                            <motion.div
                                key="editing"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col gap-2 pt-3"
                            >
                                <Textarea
                                    ref={textareaRef}
                                    value={draft}
                                    onChange={(e) => setDraft(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    rows={2}
                                    className={cn(
                                        "min-w-50 resize-none border-0 bg-transparent p-0 text-sm shadow-none outline-none focus-visible:ring-0",
                                        isOwn
                                            ? "text-background placeholder:text-background/50"
                                            : "text-foreground",
                                    )}
                                />
                                <div className="flex items-center justify-end gap-2 pb-0.5">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setDraft(content);
                                        }}
                                        className={cn(
                                            "text-[11px] underline underline-offset-2 opacity-60 hover:opacity-100",
                                            isOwn ? "text-background" : "text-foreground",
                                        )}
                                    >
                                        Cancel
                                    </button>
                                    <Button
                                        size="sm"
                                        onClick={handleSaveEdit}
                                        disabled={isSaving}
                                        className={cn(
                                            "h-6 px-2.5 text-[11px]",
                                            isOwn
                                                ? "bg-background text-foreground hover:bg-background/90"
                                                : "",
                                        )}
                                    >
                                        {isSaving ? "Saving…" : "Save"}
                                    </Button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.p
                                key="reading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="whitespace-pre-wrap wrap-break-word leading-relaxed"
                            >
                                {content}
                                {/*
                                 * Phantom spacer — same visual width as the timestamp block.
                                 * This pushes the last text line's wrap point so the
                                 * absolutely-positioned timestamp never overlaps words.
                                 */}
                                <span
                                    aria-hidden
                                    className={cn(
                                        "pointer-events-none ml-1.5 inline-block align-bottom text-[10px] leading-none opacity-0 select-none",
                                    )}
                                >
                                    {time}
                                    {isOwn && " ✓✓"}
                                </span>
                            </motion.p>
                        )}
                    </AnimatePresence>

                    {/* ── Timestamp + read receipts ── */}
                    {!isEditing && (
                        <span
                            className={cn(
                                "absolute bottom-1.5 right-2.5 inline-flex items-center gap-0.5 text-[10px] leading-none",
                                isOwn ? "text-background/60" : "text-muted-foreground",
                            )}
                        >
                            {time}
                            {isOwn && !deliveredAt && (
                                <CheckIcon className="h-3 w-3 shrink-0" />
                            )}
                            {isOwn && deliveredAt && !readAt && (
                                <CheckCheckIcon className="h-3 w-3 shrink-0" />
                            )}
                            {isOwn && readAt && (
                                <CheckCheckIcon className="h-3 w-3 shrink-0 opacity-100" />
                            )}
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
