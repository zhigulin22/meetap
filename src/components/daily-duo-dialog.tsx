"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api-client";

export function DailyDuoDialog({ open, onOpenChange, onDone }: { open: boolean; onOpenChange: (v: boolean) => void; onDone: () => void; }) {
  const [front, setFront] = useState<File | null>(null);
  const [back, setBack] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!front || !back) {
      toast.error("Нужно загрузить 2 фото: front и back");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("front", front);
      fd.append("back", back);
      fd.append("caption", caption);
      await api<{ success: boolean }>("/api/feed/posts/create-daily-duo", { method: "POST", body: fd });
      toast.success("Daily Duo опубликован");
      onOpenChange(false);
      onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка публикации");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Create Daily Duo</DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        <p className="text-sm text-muted">MVP режим: сделай быстро 2 снимка подряд (front → back). AI проверит минимум 2 лица.</p>
        <Input type="file" accept="image/*" onChange={(e) => setFront(e.target.files?.[0] ?? null)} />
        <Input type="file" accept="image/*" onChange={(e) => setBack(e.target.files?.[0] ?? null)} />
        <Textarea placeholder="Короткая подпись" value={caption} onChange={(e) => setCaption(e.target.value)} />
        <Button onClick={submit} disabled={loading} className="w-full">{loading ? "Публикуем..." : "Опубликовать"}</Button>
      </div>
    </Dialog>
  );
}
