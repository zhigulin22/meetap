import { getUserId, jsonError } from "@/lib/api";
import { createMessage, getMatchMessages } from "@/lib/store";
import { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const items = getMatchMessages(id);
  return Response.json({ items });
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const userId = getUserId(req);
    const body = await req.json();
    const text = String(body.text || "").trim();
    const wasLlmSuggested = Boolean(body.wasLlmSuggested);

    if (!text) {
      return jsonError("text is required", 422);
    }

    const message = createMessage(id, userId, text, wasLlmSuggested);
    return Response.json({ message });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "message failed", 400);
  }
}
