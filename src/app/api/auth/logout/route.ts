import { cookies } from "next/headers";
import { ok } from "@/lib/http";

export async function POST() {
  cookies().set("meetap_user_id", "", { path: "/", maxAge: 0 });
  cookies().set("meetap_verified", "", { path: "/", maxAge: 0 });
  return ok({ success: true });
}
