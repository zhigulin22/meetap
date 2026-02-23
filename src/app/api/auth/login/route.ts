import { login } from "@/lib/store";
import { jsonError } from "@/lib/api";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const user = login(String(body.email || ""), String(body.password || ""));
    return Response.json({ userId: user.id, accessToken: `demo-token-${user.id}` });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "login failed", 401);
  }
}
