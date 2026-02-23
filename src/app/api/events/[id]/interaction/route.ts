import { getUserId, jsonError } from "@/lib/api";
import { upsertEventInteraction } from "@/lib/store";
import { EventAction } from "@/lib/types";
import { NextRequest } from "next/server";

const allowedActions: EventAction[] = ["like", "dislike", "save", "ignore"];

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const userId = getUserId(req);
    const body = await req.json();
    const action = String(body.action || "") as EventAction;

    if (!allowedActions.includes(action)) {
      return jsonError("Invalid action", 422);
    }

    const interaction = upsertEventInteraction(userId, id, action);
    return Response.json({ interaction });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "interaction failed", 400);
  }
}
