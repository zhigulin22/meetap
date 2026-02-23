"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/page-shell";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api-client";

export default function ContactsPage() {
  const [q, setQ] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["contacts", q],
    queryFn: () => api<{ people: any[]; groups: any[] }>(`/api/contacts?q=${encodeURIComponent(q)}`),
  });

  return (
    <PageShell>
      <h1 className="mb-3 text-2xl font-semibold">Контакты</h1>
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Найти человека или группу" />

      <div className="mt-3 space-y-3">
        {isLoading ? <Skeleton className="h-24 w-full" /> : null}

        <Card>
          <CardContent className="space-y-2 p-3">
            <h2 className="text-sm font-semibold">Люди</h2>
            {data?.people.map((person) => (
              <Link key={person.id} href={`/profile/${person.id}`} className="flex items-center gap-2 rounded-xl border border-border p-2 text-sm">
                <Image src={person.avatar_url || "https://placehold.co/100"} alt={person.name} width={100} height={100} className="h-8 w-8 rounded-full object-cover" unoptimized />
                <div>
                  <p>{person.name}</p>
                  <p className="text-xs text-muted">{(person.interests || []).slice(0, 3).join(", ")}</p>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-2 p-3">
            <h2 className="text-sm font-semibold">Группы / события</h2>
            {data?.groups.map((group) => (
              <Link key={group.id} href={`/events/${group.id}`} className="block rounded-xl border border-border p-2 text-sm">
                <p>{group.title}</p>
                <p className="text-xs text-muted">{group.city} · {new Date(group.event_date).toLocaleDateString("ru-RU")}</p>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
