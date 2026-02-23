"use client";

import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageShell } from "@/components/page-shell";
import { EventCard } from "@/components/event-card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api-client";

type EventsResponse = {
  items: Array<{
    id: string;
    title: string;
    description: string;
    outcomes: string[];
    cover_url: string | null;
    event_date: string;
    price: number;
    participants: Array<{ id: string; avatar_url: string | null }>;
  }>;
};

export default function EventsPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["events"],
    queryFn: () => api<EventsResponse>("/api/events"),
  });

  async function join(id: string) {
    try {
      await api(`/api/events/${id}/join`, { method: "POST" });
      toast.success("Ты в списке участников");
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка");
    }
  }

  return (
    <PageShell>
      <h1 className="mb-3 text-2xl font-semibold">Мероприятия</h1>
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-56 w-full" />
        </div>
      ) : (
        <div className="space-y-3">
          {data?.items.map((event) => (
            <EventCard key={event.id} event={event} onJoin={join} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
