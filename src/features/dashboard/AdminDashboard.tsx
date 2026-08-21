import { useNavigate } from "@tanstack/react-router";
import {
  Bell,
  CalendarDays,
  CalendarPlus,
  IndianRupee,
  Package,
  PackagePlus,
  ReceiptText,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ROLE_LABEL } from "@/lib/permissions";
import type { User } from "@/types/domain";

interface QuickAction {
  label: string;
  icon: LucideIcon;
}

const quickActions: QuickAction[] = [
  { label: "Create Event", icon: CalendarPlus },
  { label: "Record Payment", icon: Wallet },
  { label: "Add Expense", icon: ReceiptText },
  { label: "Create Meeting", icon: Users },
  { label: "Create Notice", icon: Bell },
  { label: "Add Inventory", icon: PackagePlus },
];

export function AdminDashboard({ user, memberCount }: { user: User; memberCount: number }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <section className="rounded-2xl bg-primary p-4 text-primary-foreground">
        <p className="text-sm opacity-90">Green Valley Society</p>
        <h2 className="text-xl font-semibold">{user.name}</h2>
        <p className="mt-2 inline-flex rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-medium">
          {ROLE_LABEL[user.role]} • House {user.houseNumber}
        </p>
      </section>

      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">Current event</p>
            <p className="truncate text-base font-semibold text-foreground">Diwali Function 2026</p>
          </div>
          <StatusBadge label="Active" tone="success" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Members"
          value={String(memberCount)}
          icon={Users}
          onClick={() => navigate({ to: "/members" })}
        />
        <StatCard label="Expected" value="₹25,000" icon={IndianRupee} />
        <StatCard label="Collected" value="₹23,500" tone="positive" />
        <StatCard label="Pending" value="₹1,500" tone="warning" />
        <StatCard label="Extra" value="₹1,500" />
        <StatCard label="Expenses" value="₹12,000" />
        <StatCard label="Balance" value="₹13,000" tone="positive" />
        <StatCard label="Pending returns" value="2" icon={Package} />
      </div>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-foreground">Quick actions</h3>
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              onClick={() => navigate({ to: "/coming-soon" })}
              className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-card px-2 py-3 text-center text-xs font-medium text-foreground transition-colors hover:bg-accent"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </span>
              {label}
            </button>
          ))}
        </div>
      </section>

      <p className="flex items-center gap-2 rounded-2xl bg-muted p-3 text-xs text-muted-foreground">
        <CalendarDays className="h-4 w-4 shrink-0" />
        Financial figures are demo values until the finance module lands.
      </p>
    </div>
  );
}
