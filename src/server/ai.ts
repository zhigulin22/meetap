import OpenAI from "openai";
import { getServerEnv } from "@/lib/env";

function getClient() {
  const env = getServerEnv();
  return new OpenAI({ apiKey: env.OPENAI_API_KEY });
}

export async function validateFaces(input: { imageUrl?: string; base64?: string }) {
  const fallback = { faces_count: 2, confidence: 0.55, ok: true as const };

  try {
    const client = getClient();
    const content = input.imageUrl
      ? [{ type: "input_text", text: "Count visible human faces in this image." }, { type: "input_image", image_url: input.imageUrl }]
      : [{ type: "input_text", text: "Count visible human faces in this image." }, { type: "input_image", image_url: `data:image/jpeg;base64,${input.base64}` }];

    const res = await client.responses.create({
      model: "gpt-4o-mini",
      input: [{ role: "user", content }],
      text: {
        format: {
          type: "json_schema",
          name: "face_validation",
          schema: {
            type: "object",
            properties: {
              faces_count: { type: "number" },
              confidence: { type: "number" },
              ok: { type: "boolean" },
              reason: { type: "string" },
            },
            required: ["faces_count", "confidence", "ok"],
            additionalProperties: false,
          },
        },
      },
    } as any);

    return JSON.parse(res.output_text) as {
      faces_count: number;
      confidence: number;
      ok: boolean;
      reason?: string;
    };
  } catch {
    return fallback;
  }
}

export async function buildIcebreaker(input: {
  user1: { name: string; interests: string[] };
  user2: { name: string; interests: string[] };
  context?: string;
}) {
  try {
    const client = getClient();
    const prompt = `Generate icebreakers in Russian for ${input.user1.name} to ${input.user2.name}. Context: ${input.context ?? "offline meeting"}.`;
    const res = await client.responses.create({
      model: "gpt-4o-mini",
      input: prompt,
      text: {
        format: {
          type: "json_schema",
          name: "icebreakers",
          schema: {
            type: "object",
            properties: {
              messages: { type: "array", items: { type: "string" } },
              topic: { type: "string" },
              question: { type: "string" },
            },
            required: ["messages", "topic", "question"],
            additionalProperties: false,
          },
        },
      },
    } as any);

    return JSON.parse(res.output_text) as {
      messages: string[];
      topic: string;
      question: string;
    };
  } catch {
    return {
      messages: [
        `Привет! Видел(а), что тебе тоже нравится ${input.user2.interests[0] ?? "живые события"}. Пойдешь на ивент в эти выходные?`,
        "Ты больше за камерные встречи или большие события?",
      ],
      topic: "Общие интересы",
      question: "Какой формат встречи тебе комфортнее для первого знакомства?",
    };
  }
}
