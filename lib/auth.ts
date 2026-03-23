import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const getUser = async () => {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    return user;
};

export const requireAuth = async (lang = "en") => {
    const user = await getUser();
    if (!user) {
        redirect(`/${lang}/auth/login`);
    }
    return user;
};

export const requireGuest = async (lang = "en") => {
    const user = await getUser();
    if (user) {
        redirect(`/${lang}/chat`);
    }
};
