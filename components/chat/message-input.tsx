"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizonal } from "lucide-react";

interface IMessageInputProps {
    onSend: (content: string) => Promise<void>;
    onType?: () => void;
    disabled?: boolean;
}

export const MessageInput = ({ onSend, onType, disabled }: IMessageInputProps) => {
    const [value, setValue] = useState("");
    const [sending, setSending] = useState(false);
    const ref = useRef<HTMLTextAreaElement>(null);

    const handleSend = async () => {
        const content = value.trim();
        if (!content || sending) return;

        setSending(true);
        setValue("");
        await onSend(content);
        setSending(false);
        ref.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        } else {
            onType?.();
        }
    };

    return (
        <div className="flex items-end gap-2 border-t bg-background px-4 py-3">
            <Textarea
                ref={ref}
                value={value}
                onChange={(e) => {
                    setValue(e.target.value);
                    onType?.();
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type a message… (Enter to send)"
                rows={1}
                disabled={disabled || sending}
                className="max-h-32 min-h-[40px] flex-1 resize-none bg-muted/50 focus-visible:ring-1"
            />
            <Button
                size="icon"
                onClick={handleSend}
                disabled={!value.trim() || sending || disabled}
                aria-label="Send message"
            >
                <SendHorizonal className="h-4 w-4" />
            </Button>
        </div>
    );
};
