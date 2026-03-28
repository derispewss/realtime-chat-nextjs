import { requireAuth } from "@/lib/auth";
import { getRoomsByUser } from "@/db/queries/rooms";
import { redirect } from "next/navigation";
import { MessageSquareDashedIcon } from "lucide-react";

export default async function ChatPage(props: PageProps<"/[lang]/chat">) {
    const { lang } = await props.params;
    const user = await requireAuth(lang);

    // Redirect to first group if any
    const groups = await getRoomsByUser(user.id);
    if (groups.length > 0) {
        redirect(`/${lang}/chat/groups/${groups[0].id}`);
    }

    return (
        <div className="flex flex-1 select-none flex-col items-center justify-center gap-5 p-8 text-center">
            {/* Icon */}
            <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-muted shadow-inner">
                    <MessageSquareDashedIcon className="h-10 w-10 text-muted-foreground" strokeWidth={1.5} />
                </div>
                {/* decorative dots */}
                <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-background bg-muted-foreground/30" />
                <span className="absolute -bottom-1 -left-1 h-2.5 w-2.5 rounded-full border-2 border-background bg-muted-foreground/20" />
            </div>

            <div className="space-y-2 max-w-xs">
                <h2 className="text-xl font-semibold tracking-tight">
                    Your chats, right here
                </h2>
                <p className="text-sm leading-6 text-muted-foreground">
                    Send and receive messages without keeping your phone online.
                    Use the <strong>+</strong> button in the sidebar to create a group or start a conversation.
                </p>
            </div>

            <p className="mt-2 text-xs text-muted-foreground/60">
                End-to-end encrypted &middot; Real-time
            </p>
        </div>
    );
}
