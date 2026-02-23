"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api-client";

export default function ProfilePage() {
  const params = useParams<{ id: string }>();

  const { data } = useQuery({
    queryKey: ["profile", params.id],
    queryFn: () => api<{ profile: any }>(`/api/profile/${params.id}`),
  });

  if (!data) {
    return <PageShell><Card><CardContent className="p-4">Загрузка...</CardContent></Card></PageShell>;
  }

  const p = data.profile;

  return (
    <PageShell>
      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center gap-3">
            <Image src={p.avatar_url || "https://placehold.co/120"} alt={p.name} width={120} height={120} className="h-14 w-14 rounded-full object-cover" unoptimized />
            <div>
              <h1 className="text-xl font-semibold">{p.name}</h1>
              <p className="text-xs text-muted">Level {p.level} · XP {p.xp}</p>
            </div>
          </div>
          <p className="text-sm text-muted">{p.university || "ВУЗ не указан"} · {p.work || "Работа не указана"}</p>
          <div>
            <p className="text-sm font-medium">Интересы</p>
            <p className="text-sm text-muted">{(p.interests || []).join(", ") || "Не заполнено"}</p>
          </div>
          <div>
            <p className="text-sm font-medium">3 факта</p>
            <ul className="list-disc pl-5 text-sm text-muted">
              {(p.facts || []).map((fact: string) => <li key={fact}>{fact}</li>)}
            </ul>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
