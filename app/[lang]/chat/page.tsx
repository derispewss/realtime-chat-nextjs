import { requireAuth } from "@/lib/auth";
import { getRoomsByUser } from "@/db/queries/rooms";
import { redirect } from "next/navigation";
import { MessageSquare } from "lucide-react";

export default async function ChatPage(props: PageProps<"/[lang]/chat">) {
    const { lang } = await props.params;
    const user = await requireAuth(lang);

    // Redirect to first group if any
    const groups = await getRoomsByUser(user.id);
    if (groups.length > 0) {
        redirect(`/${lang}/chat/groups/${groups[0].id}`);
    }

    // Empty state
    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                <MessageSquare className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
                <p className="font-semibold">No conversations yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                    Create a group or start a direct message from the sidebar
                </p>
            </div>
        </div>
    );
}
