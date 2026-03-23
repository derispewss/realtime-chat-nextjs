import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getDMConversation } from "@/db/queries/direct-messages";

export const dynamic = "force-dynamic";

export const GET = async (
    request: Request,
    props: { params: Promise<{ partnerId: string }> },
) => {
    const user = await requireAuth();
    const { partnerId } = await props.params;

    const { searchParams } = new URL(request.url);
    const after = searchParams.get("after");

    const conversation = await getDMConversation(user.id, partnerId);

    const filtered = after
        ? conversation.filter((message) => {
            const createdAt = new Date(message.createdAt).getTime();
            const threshold = new Date(after).getTime();
            return Number.isFinite(threshold) ? createdAt > threshold : true;
        })
        : conversation;

    return NextResponse.json({
        messages: filtered.map((message) => ({
            ...message,
            createdAt: new Date(message.createdAt).toISOString(),
            deliveredAt: message.deliveredAt
                ? new Date(message.deliveredAt).toISOString()
                : null,
            readAt: message.readAt ? new Date(message.readAt).toISOString() : null,
        })),
    });
};
