import { jsonError } from "@/lib/api";
import { verifyPhoneCode } from "@/lib/store";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const sessionId = String(body.sessionId || "").trim();
    const code = String(body.code || "").trim();
    const name = String(body.name || "").trim();

    if (!sessionId || !code || !name) {
      return jsonError("sessionId, code, name are required", 422);
    }

    const user = verifyPhoneCode(sessionId, code, name);
    return Response.json({ userId: user.id, accessToken: `demo-token-${user.id}` });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "verification failed", 400);
  }
}
