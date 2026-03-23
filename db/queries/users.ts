import { db } from "@/db";
import { profiles } from "@/db/schema";
import { ilike, or, ne, and } from "drizzle-orm";

export const searchUsers = async (query: string, excludeUserId: string) => {
    return db
        .select({
            id: profiles.id,
            username: profiles.username,
            email: profiles.email,
            avatarUrl: profiles.avatarUrl,
        })
        .from(profiles)
        .where(
            and(
                ne(profiles.id, excludeUserId),
                or(
                    ilike(profiles.username, `%${query}%`),
                    ilike(profiles.email, `%${query}%`),
                ),
            ),
        )
        .limit(10);
};
