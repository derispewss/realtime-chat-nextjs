"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { resetPassword } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { resetPasswordSchema, IResetPasswordForm } from "@/types/auth";
import type { IResetPasswordFormProps } from "@/types/auth";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export const ResetPasswordForm = ({ lang }: IResetPasswordFormProps) => {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const form = useForm<IResetPasswordForm>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = async (data: IResetPasswordForm) => {
        setError(null);
        setSuccess(null);
        const result = await resetPassword({ ...data, lang });

        if (result?.error) {
            setError(result.error);
        } else if (result?.success) {
            setSuccess(result.success);
        }
    };

    if (success) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center space-y-4 text-center"
            >
                <div className="rounded-full bg-primary/10 p-3">
                    <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Check your email</h2>
                <p className="text-sm text-muted-foreground">{success}</p>
                <Button asChild variant="outline" className="mt-4">
                    <Link href={`/${lang}/auth/login`}>Back to login</Link>
                </Button>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input
                                        type="email"
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {error && (
                        <p className="text-sm font-medium text-destructive">{error}</p>
                    )}

                    <Button
                        type="submit"
                        className="w-full transition-all"
                        disabled={form.formState.isSubmitting}
                    >
                        {form.formState.isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending link...
                            </>
                        ) : (
                            "Send reset link"
                        )}
                    </Button>

                    <Button asChild variant="ghost" className="w-full">
                        <Link href={`/${lang}/auth/login`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to login
                        </Link>
                    </Button>
                </form>
            </Form>
        </motion.div>
    );
};
