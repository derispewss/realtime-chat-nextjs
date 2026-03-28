"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createGroup } from "@/app/actions/groups";
import type { ICreateGroupDialogProps } from "@/types/chat";


export const CreateGroupDialog = ({ lang, trigger }: ICreateGroupDialogProps) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const result = await createGroup(formData);

        if ("error" in result) {
            setError(result.error as string);
            setLoading(false);
            return;
        }

        setOpen(false);
        router.push(`/${lang}/chat/groups/${result.roomId}`);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create New Group</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="group-name">Group Name</Label>
                        <Input
                            id="group-name"
                            name="name"
                            placeholder="e.g. design-team"
                            required
                            minLength={3}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="group-desc">Description (optional)</Label>
                        <Input
                            id="group-desc"
                            name="description"
                            placeholder="What's this group about?"
                        />
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Creating…" : "Create Group"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};
