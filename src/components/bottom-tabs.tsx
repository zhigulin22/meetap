"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/feed", label: "Feed", icon: Home },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/contacts", label: "Contacts", icon: Search },
  { href: "/profile/me", label: "Profile", icon: User },
];

export function BottomTabs() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 mx-auto flex max-w-md items-center justify-around border-t border-border bg-[#070a22]/90 px-2 pb-4 pt-2 backdrop-blur xl:max-w-lg">
      {tabs.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex min-w-16 flex-col items-center gap-1 rounded-xl px-2 py-1 text-[11px]",
              active ? "text-action" : "text-muted",
            )}
          >
            <Icon className="h-5 w-5" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
