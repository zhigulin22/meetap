"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type EventItem = {
  id: string;
  title: string;
  description: string;
  startTime: string;
  place: string;
  tags: string[];
  mediaType: "image" | "video";
  mediaUrl: string;
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
};

type Profile = {
  name: string;
  country: string;
  city: string;
  university: string;
  bio: string;
  facts: [string, string, string];
  interests: string[];
  goal: "friendship" | "relationship" | "networking";
};

type Tab = "feed" | "people" | "chat" | "profile";
type AuthStep = "phone" | "code";

const COUNTRIES = [
  { code: "RU", label: "Россия" },
  { code: "KZ", label: "Казахстан" },
  { code: "BY", label: "Беларусь" },
  { code: "UZ", label: "Узбекистан" },
];

function apiRequest<T>(userId: string | null, url: string, init?: RequestInit): Promise<T> {
  return fetch(url, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(userId ? { "x-user-id": userId } : {}),
      ...(init?.headers || {}),
    },
  }).then(async (res) => {
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw new Error(e.error || "Request failed");
    }
    return res.json();
  });
}

function Icon({ name }: { name: Tab }) {
  const common = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.9 };
  if (name === "feed") {
    return <svg {...common}><path d="M3 10l9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>;
  }
  if (name === "people") {
    return <svg {...common}><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.2 2.6-5 6-5s6 1.8 6 5"/><path d="M16 7a3 3 0 1 1 0 6"/></svg>;
  }
  if (name === "chat") {
    return <svg {...common}><path d="M21 11.5A8.5 8.5 0 1 1 6.5 5.1"/><path d="M8 19l-4 2 1.2-4"/></svg>;
  }
  return <svg {...common}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-3.5 3.6-6 8-6s8 2.5 8 6"/></svg>;
}

export default function Home() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [tab, setTab] = useState<Tab>("feed");
  const [userId, setUserId] = useState<string | null>(null);

  const [authStep, setAuthStep] = useState<AuthStep>("phone");
  const [phone, setPhone] = useState("+7");
  const [name, setName] = useState("");
  const [country, setCountry] = useState("RU");
  const [method, setMethod] = useState<"telegram" | "sms">("telegram");
  const [sessionId, setSessionId] = useState("");
  const [code, setCode] = useState("");
  const [authHint, setAuthHint] = useState("");

  const [events, setEvents] = useState<EventItem[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [selectedMatch, setSelectedMatch] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [me, setMe] = useState<Profile | null>(null);
  const [draft, setDraft] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [error, setError] = useState("");

  const selectedCandidate = useMemo(() => candidates[0]?.candidateUserId || "", [candidates]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  async function loadAppData(uid: string) {
    const [feedData, peopleData, meData, matchesData] = await Promise.all([
      apiRequest<{ items: EventItem[] }>(uid, "/api/feed/events"),
      apiRequest<{ items: Candidate[] }>(uid, "/api/recommendations/people"),
      apiRequest<{ profile: Profile }>(uid, "/api/me"),
      apiRequest<{ items: MatchItem[] }>(uid, "/api/matches"),
    ]);

    setEvents(feedData.items);
    setCandidates(peopleData.items);
    setMe(meData.profile);
    setMatches(matchesData.items);

    if (matchesData.items.length) {
      const first = matchesData.items[0].id;
      setSelectedMatch(first);
      const msg = await apiRequest<{ items: Message[] }>(uid, `/api/matches/${first}/messages`);
      setMessages(msg.items);
    }
  }

  async function beginVerification(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await apiRequest<{ sessionId: string; deliveryHint: string; devCode: string }>(null, "/api/auth/start-verification", {
        method: "POST",
        body: JSON.stringify({ phone, country, method }),
      });
      setSessionId(res.sessionId);
      setAuthHint(`${res.deliveryHint} Для демо код: ${res.devCode}`);
      setAuthStep("code");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка отправки кода");
    }
  }

  async function verifyCode(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await apiRequest<{ userId: string }>(null, "/api/auth/verify-code", {
        method: "POST",
        body: JSON.stringify({ sessionId, code, name }),
      });
      setUserId(res.userId);
      await loadAppData(res.userId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка верификации");
    }
  }

  async function onEventAction(eventId: string, action: string) {
    if (!userId) return;
    await apiRequest(userId, `/api/events/${eventId}/interaction`, {
      method: "POST",
      body: JSON.stringify({ action }),
    });
    await loadAppData(userId);
  }

  async function onLikePerson(targetUserId: string) {
    if (!userId) return;
    await apiRequest(userId, `/api/people/${targetUserId}/like`, { method: "POST" });
    await loadAppData(userId);
    setTab("chat");
  }

  async function generateIdeas() {
    if (!userId || !selectedCandidate) return;
    const data = await apiRequest<{ messages: string[]; topics: string[] }>(userId, "/api/llm/first-message", {
      method: "POST",
      body: JSON.stringify({ targetUserId: selectedCandidate }),
    });
    setSuggestions(data.messages);
    setTopics(data.topics);
  }

  async function onSendMessage(e: FormEvent) {
    e.preventDefault();
    if (!userId || !selectedMatch || !draft.trim()) return;
    await apiRequest(userId, `/api/matches/${selectedMatch}/messages`, {
      method: "POST",
      body: JSON.stringify({ text: draft }),
    });
    setDraft("");
    const data = await apiRequest<{ items: Message[] }>(userId, `/api/matches/${selectedMatch}/messages`);
    setMessages(data.items);
  }

  async function onSwitchMatch(id: string) {
    if (!userId) return;
    setSelectedMatch(id);
    const data = await apiRequest<{ items: Message[] }>(userId, `/api/matches/${id}/messages`);
    setMessages(data.items);
  }

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    if (!userId || !me) return;
    await apiRequest(userId, "/api/me", { method: "PATCH", body: JSON.stringify(me) });
    await loadAppData(userId);
  }

  if (!userId) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <h1>Meetap</h1>
          <p className="muted">Знакомства через события в городе. Без свайп-шума.</p>

          {authStep === "phone" ? (
            <form className="form" onSubmit={beginVerification}>
              <label>
                Номер телефона
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+79990000000" required />
              </label>

              <label>
                Имя
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Как тебя зовут" required />
              </label>

              <label>
                Страна
                <select value={country} onChange={(e) => setCountry(e.target.value)}>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
              </label>

              <div className="method-switch">
                <button type="button" className={method === "telegram" ? "active" : ""} onClick={() => setMethod("telegram")}>Telegram</button>
                <button type="button" className={method === "sms" ? "active" : ""} onClick={() => setMethod("sms")}>SMS</button>
              </div>

              <button className="primary" type="submit">Получить код</button>
            </form>
          ) : (
            <form className="form" onSubmit={verifyCode}>
              <p className="muted">{authHint}</p>
              <label>
                Код подтверждения
                <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" required />
              </label>
              <button className="primary" type="submit">Войти в приложение</button>
              <button className="ghost" type="button" onClick={() => setAuthStep("phone")}>Изменить номер</button>
            </form>
          )}
          {error ? <p className="error">{error}</p> : null}
        </section>
      </main>
    );
  }

  return (
    <main className="mobile-shell">
      <header className="mobile-topbar">
        <div>
          <p className="tiny">Meetap</p>
          <h2>{tab === "feed" ? "Лента" : tab === "people" ? "Люди" : tab === "chat" ? "Чаты" : "Профиль"}</h2>
        </div>
        <button className="ghost small" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>{theme === "dark" ? "Light" : "Dark"}</button>
      </header>

      <section className="content">
        {tab === "feed" && (
          <div className="stack gap12">
            {events.map((event) => (
              <article key={event.id} className="event-card">
                <div className="media-wrap">
                  {event.mediaType === "image" ? (
                    <img src={event.mediaUrl} alt={event.title} />
                  ) : (
                    <video src={event.mediaUrl} muted controls playsInline />
                  )}
                </div>
                <div className="event-body">
                  <p className="muted tiny">{new Date(event.startTime).toLocaleString("ru-RU")} • {event.place}</p>
                  <h3>{event.title}</h3>
                  <p>{event.description}</p>
                  <div className="chips">
                    {event.tags.map((t) => <span key={t} className="chip">{t}</span>)}
                  </div>
                  <div className="actions">
                    <button className="ghost" onClick={() => onEventAction(event.id, "dislike")}>Пропуск</button>
                    <button className="secondary" onClick={() => onEventAction(event.id, "save")}>Сохранить</button>
                    <button className="primary" onClick={() => onEventAction(event.id, "like")}>Нравится</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {tab === "people" && (
          <div className="stack gap12">
            {candidates.map((c) => (
              <article key={c.candidateUserId} className="panel">
                <div className="row-between">
                  <h3>{c.profile.name}, {c.profile.age}</h3>
                  <span className="score">{c.score}</span>
                </div>
                <p className="muted">{c.reason}</p>
                <p>{c.profile.bio}</p>
                <div className="chips">{c.profile.interests.map((i) => <span key={i} className="chip">{i}</span>)}</div>
                <div className="actions">
                  <button className="secondary" onClick={generateIdeas}>AI идеи</button>
                  <button className="primary" onClick={() => onLikePerson(c.candidateUserId)}>Познакомиться</button>
                </div>
              </article>
            ))}
            {(suggestions.length > 0 || topics.length > 0) && (
              <article className="panel">
                <h3>Первое сообщение</h3>
                <div className="stack">
                  {suggestions.map((s) => <button key={s} className="ghost left" onClick={() => setDraft(s)}>{s}</button>)}
                </div>
                <div className="chips">{topics.map((t) => <span key={t} className="chip">{t}</span>)}</div>
              </article>
            )}
          </div>
        )}

        {tab === "chat" && (
          <div className="stack gap12">
            <article className="panel">
              <div className="horizontal-scroll">
                {matches.map((m) => (
                  <button key={m.id} className={selectedMatch === m.id ? "pill active" : "pill"} onClick={() => onSwitchMatch(m.id)}>
                    {m.partnerProfile.name}
                  </button>
                ))}
              </div>
              <div className="chat-box">
                {messages.map((m) => <div key={m.id} className={m.senderId === userId ? "bubble mine" : "bubble"}>{m.text}</div>)}
                {!messages.length && <p className="muted">Пока нет сообщений. Сначала создай match.</p>}
              </div>
              <form className="composer" onSubmit={onSendMessage}>
                <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Напиши сообщение" />
                <button className="primary">Отправить</button>
              </form>
            </article>
          </div>
        )}

        {tab === "profile" && me && (
          <form className="panel form" onSubmit={saveProfile}>
            <h3>Профиль</h3>
            <label>
              Имя
              <input value={me.name} onChange={(e) => setMe({ ...me, name: e.target.value })} />
            </label>
            <label>
              Страна
              <select value={me.country} onChange={(e) => setMe({ ...me, country: e.target.value })}>
                {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
              </select>
            </label>
            <label>
              ВУЗ
              <input value={me.university} onChange={(e) => setMe({ ...me, university: e.target.value })} placeholder="Опционально" />
            </label>
            <label>
              Bio
              <textarea rows={3} value={me.bio} onChange={(e) => setMe({ ...me, bio: e.target.value })} />
            </label>
            <label>
              3 факта о себе (через запятую)
              <input
                value={me.facts.join(", ")}
                onChange={(e) => {
                  const arr = e.target.value.split(",").map((x) => x.trim()).filter(Boolean);
                  setMe({ ...me, facts: [arr[0] || "", arr[1] || "", arr[2] || ""] });
                }}
              />
            </label>
            <button className="primary" type="submit">Сохранить</button>
          </form>
        )}
      </section>

      <nav className="bottom-nav">
        {(["feed", "people", "chat", "profile"] as Tab[]).map((name) => (
          <button key={name} onClick={() => setTab(name)} className={tab === name ? "nav-item active" : "nav-item"}>
            <Icon name={name} />
            <span>{name === "feed" ? "Лента" : name === "people" ? "Люди" : name === "chat" ? "Чаты" : "Я"}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}
