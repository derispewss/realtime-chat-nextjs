"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { signIn } from "@/app/actions/auth";
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
import { loginSchema, ILoginForm } from "@/types/auth";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface ILoginFormProps {
    lang: string;
}

export const LoginForm = ({ lang }: ILoginFormProps) => {
    const [error, setError] = useState<string | null>(null);

    const form = useForm<ILoginForm>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (data: ILoginForm) => {
        setError(null);
        const result = await signIn({ ...data, lang });

        if (result?.error) {
            setError(result.error);
        }
    };

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

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center justify-between">
                                    <FormLabel>Password</FormLabel>
                                    <Link
                                        href={`/${lang}/auth/reset-password`}
                                        className="text-xs font-medium underline underline-offset-4 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <FormControl>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        autoComplete="current-password"
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
                                Signing in...
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link
                            href={`/${lang}/auth/signup`}
                            className="font-medium underline underline-offset-4 text-foreground hover:text-muted-foreground transition-colors"
                        >
                            Sign up
                        </Link>
                    </p>
                </form>
            </Form>
        </motion.div>
    );
};
