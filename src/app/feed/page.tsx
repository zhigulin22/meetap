"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { PageShell } from "@/components/page-shell";
import { DailyDuoDialog } from "@/components/daily-duo-dialog";
import { PostCard } from "@/components/post-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api-client";

type FeedPost = {
  id: string;
  type: "daily_duo" | "reel";
  caption: string | null;
  created_at: string;
  user: { id: string; name: string; avatar_url: string | null } | null;
  photos: { front?: string; back?: string; cover?: string };
  reactions: { like: number; connect: number; star: number };
};

type FeedResponse = {
  locked: boolean;
  items: FeedPost[];
};

export default function FeedPage() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("reels");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["feed"],
    queryFn: () => api<FeedResponse>("/api/feed/posts"),
  });

  const reels = useMemo(() => (data?.items ?? []).filter((x) => x.type === "reel"), [data]);
  const duo = useMemo(() => (data?.items ?? []).filter((x) => x.type === "daily_duo"), [data]);

  async function react(postId: string, reactionType: "like" | "connect" | "star") {
    try {
      await api(`/api/feed/posts/${postId}/react`, {
        method: "POST",
        body: JSON.stringify({ reactionType }),
      });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Reaction error");
    }
  }

  return (
    <PageShell>
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Feed</h1>
        <Button size="sm" onClick={() => setOpen(true)}>New Duo</Button>
      </div>

      <DailyDuoDialog
        open={open}
        onOpenChange={setOpen}
        onDone={() => queryClient.invalidateQueries({ queryKey: ["feed"] })}
      />

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : null}

      {!isLoading && data?.locked ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card>
            <CardContent className="space-y-4 p-5 text-center">
              <h2 className="text-xl font-semibold">Лента заблокирована</h2>
              <p className="text-sm text-muted">Ты не публиковал(а) контент больше 7 дней. Выложи новый Daily Duo, чтобы открыть ленту.</p>
              <Button onClick={() => setOpen(true)} className="w-full">Выложить фото</Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : null}

      {!isLoading && !data?.locked ? (
        <Tabs value={mode} onValueChange={setMode}>
          <TabsList className="mb-3 grid w-full grid-cols-2">
            <TabsTrigger value="reels">Reels</TabsTrigger>
            <TabsTrigger value="duo">Daily Duo</TabsTrigger>
          </TabsList>
          <TabsContent value="reels">
            <div className="space-y-3">
              {reels.map((post) => (
                <PostCard key={post.id} post={post} onReact={react} />
              ))}
              {!reels.length ? <p className="text-sm text-muted">Пока нет reels.</p> : null}
            </div>
          </TabsContent>
          <TabsContent value="duo">
            <div className="space-y-3">
              {duo.map((post) => (
                <PostCard key={post.id} post={post} onReact={react} />
              ))}
              {!duo.length ? <p className="text-sm text-muted">Пока нет Daily Duo.</p> : null}
            </div>
          </TabsContent>
        </Tabs>
      ) : null}
    </PageShell>
  );
}
