"use client";

import { cloneElement, isValidElement, useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { ISearchUser, ISearchUserDialogProps } from "@/types/chat";


export const SearchUserDialog = ({
    lang,
    trigger,
    mode,
    onInvite,
}: ISearchUserDialogProps) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<ISearchUser[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const openDialog = () => {
        setOpen(true);
    };

    const handleSearch = async (q: string) => {
        setQuery(q);
        if (q.length < 2) {
            setResults([]);
            return;
        }
        setLoading(true);
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(data);
        setLoading(false);
    };

    const handleSelect = async (user: ISearchUser) => {
        if (mode === "dm") {
            setOpen(false);
            router.push(`/${lang}/chat/dms/${user.id}`);
        } else if (mode === "invite" && onInvite) {
            await onInvite(user.id);
            setOpen(false);
        }
    };

    const triggerNode = (() => {
        if (isValidElement(trigger)) {
            const originalOnClick = (trigger.props as { onClick?: (event: MouseEvent) => void }).onClick;

            return cloneElement(
                trigger as React.ReactElement<{ onClick?: (event: MouseEvent) => void }>,
                {
                    onClick: (event: MouseEvent) => {
                        originalOnClick?.(event);
                        openDialog();
                    },
                },
            );
        }

        return (
            <Button type="button" variant="outline" onClick={openDialog}>
                {mode === "dm" ? "New DM" : "Invite"}
            </Button>
        );
    })();

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {triggerNode}
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {mode === "dm" ? "New Direct Message" : "Invite Member"}
                    </DialogTitle>
                </DialogHeader>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        className="pl-9"
                        placeholder="Search by username or email…"
                        value={query}
                        onChange={(e) => handleSearch(e.target.value)}
                        autoFocus
                    />
                </div>

                <div className="mt-2 flex flex-col gap-1">
                    {loading && (
                        <p className="py-4 text-center text-sm text-muted-foreground">
                            Searching…
                        </p>
                    )}
                    {!loading && results.length === 0 && query.length >= 2 && (
                        <p className="py-4 text-center text-sm text-muted-foreground">
                            No users found
                        </p>
                    )}
                    {results.map((user) => (
                        <Button
                            key={user.id}
                            variant="ghost"
                            className="h-auto w-full justify-start gap-3 px-3 py-2"
                            onClick={() => handleSelect(user)}
                        >
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                    {user.username.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col items-start text-left">
                                <span className="text-sm font-medium">{user.username}</span>
                                <span className="text-xs text-muted-foreground">{user.email}</span>
                            </div>
                        </Button>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
};
