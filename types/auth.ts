import { z } from "zod";

// ---- Zod Schemas ----

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
    username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(20, "Username max 20 characters")
        .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const resetPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
});

export const updatePasswordSchema = z.object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

// ---- Types ----

export type ILoginForm = z.infer<typeof loginSchema>;
export type ISignupForm = z.infer<typeof signupSchema>;
export type IResetPasswordForm = z.infer<typeof resetPasswordSchema>;
export type IUpdatePasswordForm = z.infer<typeof updatePasswordSchema>;

// ---- Component Props ----

export interface ILoginFormProps {
    lang: string;
}

export interface ISignupFormProps {
    lang: string;
}

export interface IResetPasswordFormProps {
    lang: string;
}

export interface IUpdatePasswordFormProps {
    lang: string;
}
