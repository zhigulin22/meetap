import { getUserId, jsonError } from "@/lib/api";
import { reportOrBlock } from "@/lib/store";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const userId = getUserId(req);
    const body = await req.json();
    const targetUserId = String(body.targetUserId || "");
    const details = body.details ? String(body.details) : undefined;

    if (!targetUserId) {
      return jsonError("targetUserId is required", 422);
    }

    const item = reportOrBlock(userId, targetUserId, "report", details);
    return Response.json({ item });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "report failed", 400);
  }
}
