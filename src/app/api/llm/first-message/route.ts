import { getUserId, jsonError } from "@/lib/api";
import { generateFirstMessages } from "@/lib/llm";

export async function POST(req: Request) {
  try {
    const userId = getUserId(req);
    const body = await req.json();
    const targetUserId = String(body.targetUserId || "");
    const eventId = body.eventId ? String(body.eventId) : undefined;

    if (!targetUserId) {
      return jsonError("targetUserId is required", 422);
    }

    const result = generateFirstMessages(userId, targetUserId, eventId);
    return Response.json(result);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "llm failed", 400);
  }
}
