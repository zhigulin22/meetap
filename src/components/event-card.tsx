import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Event = {
  id: string;
  title: string;
  description: string;
  cover_url: string | null;
  event_date: string;
  price: number;
  participants: Array<{ id: string; avatar_url: string | null }>;
};

export function EventCard({ event, onJoin }: { event: Event; onJoin: (id: string) => void }) {
  return (
    <Card>
      <CardContent className="space-y-3 p-3">
        <Image src={event.cover_url || "https://placehold.co/1200x700"} alt={event.title} width={1200} height={700} className="h-40 w-full rounded-xl object-cover" unoptimized />
        <h3 className="text-lg font-semibold">{event.title}</h3>
        <p className="line-clamp-2 text-sm text-muted">{event.description}</p>
        <p className="text-xs text-muted">{new Date(event.event_date).toLocaleString("ru-RU")} · {event.price === 0 ? "Бесплатно" : `${event.price} ₽`}</p>
        <div className="flex -space-x-2">
          {event.participants.slice(0, 5).map((p, idx) => (
            <Image key={`${p.id}-${idx}`} src={p.avatar_url || "https://placehold.co/100"} alt="avatar" width={100} height={100} className="h-7 w-7 rounded-full border border-border object-cover" unoptimized />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Link href={`/events/${event.id}`}>
            <Button variant="secondary" className="w-full">Открыть</Button>
          </Link>
          <Button className="w-full" onClick={() => onJoin(event.id)}>Я иду</Button>
        </div>
      </CardContent>
    </Card>
  );
}
