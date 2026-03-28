"use client";

import { useEffect, useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { CheckCheckIcon, CheckIcon, Clock } from "lucide-react";
import { getDMInfo } from "@/app/actions/direct-messages";
import type { IDMInfo } from "@/types/chat";

interface IDMInfoSheetProps {
    messageId: string | null;
    onClose: () => void;
}

const fmt = (d: Date | null | undefined) => {
    if (!d) return null;
    return new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(d));
};

export const DMInfoSheet = ({ messageId, onClose }: IDMInfoSheetProps) => {
    const [info, setInfo] = useState<IDMInfo | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!messageId) {
            void Promise.resolve().then(() => setInfo(null));
            return;
        }
        void Promise.resolve().then(() => setLoading(true));
        getDMInfo(messageId)
            .then((res) => { if (res.info) setInfo(res.info as IDMInfo); })
            .finally(() => setLoading(false));
    }, [messageId]);

    const rows = info ? [
        { icon: <Clock className="h-4 w-4 text-gray-500" />, label: "Sent", value: fmt(info.createdAt) },
        { icon: <CheckIcon className="h-4 w-4 text-gray-500" />, label: "Delivered", value: fmt(info.deliveredAt) ?? "Not yet" },
        { icon: <CheckCheckIcon className="h-4 w-4 text-gray-500" />, label: "Read", value: fmt(info.readAt) ?? "Not yet" },
    ] : [];

    return (
        <Sheet open={Boolean(messageId)} onOpenChange={(open) => { if (!open) onClose(); }}>
            <SheetContent side="bottom" className="rounded-t-2xl pb-10">
                <SheetHeader className="mb-5">
                    <SheetTitle className="text-[15px]">Message Info</SheetTitle>
                </SheetHeader>

                {loading ? (
                    <div className="space-y-4 px-1 animate-pulse">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="h-4 w-4 rounded bg-gray-200" />
                                <div className="h-4 w-24 rounded bg-gray-200" />
                                <div className="ml-auto h-4 w-36 rounded bg-gray-200" />
                            </div>
                        ))}
                    </div>
                ) : !info ? (
                    <p className="px-1 text-sm text-gray-400">Could not load message info.</p>
                ) : (
                    <ul className="divide-y divide-gray-100 px-1">
                        {rows.map((row) => (
                            <li key={row.label} className="flex items-center gap-3 py-3.5">
                                {row.icon}
                                <span className="text-[14px] font-medium text-gray-700">{row.label}</span>
                                <span className="ml-auto text-[13px] text-gray-500">{row.value}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </SheetContent>
        </Sheet>
    );
};
