import { NextRequest } from "next/server";
import { icebreakerSchema } from "@/lib/schemas";
import { fail, ok } from "@/lib/http";
import { buildIcebreaker } from "@/server/ai";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = icebreakerSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.message, 422);
  }

  const result = await Promise.race([
    buildIcebreaker(parsed.data),
    new Promise<{ messages: string[]; topic: string; question: string }>((resolve) =>
      setTimeout(
        () =>
          resolve({
            messages: ["Привет! Давай познакомимся на ближайшем событии?"],
            topic: "Оффлайн-события",
            question: "Что тебе интереснее: лекция, прогулка или мастер-класс?",
          }),
        12_000,
      ),
    ),
  ]);

  return ok(result);
}
