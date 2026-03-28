"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/app/actions/profile";
import type { IProfileFormProps } from "@/types/profile";


export const ProfileForm = ({
    lang,
    initialUsername,
    email,
    initialAvatarUrl,
}: IProfileFormProps) => {
    const router = useRouter();
    const [username, setUsername] = useState(initialUsername);
    const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl ?? "");
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();

        setIsSaving(true);
        setError(null);
        setSuccess(null);

        const result = await updateProfile({
            lang,
            username,
            avatarUrl: avatarUrl.trim() ? avatarUrl.trim() : null,
        });

        if (result.error) {
            setError(result.error);
            setIsSaving(false);
            return;
        }

        setSuccess("Profile updated.");
        setIsSaving(false);
        router.refresh();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                    id="username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    minLength={3}
                    maxLength={20}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={email} disabled readOnly />
            </div>

            <div className="space-y-2">
                <Label htmlFor="avatar">Avatar URL</Label>
                <Input
                    id="avatar"
                    value={avatarUrl}
                    onChange={(event) => setAvatarUrl(event.target.value)}
                    placeholder="https://..."
                />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-muted-foreground">{success}</p>}

            <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save changes"}
            </Button>
        </form>
    );
};
