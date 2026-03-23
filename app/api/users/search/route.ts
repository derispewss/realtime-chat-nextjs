import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { searchUsers } from "@/db/queries/users";

export const GET = async (request: Request) => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();

    if (!q || q.length < 2) {
        return NextResponse.json([]);
    }

    const results = await searchUsers(q, user.id);
    return NextResponse.json(results);
};
