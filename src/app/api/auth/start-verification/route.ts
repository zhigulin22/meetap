import { jsonError } from "@/lib/api";
import { startPhoneVerification } from "@/lib/store";
import { VerificationMethod } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const phone = String(body.phone || "").trim();
    const country = String(body.country || "").trim();
    const method = String(body.method || "telegram") as VerificationMethod;

    if (!phone || !country) {
      return jsonError("phone and country are required", 422);
    }

    if (method !== "telegram" && method !== "sms") {
      return jsonError("method must be telegram or sms", 422);
    }

    const session = startPhoneVerification(phone, country, method);

    return Response.json({
      sessionId: session.id,
      expiresAt: session.expiresAt,
      deliveryHint:
        method === "telegram"
          ? "Код отправлен в Telegram-бота (MVP mock)."
          : "Код отправлен по SMS (MVP mock).",
      devCode: "123456",
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "verification start failed", 400);
  }
}
