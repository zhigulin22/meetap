"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Moon, Sun } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";

export default function MyProfilePage() {
  const router = useRouter();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [form, setForm] = useState({
    university: "",
    work: "",
    hobbies: "",
    interests: "",
    facts: "",
    avatar_url: "",
  });

  const { data, refetch } = useQuery({
    queryKey: ["me"],
    queryFn: () => api<{ profile: any }>("/api/profile/me"),
  });

  useEffect(() => {
    const t = (localStorage.getItem("theme") as "dark" | "light" | null) ?? "dark";
    setTheme(t);
    if (t === "dark") document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    if (!data?.profile) return;
    const p = data.profile;
    setForm({
      university: p.university ?? "",
      work: p.work ?? "",
      hobbies: (p.hobbies ?? []).join(", "),
      interests: (p.interests ?? []).join(", "),
      facts: (p.facts ?? []).join("\n"),
      avatar_url: p.avatar_url ?? "",
    });
  }, [data]);

  async function save() {
    const interests = form.interests.split(",").map((x) => x.trim()).filter(Boolean);
    const facts = form.facts.split("\n").map((x) => x.trim()).filter(Boolean).slice(0, 3);

    if (interests.length < 3) {
      toast.error("Нужно минимум 3 интереса");
      return;
    }

    if (facts.length < 3) {
      toast.error("Добавь 3 факта о себе");
      return;
    }

    try {
      await api("/api/profile/me", {
        method: "PATCH",
        body: JSON.stringify({
          university: form.university,
          work: form.work,
          hobbies: form.hobbies.split(",").map((x) => x.trim()).filter(Boolean),
          interests,
          facts,
          avatar_url: form.avatar_url || undefined,
        }),
      });
      toast.success("Профиль обновлен");
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка");
    }
  }

  async function logout() {
    await api("/api/auth/logout", { method: "POST" });
    router.push("/register");
  }

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }

  return (
    <PageShell>
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Мой профиль</h1>
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-3 p-4">
          <p className="text-sm text-muted">Заполни профиль, чтобы система точнее находила людей и подбирала релевантные мероприятия.</p>
          <Input placeholder="Ссылка на фото профиля" value={form.avatar_url} onChange={(e) => setForm((s) => ({ ...s, avatar_url: e.target.value }))} />
          <Input placeholder="ВУЗ (пример: ВШЭ)" value={form.university} onChange={(e) => setForm((s) => ({ ...s, university: e.target.value }))} />
          <Input placeholder="Работа (пример: Product Designer)" value={form.work} onChange={(e) => setForm((s) => ({ ...s, work: e.target.value }))} />
          <Input placeholder="Хобби через запятую (бег, кино, кофе)" value={form.hobbies} onChange={(e) => setForm((s) => ({ ...s, hobbies: e.target.value }))} />
          <Textarea placeholder="Интересы (минимум 3) через запятую: стартапы, дизайн, музыка" value={form.interests} onChange={(e) => setForm((s) => ({ ...s, interests: e.target.value }))} />
          <Textarea placeholder={`3 факта о себе (каждый с новой строки)\nНапример:\n- Путешествую каждый месяц\n- Люблю шахматы\n- Веду клуб чтения`} value={form.facts} onChange={(e) => setForm((s) => ({ ...s, facts: e.target.value }))} />
          <Button className="w-full" onClick={save}>Сохранить</Button>
          <Button variant="secondary" className="w-full" onClick={logout}>Выйти</Button>
        </CardContent>
      </Card>
    </PageShell>
  );
}
