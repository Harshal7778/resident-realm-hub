import { Link, useRouterState } from "@tanstack/react-router";
import {
  CalendarDays,
  Home,
  IndianRupee,
  MoreHorizontal,
  Package,
  User as UserIcon,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { isStaffRole } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import type { Role } from "@/types/domain";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

const MEMBER_NAV: NavItem[] = [
  { label: "Home", to: "/dashboard", icon: Home },
  { label: "Events", to: "/events", icon: CalendarDays },
  { label: "Payments", to: "/payments", icon: Wallet },
  { label: "Inventory", to: "/inventory", icon: Package },
  { label: "Profile", to: "/profile", icon: UserIcon },
];

const STAFF_NAV: NavItem[] = [
  { label: "Home", to: "/dashboard", icon: Home },
  { label: "Events", to: "/events", icon: CalendarDays },
  { label: "Finance", to: "/finance", icon: IndianRupee },
  { label: "Inventory", to: "/inventory", icon: Package },
  { label: "More", to: "/more", icon: MoreHorizontal },
];

export function navItemsForRole(role: Role): NavItem[] {
  return isStaffRole(role) ? STAFF_NAV : MEMBER_NAV;
}

export function BottomNavigation({ role }: { role: Role }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const items = navItemsForRole(role);

  return (
    <nav
      aria-label="Primary"
      className="sticky bottom-0 z-30 grid grid-cols-5 border-t border-border bg-background pb-[env(safe-area-inset-bottom)]"
    >
      {items.map(({ label, to, icon: Icon }) => {
        const active = pathname === to;
        return (
          <Link
            key={to}
            to={to}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium transition-colors",
              active ? "text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span
              className={cn(
                "flex h-7 w-12 items-center justify-center rounded-full transition-colors",
                active && "bg-primary/10",
              )}
            >
              <Icon className="h-5 w-5" />
            </span>
            <span className="truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
