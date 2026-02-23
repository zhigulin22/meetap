import { NextRequest } from "next/server";
import { ok } from "@/lib/http";
import { supabaseAdmin } from "@/supabase/admin";

type ContactUser = { id: string; name: string; avatar_url: string | null; interests: string[] | null };
type ContactGroup = { id: string; title: string; city: string; event_date: string };

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.toLowerCase() ?? "";

  const [{ data: usersRaw }, { data: eventsRaw }] = await Promise.all([
    supabaseAdmin.from("users").select("id,name,avatar_url,interests").limit(30),
    supabaseAdmin.from("events").select("id,title,city,event_date").limit(20),
  ]);

  const users = (usersRaw ?? []) as ContactUser[];
  const events = (eventsRaw ?? []) as ContactGroup[];

  const people = users.filter((u: ContactUser) =>
    q ? u.name.toLowerCase().includes(q) || (u.interests ?? []).some((i: string) => i.toLowerCase().includes(q)) : true,
  );

  const groups = events.filter((e: ContactGroup) =>
    q ? e.title.toLowerCase().includes(q) || e.city.toLowerCase().includes(q) : true,
  );

  return ok({ people, groups });
}
