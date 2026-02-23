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
} from "@/lib/types";

const now = () => new Date().toISOString();

const users: User[] = [
  {
    id: "u1",
    email: "anna@example.com",
    password: "123456",
    createdAt: now(),
    status: "active",
  },
  {
    id: "u2",
    email: "ivan@example.com",
    password: "123456",
    createdAt: now(),
    status: "active",
  },
  {
    id: "u3",
    email: "liza@example.com",
    password: "123456",
    createdAt: now(),
    status: "active",
  },
  {
    id: "u4",
    email: "max@example.com",
    password: "123456",
    createdAt: now(),
    status: "active",
  },
];

const profiles: Profile[] = [
  {
    userId: "u1",
    name: "Аня",
    age: 21,
    city: "Москва",
    university: "ВШЭ",
    faculty: "ФКН",
    bio: "Люблю городские события, выставки и бег по набережной.",
    interests: ["искусство", "прогулки", "кофе", "лекции"],
    values: ["искренность", "развитие"],
    goal: "relationship",
  },
  {
    userId: "u2",
    name: "Иван",
    age: 23,
    city: "Москва",
    university: "МГУ",
    faculty: "Эконом",
    bio: "Часто хожу на музыкальные и бизнес-ивенты.",
    interests: ["музыка", "стартапы", "спорт"],
    values: ["честность", "амбиции"],
    goal: "networking",
  },
  {
    userId: "u3",
    name: "Лиза",
    age: 22,
    city: "Москва",
    university: "РАНХиГС",
    faculty: "Медиаком",
    bio: "Фотография, уютные бары, фестивали и кино.",
    interests: ["фото", "кино", "фестивали", "кофе"],
    values: ["доброта", "свобода"],
    goal: "friendship",
  },
  {
    userId: "u4",
    name: "Макс",
    age: 24,
    city: "Москва",
    university: "МИФИ",
    faculty: "ИТ",
    bio: "Технологии, митапы, бег и шахматы.",
    interests: ["технологии", "митапы", "бег", "шахматы"],
    values: ["уважение", "ответственность"],
    goal: "relationship",
  },
];

const events: EventItem[] = [
  {
    id: "e1",
    city: "Москва",
    title: "Лекция по современному искусству",
    description: "Вечерняя лекция с обсуждением в малых группах.",
    startTime: "2026-02-28T18:30:00.000Z",
    place: "ГЭС-2",
    tags: ["искусство", "лекции", "нетворк"],
  },
  {
    id: "e2",
    city: "Москва",
    title: "Стартап-митап: AI и продукты",
    description: "Короткие доклады и знакомство участников.",
    startTime: "2026-03-02T16:00:00.000Z",
    place: "Красный Октябрь",
    tags: ["стартапы", "технологии", "митапы"],
  },
  {
    id: "e3",
    city: "Москва",
    title: "Ночной кинопоказ indie-фильмов",
    description: "Показ + обсуждение за кофе.",
    startTime: "2026-03-04T19:00:00.000Z",
    place: "Хлебозавод",
    tags: ["кино", "кофе", "фестивали"],
  },
  {
    id: "e4",
    city: "Москва",
    title: "Утренний run club",
    description: "Легкий темп, знакомство после пробежки.",
    startTime: "2026-03-01T08:00:00.000Z",
    place: "Парк Горького",
    tags: ["спорт", "бег", "прогулки"],
  },
];

const eventInteractions: EventInteraction[] = [];
const matches: Match[] = [];
const messages: Message[] = [];
const reportsBlocks: ReportBlock[] = [];

function id(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export const db = {
  users,
  profiles,
  events,
  eventInteractions,
  matches,
  messages,
  reportsBlocks,
};

export function getUserById(userId: string) {
  return users.find((u) => u.id === userId);
}

export function getUserByEmail(email: string) {
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function getProfileByUserId(userId: string) {
  return profiles.find((p) => p.userId === userId);
}

export function registerUser(email: string, password: string, name: string) {
  const existing = getUserByEmail(email);
  if (existing) {
    throw new Error("Email already exists");
  }
  const user: User = {
    id: id("u"),
    email,
    password,
    createdAt: now(),
    status: "active",
  };
  const profile: Profile = {
    userId: user.id,
    name,
    age: 20,
    city: "Москва",
    university: "",
    faculty: "",
    bio: "",
    interests: [],
    values: [],
    goal: "friendship",
  };
  users.push(user);
  profiles.push(profile);
  return user;
}

export function login(email: string, password: string) {
  const user = getUserByEmail(email);
  if (!user || user.password !== password || user.status !== "active") {
    throw new Error("Invalid credentials");
  }
  return user;
}

export function updateProfile(
  userId: string,
  patch: Partial<Omit<Profile, "userId">>,
) {
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

export function upsertEventInteraction(
  userId: string,
  eventId: string,
  action: EventAction,
) {
  const existing = eventInteractions.find(
    (x) => x.userId === userId && x.eventId === eventId,
  );
  if (existing) {
    existing.action = action;
    existing.createdAt = now();
    return existing;
  }
  const interaction: EventInteraction = {
    userId,
    eventId,
    action,
    createdAt: now(),
  };
  eventInteractions.push(interaction);
  return interaction;
}

export function buildCandidates(userId: string): Candidate[] {
  const me = getProfileByUserId(userId);
  if (!me) {
    return [];
  }

  const myLikedEvents = eventInteractions
    .filter((x) => x.userId === userId && x.action === "like")
    .map((x) => events.find((e) => e.id === x.eventId))
    .filter(Boolean) as EventItem[];

  return profiles
    .filter((p) => p.userId !== userId && p.city === me.city)
    .map((candidate) => {
      const commonInterests = candidate.interests.filter((i) =>
        me.interests.includes(i),
      );
      const commonLikedEventTags = myLikedEvents.flatMap((e) =>
        e.tags.filter((t) => candidate.interests.includes(t)),
      );
      const goalBoost = me.goal === candidate.goal ? 1 : 0;
      const score =
        commonInterests.length * 2 + commonLikedEventTags.length + goalBoost;
      const reason =
        commonInterests.length > 0
          ? `Общие интересы: ${commonInterests.slice(0, 3).join(", ")}`
          : "Похожий формат активности в городе";
      return {
        userId,
        candidateUserId: candidate.userId,
        score,
        reason,
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

  const reverseLike = eventInteractions.some(
    (x) => x.userId === targetUserId && x.action === "like",
  );

  const match: Match = {
    id: id("m"),
    user1Id: userId,
    user2Id: targetUserId,
    status: "active",
    createdAt: now(),
  };

  if (reverseLike || Math.random() > 0.4) {
    matches.push(match);
  }

  return match;
}

export function getMatchMessages(matchId: string) {
  return messages
    .filter((m) => m.matchId === matchId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function createMessage(
  matchId: string,
  senderId: string,
  text: string,
  wasLlmSuggested = false,
) {
  const message: Message = {
    id: id("msg"),
    matchId,
    senderId,
    text,
    createdAt: now(),
    metadata: {
      wasLlmSuggested,
      promptVersion: "v0.1",
    },
  };
  messages.push(message);
  return message;
}

export function listMatchesForUser(userId: string) {
  return matches.filter(
    (m) => m.status === "active" && (m.user1Id === userId || m.user2Id === userId),
  );
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
