import { Link } from "@tanstack/react-router";
import { Bell, CalendarDays, Package, Users, Wallet } from "lucide-react";

import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { User } from "@/types/domain";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export function MemberDashboard({ user }: { user: User }) {
  const firstName = user.name.split(" ")[0];

  return (
    <div className="space-y-4">
      <section className="rounded-2xl bg-primary p-4 text-primary-foreground">
        <p className="text-sm opacity-90">{greeting()},</p>
        <h2 className="text-xl font-semibold">{firstName} 👋</h2>
        <p className="mt-2 inline-flex rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-medium">
          House {user.houseNumber}
        </p>
      </section>

      <Link to="/events" className="block rounded-2xl border border-border bg-card p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">Upcoming event</p>
            <p className="truncate text-base font-semibold text-foreground">Diwali Function 2026</p>
          </div>
          <StatusBadge label="Upcoming" tone="info" />
        </div>
      </Link>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Pending contribution" value="₹500" icon={Wallet} tone="warning" />
        <StatCard label="Upcoming meeting" value="25 Aug" hint="8:00 PM" icon={Users} />
        <StatCard label="Inventory request" value="1 pending" icon={Package} />
        <StatCard label="Notices" value="2 unread" icon={Bell} />
      </div>

      <p className="flex items-center gap-2 rounded-2xl bg-muted p-3 text-xs text-muted-foreground">
        <CalendarDays className="h-4 w-4 shrink-0" />
        Demo values — module data arrives in the next phase.
      </p>
    </div>
  );
}
