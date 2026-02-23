import { fail, ok } from "@/lib/http";
import { supabaseAdmin } from "@/supabase/admin";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { data: event } = await supabaseAdmin
    .from("events")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!event) {
    return fail("Event not found", 404);
  }

  const { data: participants } = await supabaseAdmin
    .from("event_members")
    .select("user_id,users(id,name,avatar_url,interests)")
    .eq("event_id", params.id);

  return ok({ event, participants: participants ?? [] });
}
