import { jsonError } from "@/lib/api";

export async function POST() {
  return jsonError("Use /api/auth/start-verification and /api/auth/verify-code", 410);
}
