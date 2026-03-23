import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getMessagesByRoom } from "@/db/queries/messages";
import { isRoomMember } from "@/db/queries/rooms";

export const dynamic = "force-dynamic";

export const GET = async (
    request: Request,
    props: { params: Promise<{ roomId: string }> },
) => {
    const user = await requireAuth();
    const { roomId } = await props.params;

    const canAccess = await isRoomMember(roomId, user.id);
    if (!canAccess) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const after = searchParams.get("after");

    const messages = await getMessagesByRoom(roomId);

    const filtered = after
        ? messages.filter((message) => {
            const createdAt = new Date(message.createdAt).getTime();
            const threshold = new Date(after).getTime();
            return Number.isFinite(threshold) ? createdAt > threshold : true;
        })
        : messages;

    return NextResponse.json({
        messages: filtered.map((message) => ({
            ...message,
            createdAt: new Date(message.createdAt).toISOString(),
        })),
    });
};
