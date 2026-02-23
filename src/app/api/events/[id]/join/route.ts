import { fail, ok } from "@/lib/http";
import { supabaseAdmin } from "@/supabase/admin";
import { requireUserId } from "@/server/auth";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const userId = requireUserId();
    const { error } = await supabaseAdmin
      .from("event_members")
      .upsert({ event_id: params.id, user_id: userId }, { onConflict: "event_id,user_id" });

    if (error) {
      return fail(error.message, 500);
    }

    return ok({ success: true });
  } catch {
    return fail("Unauthorized", 401);
  }
}
