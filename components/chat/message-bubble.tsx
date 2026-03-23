import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { CheckIcon, CheckCheckIcon, EllipsisVertical, MessageCircle, Pencil, Trash2 } from "lucide-react";

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
    onEditMessage?: (messageId: string, content: string) => Promise<void>;
    onDeleteMessage?: (messageId: string) => Promise<void>;
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
    onEditMessage,
    onDeleteMessage,
    onChatUser,
}: IMessageBubbleProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState(content);
    const [isSaving, setIsSaving] = useState(false);
    const initials = senderUsername.slice(0, 2).toUpperCase();
    const time = new Intl.DateTimeFormat("en", {
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(createdAt));

    const canEdit = isOwn && Boolean(onEditMessage);
    const canDelete = isOwn && Boolean(onDeleteMessage);
    const canChatUser = !isOwn && Boolean(onChatUser);

    const handleEdit = async () => {
        if (!onEditMessage) {
            return;
        }

        const nextContent = draft.trim();
        if (!nextContent || nextContent === content) {
            setIsEditing(false);
            setDraft(content);
            return;
        }

        setIsSaving(true);

        try {
            await onEditMessage(id, nextContent);
            setIsEditing(false);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!onDeleteMessage) {
            return;
        }

        const shouldDelete = window.confirm("Delete this message?");
        if (!shouldDelete) {
            return;
        }

        await onDeleteMessage(id);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
                "flex items-end gap-2",
                isOwn && "flex-row-reverse",
            )}
        >
            {canChatUser ? (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button type="button" className="rounded-full">
                            <Avatar className="h-7 w-7 shrink-0 shadow-sm">
                                {senderAvatarUrl && <AvatarImage src={senderAvatarUrl} />}
                                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                            </Avatar>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align={isOwn ? "end" : "start"}>
                        <DropdownMenuItem onSelect={() => onChatUser?.(senderId)}>
                            <MessageCircle className="h-4 w-4" />
                            Chat {senderUsername}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <Avatar className="h-7 w-7 shrink-0 shadow-sm">
                    {senderAvatarUrl && <AvatarImage src={senderAvatarUrl} />}
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
            )}

            <div className={cn("flex max-w-[70%] flex-col gap-1", isOwn && "items-end")}>
                <div className={cn("flex items-center gap-1 px-1", isOwn && "flex-row-reverse")}>
                    <span className="text-[11px] font-medium text-muted-foreground/80">
                        {isOwn ? "You" : senderUsername}
                    </span>
                    {(canEdit || canDelete) && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-5 w-5">
                                    <EllipsisVertical className="h-3.5 w-3.5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align={isOwn ? "end" : "start"}>
                                {canEdit && (
                                    <DropdownMenuItem onSelect={() => setIsEditing(true)}>
                                        <Pencil className="h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                )}
                                {canDelete && (
                                    <DropdownMenuItem variant="destructive" onSelect={handleDelete}>
                                        <Trash2 className="h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
                <div
                    className={cn(
                        "rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed shadow-sm transition-colors",
                        isOwn
                            ? "rounded-br-sm bg-foreground text-background"
                            : "rounded-bl-sm border border-border/50 bg-muted/80 text-foreground",
                    )}
                >
                    {isEditing ? (
                        <div className="flex flex-col gap-2">
                            <Textarea
                                value={draft}
                                onChange={(event) => setDraft(event.target.value)}
                                className="min-h-20"
                                autoFocus
                            />
                            <div className="flex items-center justify-end gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setDraft(content);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button size="sm" onClick={handleEdit} disabled={isSaving}>
                                    Save
                                </Button>
                            </div>
                        </div>
                    ) : (
                        content
                    )}
                </div>
                <span className="flex items-center gap-1 px-1 text-[10px] font-medium text-muted-foreground/60">
                    <span>{time}</span>
                    {isOwn && !deliveredAt && <CheckIcon className="h-3 w-3" />}
                    {isOwn && deliveredAt && !readAt && <CheckCheckIcon className="h-3 w-3" />}
                    {isOwn && readAt && <CheckCheckIcon className="h-3 w-3 text-foreground" />}
                </span>
            </div>
        </motion.div>
    );
};
