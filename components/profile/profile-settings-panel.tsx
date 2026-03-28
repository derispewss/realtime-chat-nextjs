"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ProfileForm } from "@/components/profile/profile-form";
import { updateProfilePassword } from "@/app/actions/profile";
import type { IProfileSettingsPanelProps } from "@/types/profile";

type TProfileTab = "account" | "security" | "notifications";


const SOUND_KEY = "chat.notifications.sound";
const DESKTOP_KEY = "chat.notifications.desktop";

const getInitialSoundEnabled = () => {
    if (typeof window === "undefined") {
        return true;
    }

    return window.localStorage.getItem(SOUND_KEY) !== "false";
};

const getInitialDesktopEnabled = () => {
    if (typeof window === "undefined") {
        return false;
    }

    return window.localStorage.getItem(DESKTOP_KEY) === "true";
};

export const ProfileSettingsPanel = ({
    lang,
    initialUsername,
    email,
    initialAvatarUrl,
}: IProfileSettingsPanelProps) => {
    const [activeTab, setActiveTab] = useState<TProfileTab>("account");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

    const [soundEnabled, setSoundEnabled] = useState(getInitialSoundEnabled);
    const [desktopEnabled, setDesktopEnabled] = useState(getInitialDesktopEnabled);

    const tabs = useMemo(
        () => [
            { key: "account", label: "Account" },
            { key: "security", label: "Security" },
            { key: "notifications", label: "Notifications" },
        ] as Array<{ key: TProfileTab; label: string }>,
        [],
    );

    const handlePasswordSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();

        setIsUpdatingPassword(true);
        setPasswordError(null);
        setPasswordSuccess(null);

        const result = await updateProfilePassword({
            lang,
            password,
            confirmPassword,
        });

        if (result.error) {
            setPasswordError(result.error);
            setIsUpdatingPassword(false);
            return;
        }

        setPassword("");
        setConfirmPassword("");
        setPasswordSuccess("Password updated.");
        setIsUpdatingPassword(false);
    };

    const handleToggleSound = (checked: boolean) => {
        setSoundEnabled(checked);
        window.localStorage.setItem(SOUND_KEY, String(checked));
    };

    const handleToggleDesktop = async (checked: boolean) => {
        if (checked && typeof Notification !== "undefined") {
            if (Notification.permission === "default") {
                const permission = await Notification.requestPermission();
                if (permission !== "granted") {
                    setDesktopEnabled(false);
                    window.localStorage.setItem(DESKTOP_KEY, "false");
                    return;
                }
            }

            if (Notification.permission !== "granted") {
                setDesktopEnabled(false);
                window.localStorage.setItem(DESKTOP_KEY, "false");
                return;
            }
        }

        setDesktopEnabled(checked);
        window.localStorage.setItem(DESKTOP_KEY, String(checked));
    };

    return (
        <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => (
                    <Button
                        key={tab.key}
                        type="button"
                        variant={activeTab === tab.key ? "default" : "outline"}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.label}
                    </Button>
                ))}
            </div>

            {activeTab === "account" && (
                <ProfileForm
                    lang={lang}
                    initialUsername={initialUsername}
                    email={email}
                    initialAvatarUrl={initialAvatarUrl}
                />
            )}

            {activeTab === "security" && (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input
                            id="new-password"
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            minLength={6}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm Password</Label>
                        <Input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            minLength={6}
                            required
                        />
                    </div>

                    {passwordError && (
                        <p className="text-sm text-destructive">{passwordError}</p>
                    )}
                    {passwordSuccess && (
                        <p className="text-sm text-muted-foreground">{passwordSuccess}</p>
                    )}

                    <Button type="submit" disabled={isUpdatingPassword}>
                        {isUpdatingPassword ? "Updating..." : "Update password"}
                    </Button>
                </form>
            )}

            {activeTab === "notifications" && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-md border p-3">
                        <div className="space-y-0.5">
                            <p className="text-sm font-medium">Message sound</p>
                            <p className="text-xs text-muted-foreground">
                                Play a short sound when new chat messages arrive.
                            </p>
                        </div>
                        <Switch checked={soundEnabled} onCheckedChange={handleToggleSound} />
                    </div>

                    <div className="flex items-center justify-between rounded-md border p-3">
                        <div className="space-y-0.5">
                            <p className="text-sm font-medium">Desktop notification</p>
                            <p className="text-xs text-muted-foreground">
                                Show browser notifications when app is not focused.
                            </p>
                        </div>
                        <Switch checked={desktopEnabled} onCheckedChange={handleToggleDesktop} />
                    </div>
                </div>
            )}
        </div>
    );
};
