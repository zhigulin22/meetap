"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();

  const { data, refetch } = useQuery({
    queryKey: ["event", params.id],
    queryFn: () => api<{ event: any; participants: any[] }>(`/api/events/${params.id}`),
  });

  async function join() {
    await api(`/api/events/${params.id}/join`, { method: "POST" });
    toast.success("Участие подтверждено");
    refetch();
  }

  async function find3() {
    const res = await api<{ items: Array<{ id: string; name: string; common: string[] }> }>(`/api/events/${params.id}/find-3`, { method: "POST" });
    if (!res.items.length) {
      toast.message("Подходящих участников пока нет");
      return;
    }
    toast.success(`Нашли ${res.items.length} человек с пересечением интересов`);
  }

  if (!data) {
    return <PageShell><Card><CardContent className="p-4">Загрузка...</CardContent></Card></PageShell>;
  }

  return (
    <PageShell>
      <Card>
        <CardContent className="space-y-3 p-4">
          <Image src={data.event.cover_url || "https://placehold.co/1200x700"} alt={data.event.title} width={1200} height={700} className="h-48 w-full rounded-xl object-cover" unoptimized />
          <h1 className="text-2xl font-semibold">{data.event.title}</h1>
          <p className="text-sm text-muted">{new Date(data.event.event_date).toLocaleString("ru-RU")} · {data.event.price === 0 ? "Бесплатно" : `${data.event.price} ₽`}</p>
          <p>{data.event.description}</p>
          <div className="space-y-1">
            <p className="text-sm font-medium">Что получите:</p>
            {data.event.outcomes?.map((o: string) => <p key={o} className="text-sm text-muted">• {o}</p>)}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={join}>Я иду</Button>
            <Button variant="secondary" onClick={find3}>Найти 3 человека рядом</Button>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Участники</p>
            <div className="space-y-2">
              {data.participants.map((p: any) => {
                const user = Array.isArray(p.users) ? p.users[0] : p.users;
                if (!user) return null;
                return (
                  <Link key={user.id} href={`/profile/${user.id}`} className="flex items-center gap-2 text-sm text-muted">
                    <Image src={user.avatar_url || "https://placehold.co/100"} alt={user.name} width={100} height={100} className="h-8 w-8 rounded-full object-cover" unoptimized />
                    {user.name}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-black/10 p-3 text-sm text-muted">Чат события (MVP placeholder): структура готова, real-time можно подключить через Supabase Realtime.</div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
