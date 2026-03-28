"use client";

import { useEffect, useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Eye } from "lucide-react";
import { getMessageReaders } from "@/app/actions/groups";
import type { IMessageReader } from "@/types/chat";

interface ISeenBySheetProps {
    messageId: string | null;
    onClose: () => void;
}

export const SeenBySheet = ({ messageId, onClose }: ISeenBySheetProps) => {
    const [readers, setReaders] = useState<IMessageReader[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!messageId) {
            setReaders([]);
            return;
        }

        setLoading(true);
        getMessageReaders(messageId)
            .then((res) => {
                if (res.readers) {
                    setReaders(res.readers as IMessageReader[]);
                }
            })
            .finally(() => setLoading(false));
    }, [messageId]);

    return (
        <Sheet open={Boolean(messageId)} onOpenChange={(open) => { if (!open) onClose(); }}>
            <SheetContent side="bottom" className="rounded-t-2xl pb-8">
                <SheetHeader className="mb-4">
                    <SheetTitle className="flex items-center gap-2 text-[15px]">
                        <Eye className="h-4 w-4" />
                        Seen by
                    </SheetTitle>
                </SheetHeader>

                {loading ? (
                    <div className="space-y-3 px-1">
                        {[1, 2].map((i) => (
                            <div key={i} className="flex items-center gap-3 animate-pulse">
                                <div className="h-9 w-9 rounded-full bg-gray-200" />
                                <div className="h-4 w-32 rounded bg-gray-200" />
                            </div>
                        ))}
                    </div>
                ) : readers.length === 0 ? (
                    <p className="px-1 text-sm text-gray-400">No one has seen this message yet.</p>
                ) : (
                    <ul className="space-y-1 px-1">
                        {readers.map((r) => (
                            <li key={r.id} className="flex items-center justify-between py-2">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9 border border-gray-200">
                                        {r.avatarUrl && <AvatarImage src={r.avatarUrl} />}
                                        <AvatarFallback className="bg-gray-100 text-xs font-semibold text-gray-600">
                                            {r.username.slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-[14px] font-medium">{r.username}</span>
                                </div>
                                <span className="text-[11px] text-gray-400">
                                    {new Intl.DateTimeFormat("en", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    }).format(new Date(r.readAt))}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </SheetContent>
        </Sheet>
    );
};
