import { getUserId, jsonError } from "@/lib/api";
import { likePerson } from "@/lib/store";
import { NextRequest } from "next/server";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const userId = getUserId(req);
    const match = likePerson(userId, id);
    return Response.json({ match });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "like failed", 400);
  }
}
