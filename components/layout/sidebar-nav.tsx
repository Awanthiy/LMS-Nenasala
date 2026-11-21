"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, LayoutDashboard, UserRound, Users, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/components/layout/nav-config";

const ICONS: Record<string, LucideIcon> = {
  "layout-dashboard": LayoutDashboard,
  "graduation-cap": GraduationCap,
  users: Users,
  "user-round": UserRound,
};

export function SidebarNav({ items, orientation = "vertical" }: { items: NavItem[]; orientation?: "vertical" | "horizontal" }) {
  const pathname = usePathname();
  return (
    <nav className={cn("flex gap-1", orientation === "vertical" ? "flex-col" : "overflow-x-auto")}>
      {items.map((item) => {
        const Icon = ICONS[item.icon] ?? LayoutDashboard;
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}