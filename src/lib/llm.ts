import { getProfileByUserId } from "@/lib/store";

export function generateFirstMessages(userId: string, targetUserId: string, eventId?: string) {
  const me = getProfileByUserId(userId);
  const target = getProfileByUserId(targetUserId);

  if (!me || !target) {
    throw new Error("Profiles not found");
  }

  const shared = me.interests.filter((x) => target.interests.includes(x));
  const sharedText = shared.length ? shared.slice(0, 2).join(" и ") : "городские события";
  const eventPart = eventId ? "Увидел тебя в рекомендации после события" : "Увидел твой профиль";

  const messages = [
    `${eventPart} и решил написать. Тоже люблю ${sharedText} — как тебе идея сходить на ближайший ивент?`,
    `Привет! У нас похоже совпадает интерес к ${sharedText}. Как обычно выбираешь события на выходные?`,
    `Хей! Понравился твой профиль, особенно про ${sharedText}. Если не против, давай познакомимся 🙂`,
    `Привет, вижу общий вайб по ${sharedText}. Могу скинуть пару крутых ивентов на этой неделе.`,
  ];

  const topics = [
    "Какие форматы событий тебе нравятся больше всего",
    "Любимые места в городе для первого знакомства",
    "Планы на ближайшие выходные",
  ];

  return {
    messages,
    topics,
    promptVersion: "v0.1",
    modelVersion: "template-heuristic",
    latencyMs: 40,
  };
}
