import { getUserId } from "@/lib/api";
import { listEventsForUser } from "@/lib/store";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  const city = req.nextUrl.searchParams.get("city") || undefined;
  const events = listEventsForUser(userId, city);
  return Response.json({ items: events });
}
