import { getUserId } from "@/lib/api";
import { getProfileByUserId, listMatchesForUser } from "@/lib/store";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  const items = listMatchesForUser(userId).map((m) => {
    const partnerId = m.user1Id === userId ? m.user2Id : m.user1Id;
    return {
      ...m,
      partnerProfile: getProfileByUserId(partnerId),
    };
  });

  return Response.json({ items });
}
