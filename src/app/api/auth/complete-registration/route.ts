import { cookies } from "next/headers";
import { completeRegistrationSchema } from "@/lib/schemas";
import { fail, ok } from "@/lib/http";
import { supabaseAdmin } from "@/supabase/admin";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  const rate = checkRateLimit(`complete-registration:${ip}`, 10, 10 * 60 * 1000);
  if (!rate.ok) {
    return fail("Too many attempts", 429);
  }

  const body = await req.json().catch(() => null);
  const parsed = completeRegistrationSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.message, 422);
  }

  const { token, name } = parsed.data;
  const { data: rawVerification, error: vErr } = await supabaseAdmin
    .from("telegram_verifications")
    .select("phone, status, telegram_user_id")
    .eq("token", token)
    .single();

  const verification = rawVerification as
    | { phone: string; status: string; telegram_user_id: string | null }
    | null;

  if (vErr || !verification || verification.status !== "verified") {
    return fail("Phone is not verified in Telegram", 403);
  }

  const { data: existingRaw } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("phone", verification.phone)
    .maybeSingle();

  const existing = existingRaw as { id: string } | null;
  let userId = existing?.id;

  if (!userId) {
    const authEmail = `${verification.phone.replace(/\D/g, "")}@phone.meetap.local`;
    const password = crypto.randomUUID();

    const auth = await supabaseAdmin.auth.admin.createUser({
      email: authEmail,
      password,
      email_confirm: true,
    });

    userId = auth.data.user?.id ?? crypto.randomUUID();

    const { error: insertErr } = await supabaseAdmin.from("users").insert({
      id: userId,
      phone: verification.phone,
      name,
      telegram_verified: true,
      telegram_user_id: verification.telegram_user_id,
      xp: 0,
      level: 1,
    });

    if (insertErr) {
      return fail(insertErr.message, 500);
    }
  }

  if (!userId) {
    return fail("Registration failed", 500);
  }

  const cookieStore = cookies();
  const base = {
    httpOnly: true as const,
    secure: true as const,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  };

  cookieStore.set("meetap_user_id", userId, base);
  cookieStore.set("meetap_verified", "1", base);

  return ok({ userId });
}
