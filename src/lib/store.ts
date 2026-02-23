import {
  Candidate,
  EventAction,
  EventInteraction,
  EventItem,
  Match,
  Message,
  Profile,
  ReportBlock,
  User,
  VerificationMethod,
  VerificationSession,
} from "@/lib/types";

const now = () => new Date().toISOString();

function id(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

const users: User[] = [
  {
    id: "u1",
    phone: "+79990000001",
    country: "RU",
    name: "Аня",
    isVerified: true,
    createdAt: now(),
    status: "active",
  },
  {
    id: "u2",
    phone: "+79990000002",
    country: "RU",
    name: "Иван",
    isVerified: true,
    createdAt: now(),
    status: "active",
  },
  {
    id: "u3",
    phone: "+79990000003",
    country: "RU",
    name: "Лиза",
    isVerified: true,
    createdAt: now(),
    status: "active",
  },
];

const profiles: Profile[] = [
  {
    userId: "u1",
    name: "Аня",
    age: 21,
    country: "RU",
    city: "Москва",
    university: "ВШЭ",
    faculty: "ФКН",
    bio: "Люблю городские события, выставки и бег.",
    facts: ["Бегаю по выходным", "Люблю джаз", "Пишу заметки о кино"],
    interests: ["искусство", "прогулки", "кофе", "лекции"],
    values: ["искренность", "развитие"],
    goal: "relationship",
  },
  {
    userId: "u2",
    name: "Иван",
    age: 23,
    country: "RU",
    city: "Москва",
    university: "МГУ",
    faculty: "Эконом",
    bio: "Часто хожу на музыкальные и бизнес-ивенты.",
    facts: ["Играю в падел", "Делаю pet-проекты", "Люблю ранние завтраки"],
    interests: ["музыка", "стартапы", "спорт"],
    values: ["честность", "амбиции"],
    goal: "networking",
  },
  {
    userId: "u3",
    name: "Лиза",
    age: 22,
    country: "RU",
    city: "Москва",
    university: "РАНХиГС",
    faculty: "Медиаком",
    bio: "Фотография, уютные бары и фестивали.",
    facts: ["Снимаю на пленку", "Люблю научпоп", "Хожу на стендап"],
    interests: ["фото", "кино", "фестивали", "кофе"],
    values: ["доброта", "свобода"],
    goal: "friendship",
  },
];

const events: EventItem[] = [
  {
    id: "e1",
    city: "Москва",
    title: "Лекция по современному искусству",
    description: "Камерная лекция и знакомство в небольших группах.",
    startTime: "2026-03-01T18:30:00.000Z",
    place: "ГЭС-2",
    tags: ["искусство", "лекции", "нетворк"],
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1505801315003-618f97514f4f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "e2",
    city: "Москва",
    title: "City Run Club",
    description: "Утренний бег и кофе после старта.",
    startTime: "2026-03-02T07:30:00.000Z",
    place: "Парк Горького",
    tags: ["спорт", "бег", "кофе"],
    mediaType: "video",
    mediaUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  },
  {
    id: "e3",
    city: "Москва",
    title: "Ночной кинопоказ indie",
    description: "Показ + обсуждение фильма у бара.",
    startTime: "2026-03-04T19:00:00.000Z",
    place: "Хлебозавод",
    tags: ["кино", "фестивали", "бар"],
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80",
  },
];

const eventInteractions: EventInteraction[] = [];
const matches: Match[] = [];
const messages: Message[] = [];
const reportsBlocks: ReportBlock[] = [];
const verificationSessions: VerificationSession[] = [];

export function startPhoneVerification(
  phone: string,
  country: string,
  method: VerificationMethod,
) {
  const session: VerificationSession = {
    id: id("ver"),
    phone,
    country,
    method,
    code: "123456",
    createdAt: now(),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  };
  verificationSessions.push(session);
  return session;
}

export function verifyPhoneCode(sessionId: string, code: string, name: string) {
  const session = verificationSessions.find((s) => s.id === sessionId);
  if (!session) {
    throw new Error("Verification session not found");
  }
  if (session.code !== code) {
    throw new Error("Invalid code");
  }
  if (new Date(session.expiresAt).getTime() < Date.now()) {
    throw new Error("Verification code expired");
  }

  let user = users.find((u) => u.phone === session.phone);
  if (!user) {
    user = {
      id: id("u"),
      phone: session.phone,
      country: session.country,
      name,
      isVerified: true,
      createdAt: now(),
      status: "active",
    };
    users.push(user);

    profiles.push({
      userId: user.id,
      name,
      age: 20,
      country: session.country,
      city: "",
      university: "",
      faculty: "",
      bio: "",
      facts: ["", "", ""],
      interests: [],
      values: [],
      goal: "friendship",
    });
  }

  return user;
}

export function getUserById(userId: string) {
  return users.find((u) => u.id === userId);
}

export function getProfileByUserId(userId: string) {
  return profiles.find((p) => p.userId === userId);
}

export function updateProfile(userId: string, patch: Partial<Omit<Profile, "userId">>) {
  const profile = getProfileByUserId(userId);
  if (!profile) {
    throw new Error("Profile not found");
  }
  Object.assign(profile, patch);
  return profile;
}

export function listEventsForUser(userId: string, city?: string) {
  const viewed = new Set(
    eventInteractions
      .filter((x) => x.userId === userId && ["dislike", "ignore"].includes(x.action))
      .map((x) => x.eventId),
  );

  return events
    .filter((e) => (!city || e.city === city) && !viewed.has(e.id))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
}

export function upsertEventInteraction(userId: string, eventId: string, action: EventAction) {
  const existing = eventInteractions.find((x) => x.userId === userId && x.eventId === eventId);
  if (existing) {
    existing.action = action;
    existing.createdAt = now();
    return existing;
  }
  const interaction: EventInteraction = { userId, eventId, action, createdAt: now() };
  eventInteractions.push(interaction);
  return interaction;
}

export function buildCandidates(userId: string): Candidate[] {
  const me = getProfileByUserId(userId);
  if (!me) {
    return [];
  }

  return profiles
    .filter((p) => p.userId !== userId && (!me.city || p.city === me.city))
    .map((candidate) => {
      const commonInterests = candidate.interests.filter((i) => me.interests.includes(i));
      const score = commonInterests.length * 2 + (me.goal === candidate.goal ? 1 : 0);
      return {
        userId,
        candidateUserId: candidate.userId,
        score,
        reason:
          commonInterests.length > 0
            ? `Общие интересы: ${commonInterests.slice(0, 3).join(", ")}`
            : "Похожий формат знакомств",
      };
    })
    .sort((a, b) => b.score - a.score);
}

export function likePerson(userId: string, targetUserId: string) {
  const existing = matches.find(
    (m) =>
      (m.user1Id === userId && m.user2Id === targetUserId) ||
      (m.user2Id === userId && m.user1Id === targetUserId),
  );
  if (existing) {
    return existing;
  }

  const match: Match = {
    id: id("m"),
    user1Id: userId,
    user2Id: targetUserId,
    status: "active",
    createdAt: now(),
  };
  matches.push(match);
  return match;
}

export function listMatchesForUser(userId: string) {
  return matches.filter(
    (m) => m.status === "active" && (m.user1Id === userId || m.user2Id === userId),
  );
}

export function getMatchMessages(matchId: string) {
  return messages
    .filter((m) => m.matchId === matchId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function createMessage(matchId: string, senderId: string, text: string, wasLlmSuggested = false) {
  const message: Message = {
    id: id("msg"),
    matchId,
    senderId,
    text,
    createdAt: now(),
    metadata: { wasLlmSuggested, promptVersion: "v0.2" },
  };
  messages.push(message);
  return message;
}

export function reportOrBlock(
  reporterId: string,
  targetUserId: string,
  type: "report" | "block",
  details?: string,
) {
  const item: ReportBlock = {
    id: id("rb"),
    reporterId,
    targetUserId,
    type,
    details,
    createdAt: now(),
  };
  reportsBlocks.push(item);

  if (type === "block") {
    matches.forEach((m) => {
      const pair =
        (m.user1Id === reporterId && m.user2Id === targetUserId) ||
        (m.user2Id === reporterId && m.user1Id === targetUserId);
      if (pair) {
        m.status = "blocked";
      }
    });
  }

  return item;
}
