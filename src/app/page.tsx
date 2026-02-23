"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type EventItem = {
  id: string;
  title: string;
  description: string;
  startTime: string;
  place: string;
  tags: string[];
};

type Candidate = {
  candidateUserId: string;
  score: number;
  reason: string;
  profile: {
    userId: string;
    name: string;
    age: number;
    university: string;
    faculty: string;
    bio: string;
    interests: string[];
    goal: string;
  };
};

type MatchItem = {
  id: string;
  partnerProfile: {
    userId: string;
    name: string;
    bio: string;
  };
};

type Message = {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
};

type MeProfile = {
  name: string;
  age: number;
  city: string;
  university: string;
  faculty: string;
  bio: string;
  interests: string[];
  goal: "friendship" | "relationship" | "networking";
};

const defaultUsers = [
  { id: "u1", label: "Аня (demo)", email: "anna@example.com", password: "123456" },
  { id: "u2", label: "Иван (demo)", email: "ivan@example.com", password: "123456" },
  { id: "u3", label: "Лиза (demo)", email: "liza@example.com", password: "123456" },
];

function Chip({ text }: { text: string }) {
  return <span className="chip">{text}</span>;
}

export default function HomePage() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [activeTab, setActiveTab] = useState<"feed" | "people" | "chat" | "profile">("feed");
  const [userId, setUserId] = useState("u1");

  const [events, setEvents] = useState<EventItem[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [me, setMe] = useState<MeProfile | null>(null);
  const [draft, setDraft] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const selectedCandidateId = useMemo(
    () => candidates[0]?.candidateUserId || "",
    [candidates],
  );

  async function api<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, {
      ...init,
      headers: {
        "content-type": "application/json",
        "x-user-id": userId,
        ...(init?.headers || {}),
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Request failed");
    }

    return res.json();
  }

  async function loadAll() {
    setLoading(true);
    try {
      const [feedData, peopleData, meData, matchesData] = await Promise.all([
        api<{ items: EventItem[] }>("/api/feed/events"),
        api<{ items: Candidate[] }>("/api/recommendations/people"),
        api<{ profile: MeProfile }>("/api/me"),
        api<{ items: MatchItem[] }>("/api/matches"),
      ]);

      setEvents(feedData.items);
      setCandidates(peopleData.items);
      setMe(meData.profile);
      setMatches(matchesData.items);

      const first = matchesData.items[0]?.id;
      if (first) {
        setSelectedMatch(first);
        const msg = await api<{ items: Message[] }>(`/api/matches/${first}/messages`);
        setMessages(msg.items);
      } else {
        setSelectedMatch("");
        setMessages([]);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  async function sendEventAction(eventId: string, action: string) {
    await api(`/api/events/${eventId}/interaction`, {
      method: "POST",
      body: JSON.stringify({ action }),
    });
    await loadAll();
  }

  async function likePerson(targetUserId: string) {
    await api(`/api/people/${targetUserId}/like`, { method: "POST" });
    await loadAll();
    setActiveTab("chat");
  }

  async function generateFirstMessage() {
    const targetUserId = selectedCandidateId || candidates[0]?.candidateUserId;
    if (!targetUserId) {
      return;
    }
    const data = await api<{ messages: string[]; topics: string[] }>("/api/llm/first-message", {
      method: "POST",
      body: JSON.stringify({ targetUserId }),
    });
    setSuggestions(data.messages);
    setTopics(data.topics);
  }

  async function sendMessage(e: FormEvent) {
    e.preventDefault();
    if (!selectedMatch || !draft.trim()) {
      return;
    }
    await api(`/api/matches/${selectedMatch}/messages`, {
      method: "POST",
      body: JSON.stringify({ text: draft }),
    });
    setDraft("");
    const data = await api<{ items: Message[] }>(`/api/matches/${selectedMatch}/messages`);
    setMessages(data.items);
  }

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    if (!me) {
      return;
    }
    await api("/api/me", {
      method: "PATCH",
      body: JSON.stringify({
        ...me,
        interests: me.interests,
      }),
    });
    await loadAll();
  }

  async function switchMatch(matchId: string) {
    setSelectedMatch(matchId);
    const data = await api<{ items: Message[] }>(`/api/matches/${matchId}/messages`);
    setMessages(data.items);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="kicker">MVP</p>
          <h1>Znakomstva: Smart Event Dating</h1>
          <p className="subtle">Лента событий, рекомендации людей и AI-подсказки для первого сообщения.</p>
        </div>
        <div className="controls">
          <label className="field compact">
            Профиль
            <select value={userId} onChange={(e) => setUserId(e.target.value)}>
              {defaultUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>
          </label>
          <button
            className="secondary"
            onClick={() => setTheme((v) => (v === "light" ? "dark" : "light"))}
          >
            Тема: {theme === "light" ? "Светлая" : "Темная"}
          </button>
        </div>
      </header>

      <nav className="tabs">
        {[
          ["feed", "Лента событий"],
          ["people", "Люди"],
          ["chat", "Матчи и чат"],
          ["profile", "Профиль"],
        ].map(([key, label]) => (
          <button
            key={key}
            className={activeTab === key ? "tab active" : "tab"}
            onClick={() => setActiveTab(key as typeof activeTab)}
          >
            {label}
          </button>
        ))}
      </nav>

      {loading ? <p className="subtle">Загрузка...</p> : null}

      {activeTab === "feed" ? (
        <section className="grid">
          {events.map((event) => (
            <article key={event.id} className="card">
              <p className="meta">{new Date(event.startTime).toLocaleString("ru-RU")}</p>
              <h3>{event.title}</h3>
              <p>{event.description}</p>
              <p className="subtle">{event.place}</p>
              <div className="chips">{event.tags.map((tag) => <Chip key={tag} text={tag} />)}</div>
              <div className="row">
                <button className="primary" onClick={() => sendEventAction(event.id, "like")}>Лайк</button>
                <button className="secondary" onClick={() => sendEventAction(event.id, "save")}>Сохранить</button>
                <button className="ghost" onClick={() => sendEventAction(event.id, "dislike")}>Пропуск</button>
              </div>
            </article>
          ))}
        </section>
      ) : null}

      {activeTab === "people" ? (
        <section className="grid">
          {candidates.map((item) => (
            <article key={item.candidateUserId} className="card">
              <p className="meta">Score: {item.score}</p>
              <h3>
                {item.profile.name}, {item.profile.age}
              </h3>
              <p>{item.profile.bio}</p>
              <p className="subtle">
                {item.profile.university} {item.profile.faculty ? `• ${item.profile.faculty}` : ""}
              </p>
              <p className="subtle">{item.reason}</p>
              <div className="chips">
                {item.profile.interests.map((i) => (
                  <Chip key={i} text={i} />
                ))}
              </div>
              <div className="row">
                <button className="primary" onClick={() => likePerson(item.candidateUserId)}>
                  Предложить знакомство
                </button>
                <button className="secondary" onClick={generateFirstMessage}>
                  AI-подсказка
                </button>
              </div>
            </article>
          ))}
          <article className="card">
            <h3>AI-первое сообщение</h3>
            <p className="subtle">3-5 вариантов + темы продолжения. Генерация безопасного тона.</p>
            <div className="stack">
              {suggestions.map((s) => (
                <button key={s} className="ghost left" onClick={() => setDraft(s)}>
                  {s}
                </button>
              ))}
            </div>
            <div className="chips">{topics.map((t) => <Chip key={t} text={t} />)}</div>
          </article>
        </section>
      ) : null}

      {activeTab === "chat" ? (
        <section className="chat-layout">
          <aside className="card side-list">
            <h3>Матчи</h3>
            <div className="stack">
              {matches.map((m) => (
                <button
                  key={m.id}
                  className={m.id === selectedMatch ? "tab active left" : "tab left"}
                  onClick={() => switchMatch(m.id)}
                >
                  {m.partnerProfile?.name || "Пользователь"}
                </button>
              ))}
              {!matches.length ? <p className="subtle">Пока нет матчей. Лайкни людей в разделе «Люди».</p> : null}
            </div>
          </aside>
          <article className="card chat-card">
            <h3>Чат</h3>
            <div className="messages">
              {messages.map((m) => (
                <div key={m.id} className={m.senderId === userId ? "bubble mine" : "bubble"}>
                  {m.text}
                </div>
              ))}
              {!messages.length ? <p className="subtle">Сообщений пока нет.</p> : null}
            </div>
            <form className="row" onSubmit={sendMessage}>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Напиши первое сообщение..."
              />
              <button className="primary" type="submit">
                Отправить
              </button>
            </form>
          </article>
        </section>
      ) : null}

      {activeTab === "profile" && me ? (
        <section className="grid single">
          <form className="card form" onSubmit={saveProfile}>
            <h3>Профиль и анкета</h3>
            <label className="field">
              Имя
              <input value={me.name} onChange={(e) => setMe({ ...me, name: e.target.value })} />
            </label>
            <label className="field">
              Bio
              <textarea
                value={me.bio}
                onChange={(e) => setMe({ ...me, bio: e.target.value })}
                rows={4}
              />
            </label>
            <div className="row split">
              <label className="field">
                Город
                <input value={me.city} onChange={(e) => setMe({ ...me, city: e.target.value })} />
              </label>
              <label className="field">
                Цель
                <select
                  value={me.goal}
                  onChange={(e) => setMe({ ...me, goal: e.target.value as MeProfile["goal"] })}
                >
                  <option value="friendship">Дружба</option>
                  <option value="relationship">Отношения</option>
                  <option value="networking">Нетворк</option>
                </select>
              </label>
            </div>
            <label className="field">
              Интересы (через запятую)
              <input
                value={me.interests.join(", ")}
                onChange={(e) =>
                  setMe({
                    ...me,
                    interests: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
              />
            </label>
            <button className="primary" type="submit">
              Сохранить профиль
            </button>
          </form>
        </section>
      ) : null}
    </div>
  );
}
