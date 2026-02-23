import { registerUser } from "@/lib/store";
import { jsonError } from "@/lib/api";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email || "").trim();
    const password = String(body.password || "").trim();
    const name = String(body.name || "").trim();

    if (!email || !password || !name) {
      return jsonError("name, email and password are required", 422);
    }

    const user = registerUser(email, password, name);
    return Response.json({ userId: user.id, accessToken: `demo-token-${user.id}` });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "register failed", 400);
  }
}
