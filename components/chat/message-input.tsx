"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizonal, Pencil, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IMessageInputProps } from "@/types/chat";

export const MessageInput = ({
    onSend,
    onType,
    disabled,
    editingMessage,
    onCancelEdit,
}: IMessageInputProps) => {
    const [value, setValue] = useState("");
    const [sending, setSending] = useState(false);
    const ref = useRef<HTMLTextAreaElement>(null);
    const isEditing = Boolean(editingMessage);

    // When edit mode activates, populate the textarea and focus
    useEffect(() => {
        if (editingMessage) {
            void Promise.resolve().then(() => setValue(editingMessage.content));
            setTimeout(() => {
                const el = ref.current;
                if (!el) return;
                el.focus();
                // Move cursor to end
                el.selectionStart = el.value.length;
                el.selectionEnd = el.value.length;
            }, 0);
        }
    }, [editingMessage]);

    const handleSend = async () => {
        const content = value.trim();
        if (!content || sending) return;

        setSending(true);
        setValue("");
        await onSend(content);
        setSending(false);
        ref.current?.focus();
    };

    const handleCancel = () => {
        setValue("");
        onCancelEdit?.();
        ref.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        } else if (e.key === "Escape" && isEditing) {
            handleCancel();
        } else {
            onType?.();
        }
    };

    return (
        <div className="flex flex-col border-t bg-background">
            {/* Edit banner — WhatsApp style */}
            {isEditing && (
                <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-2">
                    <Pencil className="h-3.5 w-3.5 shrink-0 text-gray-500" />
                    <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold text-gray-600">Editing message</p>
                        <p className="truncate text-[12px] text-gray-400">
                            {editingMessage?.content}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="shrink-0 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700"
                        aria-label="Cancel editing"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* Input row */}
            <div className="flex items-end gap-2 px-4 py-3">
                <Textarea
                    ref={ref}
                    value={value}
                    onChange={(e) => {
                        setValue(e.target.value);
                        onType?.();
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={isEditing ? "Edit message… (Enter to save)" : "Type a message… (Enter to send)"}
                    rows={1}
                    disabled={disabled || sending}
                    className="max-h-32 min-h-10 flex-1 resize-none bg-muted/50 focus-visible:ring-1"
                />

                {/* Cancel button (edit mode only) */}
                {isEditing && (
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleCancel}
                        aria-label="Cancel editing"
                        className={cn("shrink-0")}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}

                {/* Send / Save button */}
                <Button
                    size="icon"
                    onClick={handleSend}
                    disabled={!value.trim() || sending || disabled}
                    aria-label={isEditing ? "Save edit" : "Send message"}
                    className="shrink-0"
                >
                    <SendHorizonal className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};
