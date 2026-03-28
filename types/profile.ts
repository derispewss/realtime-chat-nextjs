// ---- Component Props ----

export interface IProfileFormProps {
    lang: string;
    initialUsername: string;
    email: string;
    initialAvatarUrl: string | null;
}

export interface IProfileSettingsPanelProps {
    lang: string;
    initialUsername: string;
    email: string;
    initialAvatarUrl: string | null;
}

// ---- Action Inputs ----

export interface IUpdateProfileInput {
    lang: string;
    username: string;
    avatarUrl: string | null;
}

export interface IUpdateProfilePasswordInput {
    lang: string;
    password: string;
    confirmPassword: string;
}
