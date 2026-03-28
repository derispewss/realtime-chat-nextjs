"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, SearchIcon } from "lucide-react";

interface IUser {
    id: string;
    username: string;
    avatarUrl: string | null;
}

interface IStartDMDialogProps {
    lang: string;
    trigger: React.ReactNode;
}

export const StartDMDialog = ({ lang, trigger }: IStartDMDialogProps) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<IUser[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!open) {
            setQuery("");
            setResults([]);
        }
    }, [open]);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (query.trim().length < 2) {
            setResults([]);
            return;
        }
        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/users/search?q=${encodeURIComponent(query.trim())}`);
                if (res.ok) setResults(await res.json());
            } finally {
                setLoading(false);
            }
        }, 300);
    }, [query]);

    const handleSelect = (userId: string) => {
        setOpen(false);
        router.push(`/${lang}/chat/dms/${userId}`);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>New Message</DialogTitle>
                </DialogHeader>

                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by username…"
                        className="pl-9"
                    />
                </div>

                <div className="min-h-[120px] space-y-1">
                    {loading && (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    )}

                    {!loading && query.trim().length >= 2 && results.length === 0 && (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                            No users found for &ldquo;{query}&rdquo;
                        </p>
                    )}

                    {!loading && query.trim().length < 2 && (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                            Type at least 2 characters to search
                        </p>
                    )}

                    {!loading && results.map((user) => (
                        <button
                            key={user.id}
                            type="button"
                            onClick={() => handleSelect(user.id)}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-accent"
                        >
                            <Avatar className="h-9 w-9 shrink-0">
                                <AvatarFallback className="text-xs">
                                    {user.username.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{user.username}</span>
                        </button>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
};
