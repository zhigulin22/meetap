import { fail, ok } from "@/lib/http";
import { supabaseAdmin } from "@/supabase/admin";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { data } = await supabaseAdmin
    .from("users")
    .select("id,name,avatar_url,university,work,hobbies,interests,facts,level,xp")
    .eq("id", params.id)
    .single();

  if (!data) {
    return fail("Profile not found", 404);
  }

  return ok({ profile: data });
}
