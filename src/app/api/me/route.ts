import { getUserId, jsonError } from "@/lib/api";
import { getProfileByUserId, getUserById, updateProfile } from "@/lib/store";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  const user = getUserById(userId);
  const profile = getProfileByUserId(userId);

  if (!user || !profile) {
    return jsonError("User not found", 404);
  }

  return Response.json({ user, profile });
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = getUserId(req);
    const body = await req.json();
    const profile = updateProfile(userId, body);
    return Response.json({ profile });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Profile update failed", 400);
  }
}
