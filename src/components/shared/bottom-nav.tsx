"use client";

import type * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, History, Home, LayoutTemplate } from "lucide-react";
import { NAV_ITEMS, type NavItem } from "@/config/site";
import { cn } from "@/lib/utils";

const ICONS: Record<NavItem["icon"], React.ComponentType<{ className?: string }>> = {
  Home,
  History,
  LayoutTemplate,
  BarChart3,
};

export function BottomNav() {
  const pathname = usePathname();

  if (pathname.startsWith("/nueva-compra")) return null;

  return (
    <nav
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-sm"
      aria-label="Navegación principal"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.icon];
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex min-h-[56px] flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[11px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className={cn("size-6", isActive && "fill-primary/10")} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
