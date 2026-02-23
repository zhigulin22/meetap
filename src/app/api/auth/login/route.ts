import { jsonError } from "@/lib/api";

export async function POST() {
  return jsonError("Use phone verification flow", 410);
}
