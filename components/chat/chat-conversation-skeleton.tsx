import { Skeleton } from "@/components/ui/skeleton";
import { Hash } from "lucide-react";
import type { IChatConversationSkeletonProps } from "@/types/chat";


export const ChatConversationSkeleton = ({ type }: IChatConversationSkeletonProps) => {
    return (
        <div className="flex h-full flex-col">
            <header className="flex shrink-0 items-center gap-3 border-b bg-background px-4 py-3">
                {type === "group" ? (
                    <Hash className="h-4 w-4 text-muted-foreground" />
                ) : (
                    <Skeleton className="h-7 w-7 rounded-full" />
                )}

                <div className="flex min-w-0 flex-col gap-1">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                </div>

                {type === "group" && (
                    <div className="ml-auto flex items-center gap-2">
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-8 w-20 rounded-md" />
                    </div>
                )}
            </header>

            <div className="flex flex-1 flex-col gap-4 overflow-hidden px-4 py-4">
                <div className="flex items-start gap-2">
                    <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-11 w-56 rounded-2xl" />
                    </div>
                </div>

                <div className="flex flex-row-reverse items-start gap-2">
                    <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
                    <div className="flex flex-col items-end gap-2">
                        <Skeleton className="h-3 w-10" />
                        <Skeleton className="h-11 w-44 rounded-2xl" />
                    </div>
                </div>

                <div className="flex items-start gap-2">
                    <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-11 w-64 rounded-2xl" />
                    </div>
                </div>
            </div>

            <div className="flex shrink-0 items-end gap-2 border-t bg-background px-4 py-3">
                <Skeleton className="h-10 flex-1 rounded-md" />
                <Skeleton className="h-10 w-10 rounded-md" />
            </div>
        </div>
    );
};
