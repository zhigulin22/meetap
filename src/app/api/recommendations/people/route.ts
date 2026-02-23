import { getUserId } from "@/lib/api";
import { buildCandidates, getProfileByUserId } from "@/lib/store";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  const candidates = buildCandidates(userId)
    .map((c) => ({ ...c, profile: getProfileByUserId(c.candidateUserId) }))
    .filter((c) => c.profile);
  return Response.json({ items: candidates });
}
